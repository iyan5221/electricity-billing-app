// seedFromCsv.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const User = require('./models/User');

// Object to group rows by customer ID (userId)
const usersById = {};

// Read the CSV file
fs.createReadStream(path.join(__dirname, 'synthetic_data.csv'))
  .pipe(csv())
  .on('data', (row) => {
    // Check that the row has a userId; if missing, log an error and skip
    if (!row.userId || row.userId.trim() === "") {
      console.error("Row missing userId:", row);
      return;
    }
    const uid = row.userId.trim();

    // Initialize group for this userId if not already present
    if (!usersById[uid]) {
      usersById[uid] = {
        userId: uid,
        bills: [],
        totalUsage: 0,
      };
    }

    // Use the provided date directly
    const billDate = new Date(row.date);
    if (isNaN(billDate.getTime())) {
      console.error(`Invalid date for userId ${uid}:`, row);
      return;
    }

    // Parse the electricity usage
    const usage = parseFloat(row.electricityUsage);
    if (isNaN(usage)) {
      console.error(`Invalid electricityUsage for userId ${uid}:`, row);
      return;
    }

    // Add the bill record to the user's group
    usersById[uid].bills.push({
      date: billDate,
      amount: usage,
      status: 'Paid'
    });
    usersById[uid].totalUsage += usage;
  })
  .on('end', async () => {
    try {
      // Connect to MongoDB using the URI from your .env file
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB for CSV seeding");

      // Optionally, clear existing users
      await User.deleteMany({});
      console.log("Existing users cleared.");

      // Process each grouped user (each unique customer)
      for (const uid in usersById) {
        const group = usersById[uid];
        // Generate default name and email based on userId
        const name = `Customer ${uid}`;
        const email = `customer${uid}@example.com`.toLowerCase();

        // Use a default address since CSV doesn't contain one
        const address = "No Address";

        const userData = {
          name,
          email,
          password: "password123", // default password (will be hashed by the pre-save hook)
          address,
          electricityUsage: group.totalUsage,
          bills: group.bills,
          oldUserId: uid  // store original customer id for reference
        };

        const user = new User(userData);
        await user.save();
        console.log(`Saved user: ${email} with ${group.bills.length} bills, total usage: ${group.totalUsage}`);
      }

      console.log("CSV seeding completed.");
      process.exit(0);
    } catch (error) {
      console.error("Error during CSV seeding:", error);
      process.exit(1);
    }
  });
