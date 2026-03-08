import Resident from '../models/Resident.js';
import History from '../models/History.js';

// @desc    Get all occupants (residents + guests) for admin directory
// @route   GET /api/admin/occupants
export const getAllOccupants = async (req, res) => {
    try {
        const all = await Resident.find().lean();

        const residents = all.filter(r => r.type !== 'Guest');
        const guests = all.filter(r => r.type === 'Guest');

        const occupants = all.map(r => ({
            _id: r._id,
            name: r.name,
            phoneNumber: r.phoneNumber,
            roomNumber: r.roomNumber,
            type: r.type || 'Resident',
            joiningDate: r.joiningDate,
        }));

        res.status(200).json({
            total: all.length,
            totalResidents: residents.length,
            totalGuests: guests.length,
            occupants,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRevenueSummary = async (req, res) => {
    try {
        // Resident Revenue (Active + Archived)
        const activeResRev = await Resident.aggregate([
            { $match: { type: { $ne: 'Guest' } } },
            { $unwind: "$payments" },
            { $match: { "payments.status": "Paid" } },
            { $group: { _id: null, total: { $sum: "$payments.amount" } } }
        ]);

        // Guest Revenue (from Resident collection, type=Guest)
        const activeGuestRev = await Resident.aggregate([
            { $match: { type: 'Guest' } },
            { $unwind: "$payments" },
            { $match: { "payments.status": "Paid" } },
            { $group: { _id: null, total: { $sum: "$payments.amount" } } }
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
            { type: { $ne: 'Guest' }, "payments.status": "Pending" },
            { name: 1, phoneNumber: 1, roomNumber: 1, "payments.$": 1 }
        );

        const pendingGuests = await Resident.find(
            { type: 'Guest', "payments.status": "Pending" },
            { name: 1, phoneNumber: 1, roomNumber: 1, "payments.$": 1 }
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

