const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    console.log("Request body:", req.body); 

    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error("Register route error:", error); 
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account is blocked. Please contact administrator.' });
    }

 
    if (user.isLocked) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json({ 
        message: `Account is temporarily locked. Try again in ${remainingTime} minutes.` 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const updatedUser = await User.findById(user._id);
      const attemptsLeft = Math.max(0, 5 - updatedUser.loginAttempts);

      return res.status(400).json({ 
        message: `Invalid credentials. ${attemptsLeft > 0 ? attemptsLeft + ' attempts left.' : 'Account will be locked after next failed attempt.'}` 
      });
    }

    await user.resetLoginAttempts();
    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      isAdmin: req.user.isAdmin
    }
  });
});

module.exports = router;