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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 py-0">
      {/* Sticky Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-indigo-100 dark:border-gray-800 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">❤️</span>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Favorites</span>
        </div>
        <button
          onClick={onBackToSearch}
          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
        >
          ← Back to Search
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-10 mt-10">
          <div className="inline-block px-8 py-6 rounded-3xl shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/20">
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <span>❤️</span> Your Favorite Deals
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">Compare, manage, and shop your saved products</p>
            <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
              {favorites.length} Saved
            </span>
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl p-12 max-w-md mx-auto flex flex-col items-center">
              <img src="https://cdn-icons-png.flaticon.com/512/833/833472.png" alt="No favorites" className="w-24 h-24 mb-6 opacity-80" />
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No Favorites Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">Start adding products to your favorites to see them here!</p>
              <button
                onClick={onBackToSearch}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-md transition-all duration-200"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 ">
            {Object.entries(groupedFavorites).map(([titleKey, groupedFavs]) => (
              <div key={titleKey} className="mb-8">
                {groupedFavs.map((favorite, index) => (
                  <div
                    key={favorite.id}
                    className="flex items-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 px-3 py-2 min-w-[260px] max-w-xs w-full"
                  >
                    <a
                      href={favorite.product.viewItemURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 flex-1"
                    >
                      <img
                        src={favorite.product.galleryURL || 'https://placehold.co/80x80'}
                        alt={favorite.product.title}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-100 dark:border-gray-900"
                        loading="lazy"
                      />
                      <div className="flex flex-col justify-center">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">{favorite.product.title}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{favorite.product.source}</div>
                        <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">{favorite.product.price}</div>
                      </div>
                    </a>
                    <button
                      onClick={() => handleRemoveFavorite(favorite.id, favorite.productId)}
                      disabled={removing[favorite.id]}
                      className="ml-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow transition-colors duration-200 disabled:opacity-50"
                      title="Remove from favorites"
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
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
