// routes/notifications.js (or any other route)
const express = require('express');
const router = express.Router();

const { sendBillEmail } = require('../services/emailService');


router.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    await sendEmail(to, subject, text);
    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

module.exports = router;
