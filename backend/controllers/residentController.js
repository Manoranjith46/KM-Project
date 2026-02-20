import Resident from "../models/Resident.js";
import History from "../models/History.js";

// @access  Public (for now)
export const registerResident = async (req, res) => {
  try {
    const { name, phoneNumber, guardianDetails, roomNumber } = req.body;

    // 1. Check if resident already exists (Duplicate Check)
    const residentExists = await Resident.findOne({ phoneNumber });
    if (residentExists) {
      return res.status(400).json({ message: "Resident's or Guardian's phone number already exists" });
    }

    // 2. Create the new resident
    const resident = await Resident.create({
      name,
      phoneNumber,
      guardianDetails,
      roomNumber,
    });

    // 3. Send success response
    if (resident) {
      res.status(201).json({
        _id: resident._id,
        name: resident.name,
        roomNumber: resident.roomNumber,
        msg: "Resident registered successfully"
      });
    } else {
      res.status(400).json({ message: 'Invalid resident data' });
    }

  } catch (error) {
    // 4. Server Error Handler
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
// @route   GET /api/residents/phone/:number
export const getResidentByPhone = async (req, res) => {
    try {
        // Use query instead of params for URLs with '?'
        const { phoneNumber } = req.params; 

        const resident = await Resident.findOne({ phoneNumber });

        if (resident) {
            res.status(200).json(resident);
        } else {
            res.status(404).json({ message: "No resident found with this number" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
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

        await History.create({
            type: 'Resident',
            name: resident.name,
            phoneNumber: resident.phoneNumber,
            checkInDate: resident.joiningDate,
            checkOutDate: checkOut,
            monthlyRate: monthlyRate,
            durationInMonths: parseFloat(monthsStayed.toFixed(2)), // e.g., 1.52 months
            totalAmountPaid: finalBill,
            aadharUrl: resident.aadharUrl
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

