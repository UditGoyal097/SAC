const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Sign up
router.post('/signup', (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Email, password, and confirm password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    if (User.findUserByEmail(email)) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create user
    const user = User.createUser(email, password);
    const token = User.generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = User.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = User.generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        favorites: user.favorites,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = User.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      favorites: user.favorites,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

module.exports = router;
