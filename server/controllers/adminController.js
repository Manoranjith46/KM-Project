import Resident from '../models/Resident.js';
import History from '../models/History.js';
import Guest from '../models/Guest.js';

export const getRevenueSummary = async (req, res) => {
    try {
        // Resident Revenue (Active + Archived)
        const activeResRev = await Resident.aggregate([
            { $unwind: "$payments" },
            { $match: { "payments.status": "Paid" } },
            { $group: { _id: null, total: { $sum: "$payments.amount" } } }
        ]);

        // Guest Revenue (Active + Archived)
        const activeGuestRev = await Guest.aggregate([
            { $match: { paymentStatus: "Paid" } },
            { $group: { _id: null, total: { $sum: "$amountPaid" } } }
        ]);

        const historyRev = await History.aggregate([
            { $group: { _id: "$type", total: { $sum: "$totalExpense" } } }
        ]);

        res.status(200).json({
            residents: {
                active: activeResRev[0]?.total || 0,
                archived: historyRev.find(h => h._id === 'Resident')?.total || 0
            },
            guests: {
                active: activeGuestRev[0]?.total || 0,
                archived: historyRev.find(h => h._id === 'Guest')?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getPendingPayments = async (req, res) => {
    try {
        const pendingResidents = await Resident.find(
            { "payments.status": "Pending" },
            { name: 1, phoneNumber: 1, roomNumber: 1, "payments.$": 1 }
        );

        const pendingGuests = await Guest.find(
            { paymentStatus: "Pending" },
            { name: 1, phoneNumber: 1, amountPaid: 1 }
        );

        res.status(200).json({
            residentCount: pendingResidents.length,
            guestCount: pendingGuests.length,
            residents: pendingResidents,
            guests: pendingGuests
        });
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

export const resetAllMealToggles = async (req, res) => {
    try {
        // Update all active residents to have all meals set to true
        const result = await Resident.updateMany(
            { isActive: true }, 
            { 
                $set: { 
                    "dailyMeals.breakfast": true, 
                    "dailyMeals.lunch": true, 
                    "dailyMeals.dinner": true 
                } 
            }
        );

        // Also reset active guests
        const guestResult = await Guest.updateMany(
            {}, 
            { 
                $set: { 
                    "dailyMeals.breakfast": true, 
                    "dailyMeals.lunch": true, 
                    "dailyMeals.dinner": true 
                } 
            }
        );

        res.status(200).json({ 
            message: "All meal toggles have been reset to default (ON)",
            residentsAffected: result.modifiedCount,
            guestsAffected: guestResult.modifiedCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};