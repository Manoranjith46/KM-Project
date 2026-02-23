import Resident from '../models/Resident.js';
import Guest from '../models/Guest.js';

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
                dailyMeals: { breakfast: false, lunch: false, dinner: false } // Guests don't have meal status
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
// @route   POST /api/food/toggle
export const toggleFoodStatus = async (req, res) => {
    try {
        const { phoneNumber, mealType } = req.body; // mealType: 'breakfast', 'lunch', or 'dinner'
        
        const resident = await Resident.findOne({ phoneNumber });
        if (!resident) return res.status(404).json({ message: "Resident not found" });

        // Logic to flip the boolean value
        resident.dailyMeals[mealType] = !resident.dailyMeals[mealType];
        await resident.save();

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