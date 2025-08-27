import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  checkFavoritesStatus
} from '../controllers/favoritesController.js';

const router = express.Router();

// Get user's favorites
router.get('/user/:userId', getFavorites);

// Add product to favorites
router.post('/add', addFavorite);

// Remove product from favorites
router.post('/remove', removeFavorite);

// Toggle favorite status (add/remove)
router.post('/toggle', toggleFavorite);

// Check favorite status for multiple products
router.post('/check-status', checkFavoritesStatus);

export default router;
