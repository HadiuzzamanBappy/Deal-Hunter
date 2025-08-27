import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, country, setCountry, isLoading, handleSearch }) => (
  <div className="mb-10 flex justify-center">
    <form onSubmit={handleSearch} className="flex w-full max-w-2xl gap-0 bg-white/70 dark:bg-gray-900/70 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg p-2">
      <div className="flex items-center w-full">
        <span className="text-2xl text-indigo-600 dark:text-purple-400">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products... (e.g., 'wireless headphones under $100', 'best gaming laptop 2024')"
          disabled={isLoading}
          className="flex-1 px-2 py-3 rounded-l-2xl border-none outline-none bg-transparent text-gray-900 dark:text-white focus:transparent transition-all duration-200 text-lg"
        />
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
          disabled={isLoading}
          className="px-5 py-3 bg-white/20 dark:bg-gray-800/40 text-gray-900 dark:text-white border-none outline-none rounded-l-xl ml-2 font-semibold shadow"
        >
          <option value="GLOBAL">🌐 Global</option>
          <option value="BD">🌐 Bangladesh</option>
        </select>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-r-2xl transition-colors duration-200 hover:from-indigo-700 hover:to-purple-700 disabled:bg-gray-400 shadow-lg"
        >
          {isLoading ? <span className="animate-spin inline-block">⚡</span> : 'Search'}
        </button>
      </div>
    </form>
  </div>
);

export default SearchBar;
