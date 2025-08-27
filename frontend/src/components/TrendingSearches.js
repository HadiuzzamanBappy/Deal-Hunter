// frontend/src/components/TrendingSearches.js
import React, { useState, useEffect } from 'react';

const TrendingSearches = ({ onSearchClick }) => {
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchTrendingSearches();
  }, []);

  const fetchTrendingSearches = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/suggestions/trending?limit=20`
      );
      const data = await response.json();
      setTrendingSearches(data.trending || []);
    } catch (error) {
      console.error('Error fetching trending searches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchClick = (query) => {
    if (onSearchClick) {
      onSearchClick(query);
    }
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-32"></div>
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (trendingSearches.length === 0) {
    return null;
  }

  const displayedSearches = showAll ? trendingSearches : trendingSearches.slice(0, 8);

  return (
    <div className="mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-xl p-6 border border-white/20 dark:border-gray-700/20 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🔥</span>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Trending Searches
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {displayedSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(search.query)}
                className="px-3 py-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 text-gray-800 dark:text-gray-200 rounded-full text-sm font-medium transition-all duration-200 border border-indigo-500/20 hover:border-indigo-500/40 backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  {search.query}
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                    {search.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          {trendingSearches.length > 8 && (
            <div className="flex justify-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200"
              >
                {showAll ? 'Show Less' : `Show ${trendingSearches.length - 8} More`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrendingSearches;
