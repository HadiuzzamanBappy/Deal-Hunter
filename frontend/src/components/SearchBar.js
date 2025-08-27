import React from 'react';
import SmartSearchInput from './SmartSearchInput';

const SearchBar = ({ searchTerm, setSearchTerm, country, setCountry, isLoading, handleSearch }) => (
  <div className="mb-16 flex justify-center relative z-10 px-4">
    <div className="w-full max-w-5xl relative">
      {/* Enhanced Search Form */}
      <form onSubmit={handleSearch} className="relative group">
        {/* Multi-layered Glow Effects */}
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-15 group-hover:opacity-25 transition-all duration-500"></div>
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-3xl blur opacity-20 group-hover:opacity-30 transition-all duration-500"></div>
        
        {/* Main Search Container */}
        <div className="relative flex flex-col lg:flex-row w-full gap-4 lg:gap-0 bg-white/85 dark:bg-gray-900/85 rounded-3xl shadow-2xl border-2 border-white/40 dark:border-gray-700/40 backdrop-blur-2xl p-4 lg:p-2 transition-all duration-300 group-hover:bg-white/95 dark:group-hover:bg-gray-900/95 group-hover:shadow-3xl">
          
          {/* Search Input Container */}
          <div className="flex-1 relative lg:mr-4">
            <div className="relative">
              {/* Search Icon */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10 pointer-events-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <SmartSearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onSearch={handleSearch}
                isLoading={isLoading}
              />
            </div>
          </div>
          
          {/* Enhanced Country Selector */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
            
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              disabled={isLoading}
              className="px-4 py-3 bg-gradient-to-r from-white/40 to-white/20 dark:from-gray-800/40 dark:to-gray-800/20 text-gray-900 dark:text-white border-none outline-none rounded-2xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl cursor-pointer backdrop-blur-sm border border-white/20"
            >
              <option value="GLOBAL">� Global</option>
              <option value="BD">�🇩 Bangladesh</option>
            </select>
            
            {/* Enhanced Search Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative px-8 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-xl border border-white/20 overflow-hidden min-w-[140px]"
            >
              {/* Multi-layered Button Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
              
              <span className="relative flex items-center justify-center gap-2.5">
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span className="font-bold">Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="font-bold">Search</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
        
        {/* Enhanced Search Tips */}
        <div className="mt-6 flex flex-col items-center space-y-3">
          <div className="flex items-center justify-center gap-2 bg-white/10 dark:bg-gray-800/20 backdrop-blur-md rounded-full px-6 py-2 border border-white/20">
            <span className="text-yellow-400">💡</span>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
              Try: "wireless headphones under $100" or "best gaming laptop 2024"
            </p>
          </div>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <span className="text-green-500">✨</span>
              <span>Smart Suggestions</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span className="text-blue-500">⚡</span>
              <span>Real-time Search</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-1">
              <span className="text-purple-500">🤖</span>
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
);

export default SearchBar;
