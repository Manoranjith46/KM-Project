import Resident from "../models/Resident.js";
import History from "../models/History.js";

// @access  Public (for now)
export const registerResident = async (req, res) => {
  try {
    const { name, phoneNumber, guardianDetails, roomNumber, document } = req.body;

    console.log('Received registration data:', { 
      name, 
      phoneNumber, 
      guardianDetails, 
      roomNumber,
      document: document ? '[Base64 Image Data]' : null 
    });

    // Validate required fields
    if (!name || !phoneNumber || !guardianDetails || !guardianDetails.name || !guardianDetails.phone || !roomNumber) {
      return res.status(400).json({ 
        message: "Please provide all required fields: name, phoneNumber, guardianDetails (name, phone), and roomNumber" 
      });
    }

    // 1. Check if resident already exists (Duplicate Check)
    const residentExists = await Resident.findOne({ phoneNumber });
    if (residentExists) {
      return res.status(400).json({ message: "Resident's phone number already exists" });
    }

    // Check if guardian phone already exists
    const guardianExists = await Resident.findOne({ 'guardianDetails.phone': guardianDetails.phone });
    if (guardianExists) {
      return res.status(400).json({ message: "Guardian's phone number already exists" });
    }

    // 2. Create the new resident
    const resident = await Resident.create({
      name,
      phoneNumber,
      guardianDetails,
      roomNumber,
      document: document || null
    });

    // 3. Send success response
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
    // 4. Server Error Handler
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

        const monthlyRate = 5000;
        const checkIn = new Date(resident.joiningDate);
        const checkOut = new Date();

        // Calculate months (Difference in ms / ms in a month)
        const diffInMs = checkOut - checkIn;
        const monthsStayed = diffInMs / (1000 * 60 * 60 * 24 * 30); 

        const finalBill = Math.round(monthsStayed * monthlyRate);

        const totalExpense = Array.isArray(resident.payments)
          ? resident.payments
            .filter((payment) => payment.status === 'Paid')
            .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0)
          : 0;

        await History.create({
            type: 'Resident',
            name: resident.name,
            phoneNumber: resident.phoneNumber,
            checkInDate: resident.joiningDate,
            checkOutDate: checkOut,
          totalExpense,
          aadharUrl: resident.document || resident.aadharUrl,
          checkoutSummary: {
            monthlyRate,
            durationInMonths: parseFloat(monthsStayed.toFixed(2)),
            estimatedFinalBill: finalBill
          },
          archivedData: resident.toObject()
        });

        // Delete from Active Collection
        await Resident.findOneAndDelete({ phoneNumber });

        res.status(200).json({ message: `Resident ${resident.name} has been checked out successfully` });
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

