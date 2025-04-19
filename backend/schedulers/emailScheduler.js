const cron = require('node-cron');
const { sendBillingEmail, sendConsumptionEmail } = require('../services/emailService');
const users = require('../data/users.json'); 
const moment = require('moment');

// Get user consumption data (simulated here)
const getUserConsumptionData = (userId, periodDays = 15) => {
  const usage = Math.floor(Math.random() * 300); // simulate usage
  return usage;
};

// 15-Day Email – Runs on 1st and 16th of each month at 9:00 AM
cron.schedule('0 9 1,16 * *', async () => {
  console.log('[Scheduler] Sending 15-day consumption emails...');
  const currentMonth = moment().format('MMMM');
  const currentYear = moment().format('YYYY');

  for (const user of users) {
    const consumption = getUserConsumptionData(user.id, 15);
    await sendConsumptionEmail({
      name: user.name,
      email: user.email,
      consumption,
      month: currentMonth,
      year: currentYear,
    });
  }
});

// 2-Month Billing Summary Email – Runs every 2 months on the 1st at 9:00 AM
cron.schedule('0 9 1 1,3,5,7,9,11 *', async () => {
  console.log('[Scheduler] Sending 2-month billing summary emails...');
  const currentMonth = moment().format('MMMM');
  const currentYear = moment().format('YYYY');

  for (const user of users) {
    const consumption = getUserConsumptionData(user.id, 60);
    await sendBillingEmail({
      name: user.name,
      email: user.email,
      consumption,
      month: currentMonth,
      year: currentYear,
    });
  }
});

// Export scheduleEmails function
const scheduleEmails = () => {
  console.log('✅ Mail scheduler is running...');
};

module.exports = { scheduleEmails };
