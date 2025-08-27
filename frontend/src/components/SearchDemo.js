// frontend/src/components/SearchDemo.js
import React from 'react';

const SearchDemo = ({ onSearchClick }) => {
  const demoSearches = [
    { text: "iPhone 15", icon: "📱", category: "Electronics" },
    { text: "gaming laptop", icon: "💻", category: "Gaming" },
    { text: "wireless headphones", icon: "🎧", category: "Audio" },
    { text: "smart watch", icon: "⌚", category: "Wearables" },
    { text: "coffee maker", icon: "☕", category: "Home" },
    { text: "running shoes", icon: "👟", category: "Sports" }
  ];

  return (
    <div className="mb-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 dark:border-gray-700/20 shadow-xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🚀 Try Smart Search Suggestions
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Click on any suggestion below or start typing in the search bar to see intelligent auto-complete
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {demoSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => onSearchClick(search.text)}
                className="group p-4 bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-xl border border-white/30 dark:border-gray-700/30 transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                    {search.icon}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {search.text}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200/50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                    {search.category}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              ✨ Smart Features:
            </h3>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex items-center gap-2">
                <span>🕒</span> Personal search history
              </div>
              <div className="flex items-center gap-2">
                <span>🔥</span> Trending searches
              </div>
              <div className="flex items-center gap-2">
                <span>⭐</span> Popular products
              </div>
              <div className="flex items-center gap-2">
                <span>📁</span> Category suggestions
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDemo;
