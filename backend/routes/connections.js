const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ConnectionRequest = require('../models/ConnectionRequest');

// Submit a new connection request
router.post('/', auth, async (req, res) => {
  try {
    const { requestType, details } = req.body;
    const request = new ConnectionRequest({
      user: req.user.userId,
      requestType,
      details,
    });
    await request.save();
    res.status(201).json({ message: 'Connection request submitted', request });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Retrieve all connection requests for the user
router.get('/', auth, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({ user: req.user.userId });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
