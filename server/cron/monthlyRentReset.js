import cron from 'node-cron';
import Resident from '../models/Resident.js';
import Info from '../models/Info.js';

// Runs at 23:59 on the last day of every month
// Cron: minute 59, hour 23, days 28-31, every month
// The condition inside ensures it only fires on the actual last day
export function startMonthlyRentReset() {
  cron.schedule('59 23 28-31 * *', async () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    if (today.getDate() !== lastDay) return;

    try {
      const info = await Info.findOne();
      if (!info || !info.monthly) {
        console.error('[Cron] Monthly rent reset skipped — no default rate found in Info collection');
        return;
      }

      const defaultRent = Number(info.monthly);

      const result = await Resident.updateMany(
        { isActive: true, type: 'Resident' },
        { $set: { monthlyRent: defaultRent } }
      );

      console.log(`[Cron] Monthly rent reset to ₹${defaultRent} for ${result.modifiedCount} resident(s)`);
    } catch (error) {
      console.error('[Cron] Monthly rent reset failed:', error.message);
    }
  });

  console.log('[Cron] Monthly rent reset job scheduled');
}
