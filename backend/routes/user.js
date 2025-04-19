// backend/routes/user.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { sendBillingEmail } = require('../services/emailService');

// Helper function: Check if a bill was generated within the last 2 months
function billGeneratedRecently(bills) {
  if (bills.length === 0) return false;
  const lastBillDate = new Date(bills[bills.length - 1].date);
  const now = new Date();
  const diffMonths = (now.getFullYear() - lastBillDate.getFullYear()) * 12 + (now.getMonth() - lastBillDate.getMonth());
  return diffMonths < 2;
}

// GET /api/user/dashboard - Retrieves the dashboard details for the logged-in user
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      console.error(`User not found for id: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/user/bill - Generates a new bill (every 2 months)
router.post('/bill', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Check if a bill was generated within the last 2 months
    if (billGeneratedRecently(user.bills)) {
      return res.status(400).json({ message: 'Bill for this cycle has already been generated.' });
    }

    // Use the cumulative consumption recorded in the current cycle
    const cycleConsumption = user.currentCycleConsumption;

    // Apply TANGEDCO billing rules: first 100 units free, units beyond that cost ₹7 each
    let billAmount = 0;
    if (cycleConsumption > 100) {
      billAmount = (cycleConsumption - 100) * 7;
    }

    // Create a new bill record with the consumption of this cycle
    const newBill = { amount: billAmount, status: 'Pending', date: new Date(), consumption: cycleConsumption };

    // Add new bill and reset current cycle consumption
    user.bills.push(newBill);
    user.currentCycleConsumption = 0;
    await user.save();

    res.json({ message: 'Bill generated successfully.', bill: newBill });
  } catch (error) {
    console.error('Error generating bill:', error);
    res.status(500).json({ message: 'Server error during bill generation.' });
  }
});

// POST /api/user/send-bill-email - Sends an email for the current (latest) bill
router.post('/send-bill-email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (!user.bills || user.bills.length === 0) {
      return res.status(400).json({ message: 'No bill available to send email for.' });
    }
    const latestBill = user.bills[user.bills.length - 1];

    // Extract billing month and year from the bill date
    const billDate = new Date(latestBill.date);
    const month = billDate.toLocaleString('default', { month: 'long' });
    const year = billDate.getFullYear();

    // Prepare email data: current cycle consumption and calculated bill amount
    const emailData = {
      name: user.name,
      email: user.email,
      consumption: latestBill.consumption, // consumption used for billing in this cycle (in kWh)
      billAmount: latestBill.amount,         // bill amount in rupees
      month,
      year,
    };

    console.log(`Attempting to send bill email to ${user.email} with data:`, emailData);
    await sendBillingEmail(emailData);
    console.log(`Email sent successfully to ${user.email}`);
    res.json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending bill email:', error);
    res.status(500).json({ message: 'Server error while sending email.' });
  }
});
// POST /api/user/send-consumption-email - Sends an auto-generated email with current 15-day consumption
router.post('/send-consumption-email', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.error(`User not found for id: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found.' });
    }
    
    // Ensure that the user model has a field 'lastMeterReading'
    const consumption = user.lastMeterReading;
    if (typeof consumption !== 'number' || consumption <= 0) {
      return res.status(400).json({ message: 'No valid 15-day consumption reading available.' });
    }
    
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    
    // Prepare email data with current 15-day consumption only
    const emailData = {
      name: user.name,
      email: user.email,
      consumption,  // consumption for the latest 15 days
      month,
      year,
    };
    
    console.log(`Attempting to send consumption email to ${user.email} with data:`, emailData);
    
    // sendConsumptionEmail should be defined in your emailService.js
    await sendConsumptionEmail(emailData);
    
    console.log(`Consumption email sent successfully to ${user.email}`);
    res.json({ message: 'Consumption email sent successfully.' });
  } catch (error) {
    console.error('Error sending consumption email:', error);
    res.status(500).json({ message: 'Server error while sending consumption email.' });
  }
});


module.exports = router;
