// backend/routes/meterReading.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/meter-reading - Record a new 15-day consumption reading
router.post('/', auth, async (req, res) => {
  try {
    console.log('Received meter reading request:', req.body);
    const { consumption } = req.body;  // Expecting only consumption from the request

    // Validate consumption: it must be a number and non-negative
    if (consumption === undefined || isNaN(consumption) || consumption < 0) {
      console.error('Invalid input:', req.body);
      return res.status(400).json({ message: 'Invalid input: valid consumption value is required.' });
    }

    // Use the userId from the auth middleware (from the JWT token)
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Update the consumption values:
    // - Add the 15-day consumption to the total electricity usage.
    // - Add to the current cycle's consumption (for 2-month billing).
    // - Store the latest 15-day reading for auto-generated consumption emails.
    user.electricityUsage += consumption;
    user.currentCycleConsumption += consumption;
    user.lastMeterReading = consumption;

    await user.save();
    res.json({
      message: 'Meter reading updated successfully.',
      currentCycleConsumption: user.currentCycleConsumption,
      lastMeterReading: user.lastMeterReading,
    });
  } catch (error) {
    console.error('Error updating meter reading:', error);
    res.status(500).json({ message: 'Server error updating meter reading.' });
  }
});

module.exports = router;
