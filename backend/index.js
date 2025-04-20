require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // install if not already: npm install node-fetch
const { scheduleEmails } = require('./schedulers/emailScheduler');
scheduleEmails(); // Start the scheduler

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Register routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/complaints', require('./routes/complaints'));
app.use('/api/account', require('./routes/account'));
app.use('/api/meter-reading', require('./routes/meterReading'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/tariffs', require('./routes/tariffs'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/subsidies', require('./routes/subsidies'));

// Route to call the Flask prediction server
app.post('/predict', async (req, res) => {
  try {
    const flaskRes = await fetch('http://3.83.13.144:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await flaskRes.json();
    res.json(data);
  } catch (err) {
    console.error('Error forwarding to Flask:', err);
    res.status(500).json({ message: 'Prediction service unavailable.' });
  }
});

app.listen(PORT, () => console.log(`Backend server running on port ${PORT}`));
