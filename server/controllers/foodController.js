import Resident from '../models/Resident.js';
import Guest from '../models/Guest.js';
import { getIO } from '../socket.js';

// @desc    Check if a resident is "In" or "Out" for meals
// @route   GET /api/food/status
export const getFoodStatus = async (req, res) => {
    try {
        const { phoneNumber } = req.params;
        const resident = await Resident.findOne({ phoneNumber });

        if (!resident) {
            // If no resident found, check if it's a guest
            const guest = await Guest.findOne({ phoneNumber, checkOutDate: null });
            if (!guest) {
                return res.status(404).json({ message: "Resident or Guest not found" });
            }
            return res.status(200).json({
                name: guest.name,
                dailyMeals: guest.dailyMeals
            });
        }       

        res.status(200).json({
            name: resident.name,
            dailyMeals: resident.dailyMeals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    QR Code Toggle (Flip In/Out status)
// @route   PUT /api/food/toggle
export const toggleFoodStatus = async (req, res) => {
    try {
        const { phoneNumber, mealType } = req.body;
        
        const resident = await Resident.findOne({ phoneNumber });
        if (!resident) return res.status(404).json({ message: "Resident not found" });

        // Logic to flip the boolean value
        resident.dailyMeals[mealType] = !resident.dailyMeals[mealType];
        await resident.save();

        getIO().to(phoneNumber).emit('resident:meals-updated', resident.dailyMeals);

        res.status(200).json({
            message: `${mealType} is now set to ${resident.dailyMeals[mealType] ? 'IN' : 'OUT'}`,
            currentStatus: resident.dailyMeals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Total headcount for the cook
// @route   GET /api/food/count
export const getMealCount = async (req, res) => {
    try {
        const residents = await Resident.find({ isActive: true }); //

        const counts = {
            breakfast: residents.filter(r => r.dailyMeals.breakfast).length,
            lunch: residents.filter(r => r.dailyMeals.lunch).length,
            dinner: residents.filter(r => r.dailyMeals.dinner).length
        };

        res.status(200).json(counts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getDailyFoodReport = async (req, res) => {
    try {
        const today = new Date();
        
        // 1. Filtered Residents (Checks leave schedule)
        const activeResidents = await Resident.find({
            isActive: true,
            $or: [
                { "leaveSchedule.startDate": { $gt: today } },
                { "leaveSchedule.endDate": { $lt: today } },
                { "leaveSchedule.startDate": null }
            ]
        });

        // 2. Filtered Guests (Checked-in guests only)
        const activeGuests = await Guest.find({}); 

        const getCounts = (list) => ({
            breakfast: list.filter(p => p.dailyMeals.breakfast).length,
            lunch: list.filter(p => p.dailyMeals.lunch).length,
            dinner: list.filter(p => p.dailyMeals.dinner).length
        });

        res.status(200).json({
            residentMeals: getCounts(activeResidents),
            guestMeals: getCounts(activeGuests),
            totalMealCount: {
                breakfast: getCounts(activeResidents).breakfast + getCounts(activeGuests).breakfast,
                lunch: getCounts(activeResidents).lunch + getCounts(activeGuests).lunch,
                dinner: getCounts(activeResidents).dinner + getCounts(activeGuests).dinner
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
