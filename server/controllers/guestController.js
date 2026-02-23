import Guest from '../models/Guest.js';
import History from '../models/History.js';

// @desc    Check-in a temporary guest
// @route   POST /api/guests
export const checkInGuest = async (req, res) => {
    try {
        const { name, phoneNumber, aadharUrl, roomNumber } = req.body;
        if(!name || !phoneNumber || !aadharUrl || !roomNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }
        try{
            const existingGuest = await Guest.findOne({ phoneNumber });
            if (existingGuest) {
                return res.status(400).json({ message: "Guest with this phone number already exists" });
            }
        } catch (error) {
            return res.status(500).json({ message: "Error checking existing guest" });
        }
        
        const guest = await Guest.create({
            name,
            phoneNumber,
            aadharUrl,
            roomNumber,
            checkInDate: new Date()
        });

        res.status(201).json(guest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    View all active temporary guests
// @route   GET /api/guests
export const getActiveGuests = async (req, res) => {
    try {
        const { phoneNumber } = req.query;

        if (phoneNumber) {
            const guest = await Guest.findOne({ phoneNumber, checkOutDate: null }); 
            if (!guest) {
                return res.status(404).json({ message: "No guest found with this number" });
            }
            return res.status(200).json(guest);
        }

        const guests = await Guest.find({ checkOutDate: null });
        res.status(200).json(guests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get guest by phone number
// @route   GET /api/guests/search
export const getGuestByPhone = async (req, res) => {
    try {
        const { phoneNumber } = req.params; // Expects ?phoneNumber=9000...
        const guest = await Guest.findOne({ phoneNumber });

        if (guest) {
            res.status(200).json(guest);
        } else {
            res.status(404).json({ message: "No guest found with this number" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Guest details
// @route   PUT /api/guests/:phoneNumber
export const updateGuest = async (req, res) => {
    try {
        const guest = await Guest.findOneAndUpdate(
            { phoneNumber: req.params.phoneNumber },
            req.body,
            { returnDocument: 'after', runValidators: true } // Return the NEW data and check rules
        );

        if (!guest) return res.status(404).json({ message: "Guest not found" });
        res.status(200).json(guest);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Checkout and calculate bill
// @route   PUT /api/guests/checkout?phoneNumber=9000...
export const checkOutGuest = async (req, res) => {
    try {
        const { phoneNumber } = req.params;

        if (!phoneNumber) {
            return res.status(400).json({ message: "phoneNumber is required" });
        }

        // 1. Find the guest in the active collection
        const guest = await Guest.findOne({ phoneNumber });
        if (!guest) return res.status(404).json({ message: "Guest not found" });

        guest.checkOutDate = new Date();
        guest.isCheckedOut = true;

        // Calculate Days: (Current Time - CheckIn Time) converted to days
        const diffTime = Math.abs(guest.checkOutDate - guest.checkInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day

        guest.totalBill = diffDays * 200; // ₹200 per day
        await guest.save();

        // 2. Create the record in the History collection
        await History.create({
            type: 'Guest',
            name: guest.name,
            phoneNumber: guest.phoneNumber,
            checkInDate: guest.checkInDate,
            checkOutDate: guest.checkOutDate || new Date(), // Use current date if not set
            totalAmountPaid: guest.amountPaid || 0,
            aadharUrl: guest.aadharUrl
        });
        
        res.status(200).json({ message: `Guest ${guest.name} has been checked out successfully` });


        // 3. Delete from the active Guest collection
        await Guest.findOneAndDelete({ phoneNumber });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};