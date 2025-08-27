import React from 'react';

const Header = ({ theme, toggleTheme, maxResults, setMaxResults, sortBy, setSortBy, country, setCountry }) => (
  <header className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl mb-8 py-10 px-6 text-center transition-colors duration-300 backdrop-blur-lg bg-opacity-80 border border-white/20">
    <h1 className="text-5xl font-extrabold mb-3 tracking-tight drop-shadow-lg flex items-center justify-center gap-2">
      <span className="inline-block bg-white/20 rounded-full p-2 text-3xl mr-2 animate-bounce">🦾</span>
      Deal Hunter AI
    </h1>
    <p className="text-lg mb-6 opacity-90 font-medium tracking-wide">Intelligent Product Search & Analysis</p>
    <div className="flex justify-center items-center gap-4 mt-4">
      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        className="px-4 py-3 bg-white/20 dark:bg-gray-800/40 text-gray-900 dark:text-white border-none outline-none rounded-xl font-semibold shadow w-32"
      >
        <option value="relevance">↕️ Relevance</option>
        <option value="price">💰 Price</option>
        <option value="latest">🆕 Latest</option>
      </select>
      <select
        value={maxResults}
        onChange={e => setMaxResults(Number(e.target.value))}
        className="px-4 py-3 bg-white/20 dark:bg-gray-800/40 text-gray-900 dark:text-white border-none outline-none rounded-xl font-semibold shadow w-24"
      >
        {[6, 8, 10, 14, 20].map(val => (
          <option key={val} value={val}>🔢 {val}</option>
        ))}
      </select>
      <button
        className="ml-2 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors shadow-lg border border-white/30 flex items-center justify-center"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <span className={`transition-transform duration-500 text-2xl ${theme === 'dark' ? 'rotate-180' : ''}`}>{theme === 'dark' ? '🌞' : '🌙'}</span>
      </button>
    </div>
  </header>
);

export default Header;
