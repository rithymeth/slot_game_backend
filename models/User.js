// models/User.js

const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  name: String,
  description: String,
  achieved: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 100 },
  jackpot: { type: Number, default: 500 },
  totalWinnings: { type: Number, default: 0 },
  achievements: [AchievementSchema],
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
});

module.exports = mongoose.model('User', UserSchema);
