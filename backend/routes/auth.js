// routes/auth.js
require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address, mobileNumber } = req.body;

    // Check if user already exists (using lower-case for consistency)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user. The MongoDB-generated _id will serve as the application user ID.
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      address,
      mobileNumber // optional: store mobile number if provided
    });

    // Save the user (the pre-save hook will hash the password)
    await user.save();

    // Append new user details to CSV file for easy viewing.
    // CSV columns: userId,name,email,password,address,mobileNumber,electricityUsage
    // Note: Storing the plain-text password here is only for demonstration; avoid saving sensitive data in production.
    const csvLine = `${user._id},${user.name},${user.email},${password},${user.address},${mobileNumber || ''},${user.electricityUsage}\n`;
    const csvFilePath = path.join(__dirname, '..', 'users.csv');

    // If the file doesn't exist, write headers first.
    if (!fs.existsSync(csvFilePath)) {
      const headers = 'userId,name,email,password,address,mobileNumber,electricityUsage\n';
      fs.writeFileSync(csvFilePath, headers);
    }
    fs.appendFile(csvFilePath, csvLine, (err) => {
      if (err) {
        console.error("Error appending to CSV file:", err);
      } else {
        console.log("User appended to CSV file.");
      }
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (ensuring email is in lower-case)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compare provided password with stored (hashed) password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Generate a JWT token valid for 1 hour
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
