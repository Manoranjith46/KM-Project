import Resident from '../models/Resident.js';
import History from '../models/History.js';
import Report from '../models/Report.js';
import Announcement from '../models/Announcement.js';
import Property from '../models/Property.js';
import Payment from '../models/Payment.js';
import Kitchen from '../models/Kitchen.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// @desc    Get aggregated dashboard data for admin
// @route   GET /api/admin/dashboard
export const getDashboardData = async (req, res) => {
    try {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

        const todayDay = DAYS[now.getDay()];

        const [
            allResidents,
            property,
            monthPayments,
            openReports,
            todayMenu,
        ] = await Promise.all([
            Resident.find().lean(),
            Property.findOne().lean(),
            Payment.find({
                date: { $gte: monthStart, $lte: monthEnd },
                status: 'approved',
            }).lean(),
            Report.find({ status: { $ne: 'Resolved' } }).lean(),
            Kitchen.findOne({ day: todayDay }).lean(),
        ]);

        // --- Occupancy ---
        const totalBeds = property?.totalBeds || 0;
        const activeResidents = allResidents.filter(r => r.isActive);
        const filledBeds = activeResidents.length;
        const occupancyPercent = totalBeds > 0 ? Math.round((filledBeds / totalBeds) * 100) : 0;

        // --- Revenue this month ---
        const monthRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        // --- Pending payments (residents who have a Pending status in their payments array) ---
        const pendingResidents = allResidents.filter(r =>
            r.type !== 'Guest' && r.payments?.some(p => p.status === 'Pending')
        );

        // --- Open complaints ---
        const openCount = openReports.length;
        const pendingCount = openReports.filter(r => r.status === 'Pending').length;
        const inProgressCount = openReports.filter(r => r.status === 'In Progress').length;

        // --- Meal participation counts ---
        const mealCounts = { breakfast: 0, lunch: 0, dinner: 0 };

        const emptyMeal = { time: '', items: [] };
        const meals = [
            {
                type: 'Breakfast',
                time: todayMenu?.breakfast?.time || '',
                items: todayMenu?.breakfast?.items || [],
                color: 'breakfast',
            },
            {
                type: 'Lunch',
                time: todayMenu?.lunch?.time || '',
                items: todayMenu?.lunch?.items || [],
                color: 'lunch',
            },
            {
                type: 'Dinner',
                time: todayMenu?.dinner?.time || '',
                items: todayMenu?.dinner?.items || [],
                color: 'dinner',
            },
        ];

        // --- Recent payments for activity table ---
        const recentPayments = await Payment.find({ status: 'approved' })
            .sort({ date: -1 })
            .limit(6)
            .lean();

        // Map phone → resident info
        const phoneMap = {};
        for (const r of allResidents) {
            phoneMap[r.phoneNumber] = { name: r.name, roomNumber: r.roomNumber };
        }

        const recentActivity = recentPayments.map(p => ({
            _id: p._id,
            name: p.name,
            roomNumber: phoneMap[p.phoneNumber]?.roomNumber || '-',
            amount: p.amount,
            date: p.date,
            paymentMethod: p.paymentMethod,
        }));

        // --- Recent occupants for quick list ---
        const recentOccupants = allResidents
            .sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate))
            .slice(0, 6)
            .map(r => ({
                _id: r._id,
                name: r.name,
                phoneNumber: r.phoneNumber,
                roomNumber: r.roomNumber,
                type: r.type || 'Resident',
                joiningDate: r.joiningDate,
            }));

        res.status(200).json({
            occupancy: {
                filled: filledBeds,
                total: totalBeds,
                percent: occupancyPercent,
            },
            revenue: monthRevenue,
            pendingPayments: pendingResidents.length,
            complaints: {
                open: openCount,
                pending: pendingCount,
                inProgress: inProgressCount,
            },
            meals,
            recentActivity,
            recentOccupants,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

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
        const reports = await Report.find().sort({ createdAt: -1 }).lean();
        const phones = [...new Set(reports.map(r => r.phoneNumber))];
        const residents = await Resident.find({ phoneNumber: { $in: phones } }, 'phoneNumber roomNumber').lean();
        const roomMap = Object.fromEntries(residents.map(r => [r.phoneNumber, r.roomNumber]));
        const enriched = reports.map(r => ({ ...r, roomNumber: roomMap[r.phoneNumber] || "-" }));
        res.status(200).json(enriched);
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
            { returnDocument: 'after' }
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

