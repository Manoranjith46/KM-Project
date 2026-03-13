import Resident from "../models/Resident.js";
import History from "../models/History.js";
import Report from "../models/Report.js";
import Announcement from "../models/Announcement.js";
import User from "../models/User.js";
import Payment from "../models/Payment.js";
import Info from "../models/Info.js";
import { getIO } from "../socket.js";
import { uploadToGridFS } from "../config/gridfs.js";

const PHONE_REGEX = /^\d{7,15}$/;

const ensureOwnPhoneOrOwner = async (req, phoneNumber) => {
  if (req.user?.role === 'owner') {
    return { allowed: true };
  }

  const requester = await User.findById(req.user?.id).select('mobileNumber');
  if (!requester || requester.mobileNumber !== phoneNumber) {
    return {
      allowed: false,
      status: 403,
      message: 'Access denied. You can only access your own data.',
    };
  }

  return { allowed: true };
};

// @access  Public (for now)
export const registerResident = async (req, res) => {
  try {
    const { name, phoneNumber, roomNumber, type, dob, gender, bloodGroup, joiningDate, monthlyRent, securityDeposit, password } = req.body;
    const guardianDetails = typeof req.body.guardianDetails === 'string'
      ? JSON.parse(req.body.guardianDetails)
      : req.body.guardianDetails;

    // Validate required fields
    if (!name || !phoneNumber || !guardianDetails || !guardianDetails.name || !guardianDetails.phone || !roomNumber || !password) {
      return res.status(400).json({ 
        message: "Please provide all required fields: name, phoneNumber, password, guardianDetails (name, phone), and roomNumber" 
      });
    }

    // 1. Check if resident already exists (Duplicate Check)
    const residentExists = await Resident.findOne({ phoneNumber });
    if (residentExists) {
      return res.status(400).json({ message: "Resident's phone number already exists" });
    }

    // Check if user account already exists
    const userExists = await User.findOne({ mobileNumber: phoneNumber });
    if (userExists) {
      return res.status(400).json({ message: "A user account with this phone number already exists" });
    }

    // Check if guardian phone already exists
    const guardianExists = await Resident.findOne({ 'guardianDetails.phone': guardianDetails.phone });
    if (guardianExists) {
      return res.status(400).json({ message: "Guardian's phone number already exists" });
    }

    // Check room capacity
    const info = await Info.findOne();
    if (info) {
      const roomDef = info.rooms.find(r => r.roomNo.toUpperCase() === roomNumber.toUpperCase());
      if (roomDef) {
        const currentCount = await Resident.countDocuments({ roomNumber: { $regex: new RegExp(`^${roomNumber}$`, 'i') }, isActive: true });
        if (currentCount >= roomDef.maxOccupants) {
          return res.status(400).json({ message: `Room ${roomNumber} is full (${currentCount}/${roomDef.maxOccupants} occupants)` });
        }
      }
    }

    // Upload document to GridFS if provided
    let documentId = null;
    if (req.file) {
      documentId = await uploadToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    // 2. Create the new resident
    const resident = await Resident.create({
      name,
      phoneNumber,
      type: type || 'Resident',
      dob: dob || null,
      gender: gender || 'Male',
      bloodGroup: bloodGroup || null,
      guardianDetails,
      joiningDate: joiningDate || Date.now(),
      roomNumber,
      monthlyRent: (type !== 'Guest' && monthlyRent) ? Number(monthlyRent) : 0,
      securityDeposit: (type !== 'Guest' && securityDeposit) ? Number(securityDeposit) : 0,
      document: documentId ? documentId.toString() : null
    });

    // 3. Create user account for login
    const userRole = type === 'Guest' ? 'guest' : 'resident';
    await User.create({
      name,
      mobileNumber: phoneNumber,
      password,
      role: userRole,
    });

    // 4. Send success response
    if (resident) {
      res.status(201).json({
        _id: resident._id,
        name: resident.name,
        roomNumber: resident.roomNumber,
        message: "Resident registered successfully"
      });
    } else {
      res.status(400).json({ message: 'Invalid resident data' });
    }

  } catch (error) {
    console.error('Error in registerResident:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all active residents
// @route   GET /api/residents
export const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find({ isActive: true });
    if(!residents) {
      return res.status(404).json({ message: "No active residents found" });
    }
    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// handles query parameters (must come before /:id)

// @desc    Get resident by phone number
// @route   GET /api/residents/:phoneNumber
// @access  Private (Owner only)
export const getResidentByPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        // Validate input
        if (!phoneNumber) {
            return res.status(400).json({ message: "Phone number is required" });
        }

        if (!PHONE_REGEX.test(String(phoneNumber))) {
          return res.status(400).json({ message: "Please provide a valid phone number" });
        }

        const accessCheck = await ensureOwnPhoneOrOwner(req, String(phoneNumber));
        if (!accessCheck.allowed) {
          return res.status(accessCheck.status).json({ message: accessCheck.message });
        }

        // Query resident by phone number
        const resident = await Resident.findOne({ phoneNumber });

        if (!resident) {
            return res.status(404).json({ message: "Resident not found" });
        }

        // Return resident data (including document if stored as base64)
        res.status(200).json(resident);
    } catch (error) {
        console.error('Error fetching resident:', error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
};

// @desc    Update resident details
// @route   PUT /api/residents/:id
export const updateResident = async (req, res) => {
    try {
        const resident = await Resident.findOneAndUpdate(
            { phoneNumber: req.params.phoneNumber },
            req.body,
            { returnDocument: 'after', runValidators: true } // Return the NEW data and check rules
        );

        if (!resident) return res.status(404).json({ message: "Resident not found" });
        res.status(200).json(resident);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a resident (Check-out)
// @route   DELETE /api/resident/:phoneNumber
export const deleteResident = async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const resident = await Resident.findOne({ phoneNumber });
        
        if (!resident) {
            return res.status(404).json({ message: "Resident not found" });
        }

        const checkIn = new Date(resident.joiningDate);
        const checkOut = new Date();
        const monthlyRate = resident.monthlyRent || 0;

        // Calculate months stayed
        const diffInMs = checkOut - checkIn;
        const monthsStayed = diffInMs / (1000 * 60 * 60 * 24 * 30);

        const finalBill = Math.round(monthsStayed * monthlyRate);

        // Sum from embedded payments
        const embeddedExpense = Array.isArray(resident.payments)
          ? resident.payments
            .filter((p) => p.status === 'Paid')
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
          : 0;

        // Fetch all payments from Payment collection for this resident
        const paymentRecords = await Payment.find({ phoneNumber }).lean();
        const approvedPayments = paymentRecords.filter(p => p.status === 'approved');
        const paymentCollectionExpense = approvedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        const totalExpense = embeddedExpense + paymentCollectionExpense;

        // Get user account data (exclude password)
        const user = await User.findOne({ mobileNumber: phoneNumber }).select('-password').lean();

        // Build full archived data from resident (plain object)
        const residentData = resident.toObject();

        // Build complete archived record
        const archivedData = {
          resident: residentData,
          user: user || null,
          payments: paymentRecords,
        };

        await History.create({
          type: resident.type || 'Resident',
          name: resident.name,
          phoneNumber: resident.phoneNumber,
          checkInDate: resident.joiningDate,
          checkOutDate: checkOut,
          totalExpense,
          aadharUrl: resident.document || null,
          checkoutSummary: {
            monthlyRate,
            durationInMonths: parseFloat(monthsStayed.toFixed(2)),
            estimatedFinalBill: finalBill,
          },
          archivedData,
        });

        // Delete from all collections
        await Resident.findOneAndDelete({ phoneNumber });
        await User.findOneAndDelete({ mobileNumber: phoneNumber });
        await Payment.deleteMany({ phoneNumber });

        res.status(200).json({ message: `${resident.type || 'Resident'} ${resident.name} has been checked out successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a Resident by Room Number
// @route   GET /api/resident/room/:roomNumber
export const getResidentsByRoom = async (req, res) => {
  try {
    const { roomNumber } = req.params;        
        // Find all active residents in a specific room
        const residents = await Resident.find({ 
            roomNumber: roomNumber.toUpperCase(), 
            isActive: true 
        });

        if (residents.length === 0) {
            return res.status(404).json({ message: `No active residents found in room ${roomNumber}` });
        }

        res.status(200).json(residents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Post Report by Resident
export const registerReport = async (req, res) => {
  try {
    const { name, phoneNumber, category, description, status } = req.body;
    if (!name || !phoneNumber || !category || !description) {
      return res.status(400).json({ message: "Please provide all required fields: name, phoneNumber, category, and description" });
    }

    if (!PHONE_REGEX.test(String(phoneNumber))) {
      return res.status(400).json({ message: "Please provide a valid phone number" });
    }

    const accessCheck = await ensureOwnPhoneOrOwner(req, String(phoneNumber));
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ message: accessCheck.message });
    }

    // Upload photo to GridFS if provided
    let documentId = null;
    if (req.file) {
      documentId = await uploadToGridFS(req.file.buffer, req.file.originalname, req.file.mimetype);
    }

    // 2. Create the new resident
    const report = await Report.create({
      name,
      phoneNumber,
      category,
      description,
      document: documentId ? documentId.toString() : null,
      status: status
    });

    // 3. Send success response
    if (report) {
      getIO().to(phoneNumber).emit('resident:reports-updated');

      res.status(201).json({
        _id: report._id,
        name: report.name,
        phoneNumber: report.phoneNumber,
        message: "Report submitted successfully"
      });
    } else {
      res.status(400).json({ message: 'Failed to Report a Complaint' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Get Report by Resident
export const getReport = async (req, res) => {
  try {

    const { phoneNumber } = req.params;
    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    if (!PHONE_REGEX.test(String(phoneNumber))) {
      return res.status(400).json({ message: "Please provide a valid phone number" });
    }

    const accessCheck = await ensureOwnPhoneOrOwner(req, String(phoneNumber));
    if (!accessCheck.allowed) {
      return res.status(accessCheck.status).json({ message: accessCheck.message });
    }

    const reports = await Report.find({ phoneNumber });

    if (!reports || reports.length === 0) {
      return res.status(404).json({ message: "No reports found for this phone number" });
    }

    res.status(200).json(reports);



  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle gate status (IN HOSTEL / ON LEAVE)
// @route   PUT /api/residents/gate-toggle/:phoneNumber
export const toggleGateStatus = async (req, res) => {
  try {
    const { phoneNumber } = req.params;

    if (!phoneNumber) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Ensure resident/guest can only toggle their own gate status.
    const requester = await User.findById(req.user?.id).select('mobileNumber');
    if (!requester || requester.mobileNumber !== phoneNumber) {
      return res.status(403).json({ message: "Access denied. You can only update your own gate status." });
    }

    const resident = await Resident.findOne({ phoneNumber });
    if (!resident) {
      return res.status(404).json({ message: "Resident not found" });
    }

    // Flip isActive
    resident.isActive = !resident.isActive;

    // Set meals based on new status
    if (resident.isActive) {
      // Coming back → enable all meals
      resident.dailyMeals = { breakfast: true, lunch: true, dinner: true };
    } else {
      // Leaving → disable all meals
      resident.dailyMeals = { breakfast: false, lunch: false, dinner: false };
    }

    await resident.save();

    getIO().to(phoneNumber).emit('resident:gate-updated', {
      isActive: resident.isActive,
      dailyMeals: resident.dailyMeals,
    });

    getIO().emit('participation:updated');

    res.status(200).json({
      message: resident.isActive ? "Welcome back to the hostel" : "Have a safe journey",
      isActive: resident.isActive,
      dailyMeals: resident.dailyMeals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a Announcement for Residents
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).sort({ createdAt: -1 });

    res.status(200).json(announcements);

  }catch (error) {
    console.error('❌ Error in getAnnouncements:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create announcement (admin)
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    getIO().to('residents').emit('announcements:updated');
    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement (admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    getIO().to('residents').emit('announcements:updated');
    res.status(200).json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};