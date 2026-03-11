import Resident from '../models/Resident.js';
import History from '../models/History.js';
import Report from '../models/Report.js';
import Announcement from '../models/Announcement.js';

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

// @desc    Get all reports for admin
// @route   GET /api/admin/reports
export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        res.status(200).json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update report status
// @route   PATCH /api/admin/reports/:id
export const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!report) return res.status(404).json({ message: 'Report not found' });
        res.status(200).json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all announcements for admin
// @route   GET /api/admin/announcements
export const getAdminAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.status(200).json(announcements);
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

