import React, { useState, useEffect } from 'react';
import { toggleFavorite, checkFavoritesStatus } from '../services/favoritesService.js';

const Results = ({ results, allProducts, totalCount, onLoadMore, isLoading, allLoaded }) => {
  const [favorites, setFavorites] = useState({});
  const [loadingFavorites, setLoadingFavorites] = useState({});

  // Check favorite status for all products when they change
  useEffect(() => {
    const checkFavorites = async () => {
      if (allProducts.length > 0) {
        try {
          const statusResponse = await checkFavoritesStatus(allProducts);
          if (statusResponse.success) {
            const favoriteMap = {};
            statusResponse.favoriteStatuses.forEach(status => {
              favoriteMap[status.productId] = status.isFavorited;
            });
            setFavorites(favoriteMap);
          }
        } catch (error) {
          console.error('Error checking favorite statuses:', error);
        }
      }
    };

    checkFavorites();
  }, [allProducts]);

  // Handle favorite toggle
  const handleToggleFavorite = async (e, product) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    
    const productKey = product.itemId || product.title;
    setLoadingFavorites(prev => ({ ...prev, [productKey]: true }));
    
    try {
      const response = await toggleFavorite(product);
      
      if (response.success) {
        setFavorites(prev => ({
          ...prev,
          [productKey]: response.isFavorited
        }));
        
        // Show success message (you can replace with a toast notification)
        console.log(response.isFavorited ? 'Added to favorites!' : 'Removed from favorites!');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Show error message (you can replace with a toast notification)
      alert('Error updating favorites. Please try again.');
    } finally {
      setLoadingFavorites(prev => ({ ...prev, [productKey]: false }));
    }
  };
  if (!results) return null;
  // Find second best by AI logic: next highest price, or next in sorted list (demo logic)
  // ...existing code...
  // Only show summary string, not full JSON
  // Parse summary if it looks like a JSON string
  let summaryText = results.aiSummary || results.summary;
  if (typeof summaryText === 'string' && summaryText.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(summaryText);
      summaryText = parsed.summary || summaryText;
    } catch (e) {
      // Not JSON, use as is
    }
  }
  return (
    <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 dark:from-gray-900/90 dark:via-gray-900/80 dark:to-gray-900/70 rounded-3xl shadow-2xl p-8 mt-16 backdrop-blur-2xl border-2 border-white/40 dark:border-gray-700/40 transition-all duration-300 hover:shadow-3xl">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-pink-900/20 rounded-3xl"></div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 rounded-t-3xl"></div>
      
      <div className="relative z-10">
        {/* AI Summary Section - Redesigned */}
        <div className="relative mb-12 pb-8 border-b border-gradient-to-r from-indigo-200/50 via-purple-200/50 to-pink-200/50 dark:border-gray-700/50">
          {/* Background Pattern */}
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 mb-6">
            {/* AI Icon Container */}
            <div className="flex-shrink-0 relative">
              <div className="p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-xl border-2 border-white/30 dark:border-gray-700/30">
                <div className="text-3xl animate-pulse">🎇</div>
              </div>
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-3xl blur-lg opacity-30 -z-10"></div>
            </div>
            
            {/* Title Section */}
            <div className="flex-1">
              <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Smart Deal Insights
                </span>
              </h2>
              
              {/* Search Term Info - Show refined search if different */}
              {results.refinedSearchTerm && results.refinedSearchTerm !== results.originalSearchTerm && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-600 dark:text-blue-400">🔍</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Searched for: <span className="font-medium text-blue-600 dark:text-blue-400">"{results.refinedSearchTerm}"</span>
                    </span>
                    {results.originalSearchTerm && (
                      <span className="text-gray-500 dark:text-gray-500 text-xs">
                        (refined from "{results.originalSearchTerm}")
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                  💎 AI-Powered Analysis
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm font-bold rounded-full border border-purple-200/50 dark:border-purple-800/50">
                  ⚡ Live Market Data
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 text-pink-700 dark:text-pink-300 text-sm font-bold rounded-full border border-pink-200/50 dark:border-pink-800/50">
                  🎯 Best Deals First
                </span>
              </div>
            </div>
          </div>
          
          {/* Enhanced Summary Content */}
          <div className="relative bg-gradient-to-br from-white/80 via-indigo-50/50 to-purple-50/50 dark:from-gray-800/80 dark:via-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 border border-indigo-200/30 dark:border-indigo-800/30 shadow-lg backdrop-blur-sm">
            <div className="absolute top-4 right-4 flex gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            <p className="text-gray-800 dark:text-gray-200 text-base leading-relaxed font-normal pr-16">
              {summaryText}
            </p>
          </div>
        </div>

        {/* Enhanced Products Section Title */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                🛍️ Top Deals for You
              </h3>
              <span className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-sm font-bold rounded-full border border-green-200/50 dark:border-green-800/50">
                {allProducts.length} Amazing Deals
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>🤖</span>
              <span>AI Curated & Ranked</span>
            </div>
          </div>
        </div>

        {/* Redesigned Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allProducts.map((product, index) => {
            const productKey = product.itemId || product.title;
            const isFavorited = favorites[productKey] || false;
            const isToggling = loadingFavorites[productKey] || false;
            
            return (
              <div
                className="group relative rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600"
                key={product.itemId || index}
              >
                {/* Product Image Container */}
                <div className="relative overflow-hidden">
                  <a
                    href={product.viewItemURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={product.galleryURL || 'https://placehold.co/400x300'}
                      alt={product.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => handleToggleFavorite(e, product)}
                    disabled={isToggling}
                    className={`absolute top-3 left-3 p-2 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300 ${
                      isFavorited
                        ? 'bg-red-500 border-red-400 text-white hover:bg-red-600'
                        : 'bg-white/90 dark:bg-gray-800/90 border-white/30 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                    } ${isToggling ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                  >
                    {isToggling ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill={isFavorited ? "currentColor" : "none"}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={isFavorited ? 0 : 2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Source Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
                      {product.source || 'eBay'}
                    </span>
                  </div>

                  {/* Best Deal Badges */}
                  <div className="absolute bottom-3 left-3 right-3">
                    {product.label === 'Best Choice' && (
                      <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                        🏆 Best Deal
                      </span>
                    )}
                    {product.label === 'Second Best' && (
                      <span className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                        🎗 Top Value
                      </span>
                    )}
                  </div>

                  {/* Hover Overlay with External Link Icon - Removed to prevent blocking favorite button */}
                  <a
                    href={product.viewItemURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 z-10"
                  >
                    <div className="bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                </div>

                {/* Product Content */}
                <div className="p-4">
                  <a
                    href={product.viewItemURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                      {product.title}
                    </h3>
                    
                    {/* Price and Redirect Info */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {product.price}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
                        <span className="text-xs font-medium">Visit {product.source || 'eBay'}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Favorite Status Indicator */}
                  {isFavorited && (
                    <div className="mt-2 flex items-center justify-center gap-2 text-red-500 dark:text-red-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span className="text-xs font-medium">Added to Favorites</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Load More Section */}
        {!allLoaded && (
          <div className="flex flex-col items-center mt-16 space-y-6">
            <button
              className="group relative px-10 py-5 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-3xl shadow-2xl transition-all duration-500 hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden border border-white/20"
              onClick={onLoadMore}
              disabled={isLoading}
            >
              {/* Enhanced Button Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 rounded-3xl"></div>
              
              <span className="relative flex items-center gap-3 text-base font-semibold">
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Finding More Deals...</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl">🎁</span>
                    <span>Discover More Deals</span>
                  </>
                )}
              </span>
            </button>
            
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/30 dark:border-gray-700/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-medium">
                Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{allProducts.length}</span> of <span className="font-bold text-purple-600 dark:text-purple-400">{totalCount}</span> amazing deals
              </p>
            </div>
          </div>
        )}
        
        {allLoaded && totalCount > 0 && (
          <div className="flex flex-col items-center mt-16 space-y-4">
            <div className="relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-green-200/50 dark:border-green-800/50 rounded-3xl shadow-lg backdrop-blur-sm">
              <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-700 dark:text-green-300 font-semibold flex items-center gap-3 text-base">
                <span className="text-xl">🎉</span>
                Mission Accomplished! All {totalCount} deals explored!
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center font-medium">
              You've discovered every amazing deal available for this search 🕵️‍♂️
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;
