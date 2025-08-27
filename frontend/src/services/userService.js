// Simple user service for managing user identification
// In a real app, this would integrate with your authentication system

// Generate a unique user ID (for demo purposes)
export const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
};

// Get or create user ID from localStorage
export const getUserId = () => {
  let userId = localStorage.getItem('deal_hunter_user_id');
  
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem('deal_hunter_user_id', userId);
  }
  
  return userId;
};

// Set user ID (useful for login systems)
export const setUserId = (userId) => {
  localStorage.setItem('deal_hunter_user_id', userId);
};

// Clear user ID (useful for logout)
export const clearUserId = () => {
  localStorage.removeItem('deal_hunter_user_id');
};

// Get user preferences
export const getUserPreferences = () => {
  const prefs = localStorage.getItem('deal_hunter_user_prefs');
  return prefs ? JSON.parse(prefs) : {
    favoriteCategories: [],
    priceRange: { min: 0, max: 1000 },
    preferredSources: ['eBay', 'Daraz']
  };
};

// Save user preferences
export const saveUserPreferences = (preferences) => {
  localStorage.setItem('deal_hunter_user_prefs', JSON.stringify(preferences));
};
