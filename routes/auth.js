// routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const validator = require('validator');

const jwtSecret = process.env.JWT_SECRET;

// Rate limiter for login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: { message: 'Too many login attempts. Please try again later.' }
});

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Password validation
    if (!validator.isStrongPassword(password, { minSymbols: 0 })) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with default achievements
    const newUser = new User({
      username,
      password: hashedPassword,
      achievements: [
        { name: 'First Spin', description: 'Complete your first spin.' },
        { name: 'Big Winner', description: 'Win a jackpot.' },
        { name: 'High Roller', description: 'Place a bet of $100 or more.' }
      ]
    });
    await newUser.save();

    res.status(201).json({ message: 'User created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login Route
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(403).json({ message: 'Account is locked. Please try again later.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      // Lock account if too many failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000; // Lock for 15 minutes
      }

      await user.save();
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Reset failed login attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // Create token
    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        username: user.username,
        balance: user.balance,
        jackpot: user.jackpot,
        totalWinnings: user.totalWinnings,
        achievements: user.achievements
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
