import React, { useState, useEffect } from 'react';
import { getFavorites, removeFromFavorites } from '../services/favoritesService.js';

const Favorites = ({ onBackToSearch }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      if (response.success) {
        setFavorites(response.favorites);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      alert('Error loading favorites. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId, productId) => {
    setRemoving(prev => ({ ...prev, [favoriteId]: true }));
    
    try {
      await removeFromFavorites(productId);
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Error removing favorite. Please try again.');
    } finally {
      setRemoving(prev => ({ ...prev, [favoriteId]: false }));
    }
  };

  const groupFavoritesByTitle = () => {
    const grouped = {};
    favorites.forEach(fav => {
      const key = fav.product.title.toLowerCase();
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(fav);
    });
    
    // Sort each group by price
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => {
        const priceA = parseFloat(a.product.price.replace(/[^0-9.]/g, ''));
        const priceB = parseFloat(b.product.price.replace(/[^0-9.]/g, ''));
        return priceA - priceB;
      });
    });
    
    return grouped;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  const groupedFavorites = groupFavoritesByTitle();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ❤️ Your Favorite Deals
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Manage and compare your saved products
          </p>
          <div className="mt-4">
            <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
              {favorites.length} Favorites Saved
            </span>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-12 max-w-md mx-auto">
              <div className="text-6xl mb-6">💔</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                No Favorites Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start adding products to your favorites to see them here!
              </p>
              <button
                onClick={onBackToSearch}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedFavorites).map(([titleKey, groupedFavs]) => (
              <div key={titleKey} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {groupedFavs[0].product.title}
                  </h2>
                  {groupedFavs.length > 1 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {groupedFavs.length} price options found - sorted by price
                    </p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {groupedFavs.map((favorite, index) => (
                    <div
                      key={favorite.id}
                      className="relative rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors duration-300"
                    >
                      {/* Best Price Badge */}
                      {index === 0 && groupedFavs.length > 1 && (
                        <div className="absolute top-3 left-3 z-10">
                          <span className="bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                            💰 Best Price
                          </span>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveFavorite(favorite.id, favorite.productId)}
                        disabled={removing[favorite.id]}
                        className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors duration-200 disabled:opacity-50"
                      >
                        {removing[favorite.id] ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>

                      <a
                        href={favorite.product.viewItemURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={favorite.product.galleryURL || 'https://placehold.co/400x300'}
                          alt={favorite.product.title}
                          className="w-full h-48 object-cover"
                          loading="lazy"
                        />
                        
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {favorite.product.source}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Added {new Date(favorite.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mb-3">
                            {favorite.product.price}
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                            <span>Visit {favorite.product.source}</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
