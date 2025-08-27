import fs from 'fs/promises';
import path from 'path';

const FAVORITES_FILE = path.join(process.cwd(), 'data', 'favorites.json');

// Initialize favorites file if it doesn't exist
async function initializeFavoritesFile() {
  try {
    await fs.access(FAVORITES_FILE);
  } catch (error) {
    // File doesn't exist, create it
    await fs.mkdir(path.dirname(FAVORITES_FILE), { recursive: true });
    await fs.writeFile(FAVORITES_FILE, JSON.stringify({ favorites: [] }, null, 2));
  }
}

// Generate a unique product ID from product data
function generateProductId(product) {
  // Use itemId if available, otherwise create from title + price + source
  if (product.itemId) {
    return `${product.source || 'unknown'}_${product.itemId}`;
  }
  
  // Fallback: create hash from title + price + source
  const identifier = `${product.title}_${product.price}_${product.source || 'unknown'}`;
  return identifier.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
}

// Get all favorites for a user
export async function getUserFavorites(userId) {
  try {
    await initializeFavoritesFile();
    const data = await fs.readFile(FAVORITES_FILE, 'utf8');
    const favoritesData = JSON.parse(data);
    
    return favoritesData.favorites.filter(fav => fav.userId === userId);
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return [];
  }
}

// Add product to favorites
export async function addToFavorites(userId, product) {
  try {
    await initializeFavoritesFile();
    const data = await fs.readFile(FAVORITES_FILE, 'utf8');
    const favoritesData = JSON.parse(data);
    
    const productId = generateProductId(product);
    
    // Check if already in favorites
    const existingFavorite = favoritesData.favorites.find(
      fav => fav.userId === userId && fav.productId === productId
    );
    
    if (existingFavorite) {
      return { success: false, message: 'Product already in favorites' };
    }
    
    // Add to favorites
    const favoriteEntry = {
      id: Date.now().toString(),
      userId,
      productId,
      addedAt: new Date().toISOString(),
      product: {
        title: product.title,
        price: product.price,
        source: product.source || 'eBay',
        galleryURL: product.galleryURL,
        viewItemURL: product.viewItemURL,
        itemId: product.itemId
      }
    };
    
    favoritesData.favorites.push(favoriteEntry);
    await fs.writeFile(FAVORITES_FILE, JSON.stringify(favoritesData, null, 2));
    
    return { success: true, favorite: favoriteEntry };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return { success: false, message: 'Error adding to favorites' };
  }
}

// Remove product from favorites
export async function removeFromFavorites(userId, productId) {
  try {
    await initializeFavoritesFile();
    const data = await fs.readFile(FAVORITES_FILE, 'utf8');
    const favoritesData = JSON.parse(data);
    
    const initialLength = favoritesData.favorites.length;
    favoritesData.favorites = favoritesData.favorites.filter(
      fav => !(fav.userId === userId && fav.productId === productId)
    );
    
    if (favoritesData.favorites.length === initialLength) {
      return { success: false, message: 'Product not found in favorites' };
    }
    
    await fs.writeFile(FAVORITES_FILE, JSON.stringify(favoritesData, null, 2));
    return { success: true, message: 'Product removed from favorites' };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return { success: false, message: 'Error removing from favorites' };
  }
}

// Check if product is favorited by user
export async function isProductFavorited(userId, product) {
  try {
    const userFavorites = await getUserFavorites(userId);
    const productId = generateProductId(product);
    
    return userFavorites.some(fav => fav.productId === productId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

// Get favorite products with comparison data
export async function getFavoritesWithComparison(userId) {
  try {
    const userFavorites = await getUserFavorites(userId);
    
    // Group by product title for comparison
    const grouped = userFavorites.reduce((acc, fav) => {
      const key = fav.product.title.toLowerCase();
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(fav);
      return acc;
    }, {});
    
    // Add comparison insights
    Object.keys(grouped).forEach(key => {
      const products = grouped[key];
      if (products.length > 1) {
        // Sort by price for comparison
        products.sort((a, b) => {
          const priceA = parseFloat(a.product.price.replace(/[^0-9.]/g, ''));
          const priceB = parseFloat(b.product.price.replace(/[^0-9.]/g, ''));
          return priceA - priceB;
        });
        
        products.forEach((product, index) => {
          if (index === 0) {
            product.comparisonNote = 'Best Price';
          } else {
            product.comparisonNote = 'Higher Price';
          }
        });
      }
    });
    
    return userFavorites;
  } catch (error) {
    console.error('Error getting favorites with comparison:', error);
    return [];
  }
}
