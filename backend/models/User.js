const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define a schema for bill records
const BillSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  amount: Number,
  consumption: Number,  // New: Store the consumption for this bill cycle
  status: { type: String, default: 'Pending' }
});

// Define the main User schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },                  // User's name
  email: { type: String, required: true, unique: true },   // Email (used for login)
  password: { type: String, required: true },              // Hashed password
  address: { type: String, required: true },               // Residential address
  electricityUsage: { type: Number, default: 0 },          // Total electricity usage
  currentCycleConsumption: { type: Number, default: 0 },   // New: Stores usage for the 2-month cycle
  lastMeterReading: { type: Number, default: 0 },          // New: Stores last 15-day reading
  bills: [BillSchema],                                     // Array of bill records
  oldUserId: { type: String }                              // Optional: original CSV userId if seeded
});

// Pre-save hook to hash the password if it has been modified or if new
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare a provided password with the stored hashed password
UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
  