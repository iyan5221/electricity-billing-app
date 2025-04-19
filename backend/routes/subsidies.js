const express = require('express');
const router = express.Router();

// GET subsidy/rebate schemes
router.get('/', (req, res) => {
  const subsidies = [
    { scheme: 'Low Income Subsidy', details: 'Subsidy available for low-income households.' },
    { scheme: 'Senior Citizen Rebate', details: 'Discount available for senior citizens.' },
    // Add more schemes as needed.
  ];
  res.json(subsidies);
});

module.exports = router;
