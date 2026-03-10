import Kitchen from '../models/Kitchen.js';
import Resident from '../models/Resident.js';
import { getIO } from '../socket.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getTodayDay = () => DAYS[new Date().getDay()];
const getTomorrowDay = () => DAYS[(new Date().getDay() + 1) % 7];

// @desc    Get menu for a specific day (defaults to today's day name)
// @route   GET /api/kitchen/menu?day=Monday
export const getMenu = async (req, res) => {
  try {
    const day = req.query.day || getTodayDay();
    const menu = await Kitchen.findOne({ day }).lean();

    if (!menu) {
      return res.status(200).json({
        day,
        breakfast: { time: '', items: [] },
        lunch: { time: '', items: [] },
        dinner: { time: '', items: [] },
      });
    }

    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get menus for all 7 days
// @route   GET /api/kitchen/menu/week
export const getWeekMenu = async (req, res) => {
  try {
    const menus = await Kitchen.find().lean();
    const menuMap = {};
    for (const m of menus) menuMap[m.day] = m;

    const emptyMeal = { time: '', items: [] };
    const week = DAYS.map((day) => menuMap[day] || { day, breakfast: emptyMeal, lunch: emptyMeal, dinner: emptyMeal });

    res.status(200).json(week);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update menu for a specific day
// @route   PUT /api/kitchen/menu
export const upsertMenu = async (req, res) => {
  try {
    const { day, breakfast, lunch, dinner } = req.body;

    if (!day || !DAYS.includes(day)) {
      return res.status(400).json({ message: 'Valid day is required (Sunday–Saturday).' });
    }

    const menu = await Kitchen.findOneAndUpdate(
      { day },
      {
        $set: {
          day,
          breakfast: breakfast || { time: '', items: [] },
          lunch: lunch || { time: '', items: [] },
          dinner: dinner || { time: '', items: [] },
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Broadcast to all connected clients so kitchen pages update in real-time
    getIO().emit('menu:updated', { day, menu });

    res.status(200).json({ message: 'Menu updated successfully.', menu });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get meal participation (willing / not willing) from Resident.dailyMeals
// @route   GET /api/kitchen/participation
export const getParticipation = async (req, res) => {
  try {
    const residents = await Resident.find()
      .select('name phoneNumber roomNumber dailyMeals isActive')
      .lean();

    const getInitials = (name) =>
      name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

    const buildList = (mealKey) => {
      const willing = [];
      const notWilling = [];

      for (const r of residents) {
        const entry = {
          id: r._id,
          name: r.name,
          room: r.roomNumber,
          initials: getInitials(r.name),
        };

        if (r.dailyMeals?.[mealKey]) {
          willing.push(entry);
        } else {
          notWilling.push(entry);
        }
      }

      return { willing, notWilling };
    };

    res.status(200).json({
      breakfast: buildList('breakfast'),
      lunch: buildList('lunch'),
      dinner: buildList('dinner'),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


