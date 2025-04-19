const express = require('express');

const router = express.Router();

const auth = require('../middleware/auth');
const Complaint = require('../models/Complaint');

// Register a new complaint
router.post('/', auth, async (req, res) => {
  try {
    const { subject, description } = req.body;
    const complaint = new Complaint({ user: req.user.userId, subject, description });
    await complaint.save();
    res.status(201).json({ message: 'Complaint registered successfully', complaint });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all complaints for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.userId });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
