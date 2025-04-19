require('dotenv').config();
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI;

// Function to generate 3 past bills (one for each of the last 3 months)
function generateBills() {
  const bills = [];
  const now = new Date();
  for (let i = 1; i <= 3; i++) {
    // Create a bill date for i months ago
    const billDate = new Date(now.getFullYear(), now.getMonth() - i, now.getDate());
    // Generate a random bill amount between 50 and 200
    const amount = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
    bills.push({
      date: billDate,
      amount: amount,
      status: "Paid"
    });
  }
  return bills;
}

// Default users with bills for the past 3 months
const users = [
  { name: 'Alice', email: 'alice@example.com', password: 'password123', address: '123 Main St', electricityUsage: 100, bills: generateBills() },
  { name: 'Bob', email: 'bob@example.com', password: 'password123', address: '456 Elm St', electricityUsage: 150, bills: generateBills() },
  { name: 'Charlie', email: 'charlie@example.com', password: 'password123', address: '789 Oak St', electricityUsage: 200, bills: generateBills() },
  { name: 'David', email: 'david@example.com', password: 'password123', address: '321 Pine St', electricityUsage: 250, bills: generateBills() },
  { name: 'Eve', email: 'eve@example.com', password: 'password123', address: '654 Cedar St', electricityUsage: 300, bills: generateBills() },
  { name: 'Frank', email: 'frank@example.com', password: 'password123', address: '987 Maple St', electricityUsage: 350, bills: generateBills() },
  { name: 'Grace', email: 'grace@example.com', password: 'password123', address: '159 Walnut St', electricityUsage: 400, bills: generateBills() },
  { name: 'Heidi', email: 'heidi@example.com', password: 'password123', address: '753 Birch St', electricityUsage: 450, bills: generateBills() },
  { name: 'Ivan', email: 'ivan@example.com', password: 'password123', address: '852 Spruce St', electricityUsage: 500, bills: generateBills() },
  { name: 'Judy', email: 'judy@example.com', password: 'password123', address: '456 Cherry St', electricityUsage: 550, bills: generateBills() }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB for seeding');
    await User.deleteMany({});
    for (let userData of users) {
      const user = new User(userData);
      await user.save();
    }
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Seeding error:', err);
    process.exit(1);
  });
