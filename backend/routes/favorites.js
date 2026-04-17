const express = require('express');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Get user's favorite cities
router.get('/', authenticateToken, (req, res) => {
  try {
    const user = User.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add favorite city
router.post('/', authenticateToken, (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ error: 'City is required' });
    }

    const user = User.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if city is already favorited
    if (user.favorites.includes(city)) {
      return res.status(400).json({ error: 'City already in favorites' });
    }

    // Add city to favorites
    user.favorites.push(city);
    User.updateUserFavorites(req.user.id, user.favorites);

    res.status(201).json({
      favorites: user.favorites,
      message: `${city} added to favorites`,
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove favorite city
router.delete('/:city', authenticateToken, (req, res) => {
  try {
    const { city } = req.params;
    
    const user = User.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const index = user.favorites.indexOf(decodeURIComponent(city));
    if (index === -1) {
      return res.status(404).json({ error: 'City not in favorites' });
    }

    user.favorites.splice(index, 1);
    User.updateUserFavorites(req.user.id, user.favorites);

    res.json({
      favorites: user.favorites,
      message: `${city} removed from favorites`,
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

module.exports = router;
