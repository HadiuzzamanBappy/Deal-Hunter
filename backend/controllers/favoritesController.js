import {
  getUserFavorites,
  addToFavorites,
  removeFromFavorites,
  isProductFavorited,
  getFavoritesWithComparison
} from '../services/favoritesService.js';

// Get user's favorites
export const getFavorites = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const favorites = await getFavoritesWithComparison(userId);
    
    res.json({
      success: true,
      favorites,
      count: favorites.length
    });
  } catch (error) {
    console.error('Error in getFavorites:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Add product to favorites
export const addFavorite = async (req, res) => {
  try {
    const { userId, product } = req.body;
    
    if (!userId || !product) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and product data are required' 
      });
    }
    
    const result = await addToFavorites(userId, product);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(409).json(result); // 409 Conflict for already exists
    }
  } catch (error) {
    console.error('Error in addFavorite:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Remove product from favorites
export const removeFavorite = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and product ID are required' 
      });
    }
    
    const result = await removeFromFavorites(userId, productId);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(404).json(result); // 404 Not Found
    }
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Toggle favorite status
export const toggleFavorite = async (req, res) => {
  try {
    const { userId, product } = req.body;
    
    if (!userId || !product) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and product data are required' 
      });
    }
    
    // Check if already favorited
    const isFavorited = await isProductFavorited(userId, product);
    
    if (isFavorited) {
      // Remove from favorites
      const productId = `${product.source || 'unknown'}_${product.itemId || product.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
      const result = await removeFromFavorites(userId, productId);
      
      res.json({
        ...result,
        action: 'removed',
        isFavorited: false
      });
    } else {
      // Add to favorites
      const result = await addToFavorites(userId, product);
      
      res.json({
        ...result,
        action: 'added',
        isFavorited: true
      });
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Check favorite status for multiple products
export const checkFavoritesStatus = async (req, res) => {
  try {
    const { userId, products } = req.body;
    
    if (!userId || !Array.isArray(products)) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and products array are required' 
      });
    }
    
    const favoriteStatuses = await Promise.all(
      products.map(async (product) => {
        const isFavorited = await isProductFavorited(userId, product);
        return {
          productId: product.itemId,
          isFavorited
        };
      })
    );
    
    res.json({
      success: true,
      favoriteStatuses
    });
  } catch (error) {
    console.error('Error in checkFavoritesStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
