const express = require('express');
const router = express.Router();
const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Load the model once when the server starts
let model;
(async () => {
  try {
    const modelPath = path.join(__dirname, '../models/lstm_model.h5');
    model = await tf.loadLayersModel(`file://${modelPath}`);
    console.log('Prediction model loaded.');
  } catch (error) {
    console.error('Failed to load model:', error);
  }
})();

// Normalize utility (example scaling between 0 and 1)
const normalize = (value, min = 0, max = 1000) => (value - min) / (max - min);
const denormalize = (value, min = 0, max = 1000) => value * (max - min) + min;

// POST /predict - Get prediction based on user history
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || !user.bills || user.bills.length < 35) {
      return res.status(400).json({ message: 'Not enough historical data (minimum 35 entries required).' });
    }

    // Sort the user's bills chronologically
    const sortedBills = user.bills.sort((a, b) => new Date(a.date) - new Date(b.date));
    const latestBills = sortedBills.slice(-35);

    // Build input shape (35, 24) with zero padding except for the first value
    const inputTensor = tf.tensor2d(
      latestBills.map((bill) => Array(24).fill(normalize(bill.amount))),
      [35, 24]
    ).expandDims(0); // Shape becomes [1, 35, 24]

    // Predict
    const prediction = model.predict(inputTensor);
    const predictedValue = (await prediction.data())[0];
    const finalValue = denormalize(predictedValue); // Scale it back to normal range

    res.json({ prediction: parseFloat(finalValue.toFixed(2)) });
  } catch (err) {
    console.error('Prediction error:', err);
    res.status(500).json({ message: 'Prediction failed.' });
  }
});

module.exports = router;
