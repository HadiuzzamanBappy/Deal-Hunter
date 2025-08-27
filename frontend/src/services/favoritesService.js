import axios from 'axios';
import { getUserId } from './userService.js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Get user's favorites
export const getFavorites = async () => {
  try {
    const userId = getUserId();
    const response = await axios.get(`${API_BASE_URL}/api/favorites/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    throw new Error('Failed to fetch favorites');
  }
};

// Add product to favorites
export const addToFavorites = async (product) => {
  try {
    const userId = getUserId();
    const response = await axios.post(`${API_BASE_URL}/api/favorites/add`, {
      userId,
      product
    });
    return response.data;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    if (error.response?.status === 409) {
      throw new Error('Product is already in your favorites');
    }
    throw new Error('Failed to add to favorites');
  }
};

// Remove product from favorites
export const removeFromFavorites = async (productId) => {
  try {
    const userId = getUserId();
    const response = await axios.post(`${API_BASE_URL}/api/favorites/remove`, {
      userId,
      productId
    });
    return response.data;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    if (error.response?.status === 404) {
      throw new Error('Product not found in favorites');
    }
    throw new Error('Failed to remove from favorites');
  }
};

// Toggle favorite status
export const toggleFavorite = async (product) => {
  try {
    const userId = getUserId();
    const response = await axios.post(`${API_BASE_URL}/api/favorites/toggle`, {
      userId,
      product
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw new Error('Failed to update favorite status');
  }
};

// Check favorite status for multiple products
export const checkFavoritesStatus = async (products) => {
  try {
    const userId = getUserId();
    const response = await axios.post(`${API_BASE_URL}/api/favorites/check-status`, {
      userId,
      products
    });
    return response.data;
  } catch (error) {
    console.error('Error checking favorites status:', error);
    return { success: false, favoriteStatuses: [] };
  }
};

// Generate product ID (same logic as backend)
export const generateProductId = (product) => {
  if (product.itemId) {
    return `${product.source || 'unknown'}_${product.itemId}`;
  }
  
  const identifier = `${product.title}_${product.price}_${product.source || 'unknown'}`;
  return identifier.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
};
