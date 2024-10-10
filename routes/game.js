// routes/game.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Update Game State
router.post('/update', auth, async (req, res) => {
  try {
    const { balance, jackpot, totalWinnings, achievements } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.balance = balance;
    user.jackpot = jackpot;
    user.totalWinnings = totalWinnings;
    user.achievements = achievements;

    await user.save();

    res.json({
      balance: user.balance,
      jackpot: user.jackpot,
      totalWinnings: user.totalWinnings,
      achievements: user.achievements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topPlayers = await User.find()
      .sort({ totalWinnings: -1 })
      .limit(10)
      .select('username totalWinnings');
    res.json(topPlayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
