const express = require('express');
const router = express.Router();

// GET tariff information
router.get('/', (req, res) => {
  const tariffs = {
    residential: { rate: 5.5, unit: 'per kWh' },
    commercial: { rate: 7.2, unit: 'per kWh' },
    industrial: { rate: 8.0, unit: 'per kWh' }
  };
  res.json(tariffs);
});

module.exports = router;
