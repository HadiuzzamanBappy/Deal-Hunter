
import React from 'react';
import UserProfileDropdown from './UserProfileDropdown';

const Header = ({ theme, toggleTheme, maxResults, setMaxResults, sortBy, setSortBy, country, setCountry, onAuthOpen, onFavoritesClick, user }) => (
  <header className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-2xl mb-8 py-10 px-8 text-center transition-all duration-500 backdrop-blur-xl bg-opacity-90 border border-white/30 z-40 overflow-visible">
    {/* Enhanced Background Effects */}
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl"></div>

    {/* User Profile Dropdown - Optimized positioning */}
    <div className="absolute top-6 right-8 z-[100]">
      <UserProfileDropdown onAuthOpen={onAuthOpen} />
    </div>

    {/* Main Content Container */}
    <div className="relative z-10">
      {/* Title Section */}
      <div className="mb-8">
        <h1 className="text-5xl lg:text-6xl font-black mb-4 tracking-tight drop-shadow-2xl">
          <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            Deal Hunter AI
          </span>
        </h1>

        <p className="text-xl lg:text-2xl opacity-95 font-semibold tracking-wide text-blue-100 mb-2">
          🚀 Intelligent Product Search & Analysis
        </p>
        
        {/* Additional message when AI is disabled */}
        {!user && (
          <p className="text-lg opacity-80 font-medium tracking-wide text-yellow-200 mb-2">
            ⚡ Sign in to unlock AI-powered recommendations!
          </p>
        )}
      </div>

      {/* Enhanced Controls Section */}
      <div className="space-y-6">
        {/* Primary Controls Row */}
        <div className="flex flex-wrap justify-center items-center gap-4 lg:gap-6">
          {/* Sort Control */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-white/25 hover:bg-white/35 text-gray-900 dark:text-white border-none outline-none rounded-xl px-4 py-4 text-sm font-bold shadow transition-all duration-200 cursor-pointer min-w-[130px]"
          >
            <option value="relevance">🎯 Relevance</option>
            <option value="price">💰 Price Low-High</option>
            <option value="latest">🆕 Latest First</option>
          </select>

          {/* Show Control */}
          <select
            value={maxResults}
            onChange={e => setMaxResults(Number(e.target.value))}
            className="bg-white/25 hover:bg-white/35 text-gray-900 dark:text-white border-none outline-none rounded-xl px-4 py-4 text-sm font-bold shadow transition-all duration-200 cursor-pointer min-w-[90px]"
          >
            {[6, 8, 12, 16, 20].map(val => (
              <option key={val} value={val}>{val} items</option>
            ))}
          </select>

          {/* Theme Toggle */}
          <button
            className="bg-white/15 hover:bg-white/25 rounded-2xl px-4 py-3 transition-all duration-300 shadow-lg border border-white/20 flex items-center justify-center group hover:scale-110 transform active:scale-95"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <span className={`transition-all duration-500 text-xl group-hover:scale-110 ${theme === 'dark' ? 'rotate-180' : ''}`}>
              {theme === 'dark' ? '🌞' : '🌙'}
            </span>
          </button>

          {/* Favorites Button */}
          <button
            className="bg-white/15 hover:bg-white/25 rounded-2xl px-4 py-3 transition-all duration-300 shadow-lg border border-white/20 flex items-center gap-2 group hover:scale-105 transform active:scale-95"
            onClick={onFavoritesClick}
            aria-label="View favorites"
          >
            <span className="text-xl group-hover:scale-110 transition-transform duration-300">❤️</span>
            <span className="text-sm font-semibold text-blue-100 whitespace-nowrap">Favorites</span>
          </button>
        </div>

        {/* Secondary Info */}
        <div className="hidden md:flex justify-center items-center gap-4 text-sm text-blue-200/80">
          <div className="flex items-center gap-1">
            <span>🌍</span>
            <span>Global Search</span>
          </div>
          <div className="w-1 h-1 bg-blue-200/60 rounded-full"></div>
          <div className="flex items-center gap-1">
            <span>⚡</span>
            <span>Real-time Results</span>
          </div>
          <div className="w-1 h-1 bg-blue-200/60 rounded-full"></div>
          <div className="flex items-center gap-1">
            <span>💎</span>
            <span>AI Analysis</span>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default Header;
