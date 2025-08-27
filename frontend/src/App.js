import React, { useState } from 'react';
import axios from 'axios';
import Header from './components/Header';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import ResetPassword from './components/Auth/ResetPassword';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import Favorites from './components/Favorites';
import EmailVerificationNotice from './components/EmailVerificationNotice';
import TrendingSearches from './components/TrendingSearches';
import SearchDemo from './components/SearchDemo';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('search'); // 'search' | 'favorites'
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState('GLOBAL');
  const [results, setResults] = useState(null);
  const [allProducts, setAllProducts] = useState([]); // all products from backend
  const [visibleProducts, setVisibleProducts] = useState([]); // products currently shown
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // ...existing code...
  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authScreen, setAuthScreen] = useState('signin'); // 'signin' | 'signup' | 'reset'

  const handleAuthClose = () => setAuthModalOpen(false);
  const handleAuthSwitch = (screen) => setAuthScreen(screen);
  
  const handleFavoritesClick = () => {
    setCurrentView(currentView === 'favorites' ? 'search' : 'favorites');
  };
  
  const handleBackToSearch = () => {
    setCurrentView('search');
  };

  const handleTrendingSearchClick = (query) => {
    setCurrentView('search'); // Switch to search view
    setSearchTerm(query);
    // Trigger search immediately
    setTimeout(() => {
      const event = { preventDefault: () => {} };
      handleSearch(event);
    }, 100);
  };
  // Example settings states (can be expanded)
  // ...existing code...
  const [maxResults, setMaxResults] = useState(12);
  const [sortBy, setSortBy] = useState('relevance');
  // ...existing code...

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setResults(null);
    setAllProducts([]);
    setOffset(0);
    setTotalCount(0);
    setVisibleProducts([]);

    try {
      const response = await axios.post('http://localhost:5001/api/search', {
        searchTerm: searchTerm,
        country: country,
        maxResults: 1000, // get all at once
        sortBy: sortBy,
        offset: 0,
        userId: user?.uid || null
      });
      setResults(response.data);
      // Move best and second best choice items to the front
      let products = response.data.products;
      const bestId = response.data.bestChoiceId;
      const secondId = response.data.secondBestId;
      let bestIdx = products.findIndex(p => p.itemId === bestId);
      let secondIdx = products.findIndex(p => p.itemId === secondId);
      let bestItem = bestIdx !== -1 ? products[bestIdx] : null;
      let secondItem = secondIdx !== -1 ? products[secondIdx] : null;
      // Remove best and second best from the rest
      let rest = products.filter(p => p.itemId !== bestId && p.itemId !== secondId);
      // Sort rest by user choice
      let sortedRest = [...rest];
      if (sortBy === 'price') {
        sortedRest.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sortBy === 'latest') {
        sortedRest.sort((a, b) => {
          if (a.listingDate && b.listingDate) {
            return new Date(b.listingDate) - new Date(a.listingDate);
          }
          return 0;
        });
      }
      // Build final list: best, second best, then sorted rest
      let finalList = [];
      if (bestItem) finalList.push(bestItem);
      if (secondItem && secondItem !== bestItem) finalList.push(secondItem);
      finalList = [...finalList, ...sortedRest];
      setAllProducts(finalList);
      setOffset(maxResults);
      setTotalCount(finalList.length);
      setVisibleProducts(finalList.slice(0, maxResults));
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextOffset = offset + maxResults;
    setVisibleProducts(allProducts.slice(0, nextOffset));
    setOffset(nextOffset);
  };

  // Dynamic sorting and item count
  React.useEffect(() => {
    let sorted = [...allProducts];
    if (sortBy === 'price') {
      sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'latest') {
      // If you have a date field, sort by it
      sorted.sort((a, b) => {
        if (a.listingDate && b.listingDate) {
          return new Date(b.listingDate) - new Date(a.listingDate);
        }
        return 0;
      });
    }
    setVisibleProducts(sorted.slice(0, offset));
  }, [sortBy, maxResults, allProducts, offset]);

  // When maxResults changes, update offset and visibleProducts
  React.useEffect(() => {
    setOffset(maxResults);
    setVisibleProducts(allProducts.slice(0, maxResults));
  }, [maxResults, allProducts]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 transition-all duration-500">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50/30 via-purple-50/20 to-pink-50/30 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-pink-950/30"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-visible">
        <Header
          theme={useTheme().theme}
          toggleTheme={useTheme().toggleTheme}
          maxResults={maxResults}
          setMaxResults={setMaxResults}
          sortBy={sortBy}
          setSortBy={setSortBy}
          country={country}
          setCountry={setCountry}
          onAuthOpen={() => { setAuthScreen('signin'); setAuthModalOpen(true); }}
          onFavoritesClick={handleFavoritesClick}
        />
        
        <EmailVerificationNotice />
        
        {/* Conditional View Rendering */}
        {currentView === 'search' ? (
          <>
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              country={country}
              setCountry={setCountry}
              isLoading={isLoading}
              handleSearch={handleSearch}
            />

            {/* Show trending searches and demo when no results */}
            {!isLoading && !results && (
              <>
                <SearchDemo onSearchClick={handleTrendingSearchClick} />
                <TrendingSearches onSearchClick={handleTrendingSearchClick} />
              </>
            )}

            {/* Enhanced Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center my-16 px-8">
                <div className="relative">
                  {/* Animated Loading Spinner */}
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 dark:border-gray-700"></div>
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-500 border-t-transparent absolute inset-0"></div>
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔍 Searching for the best deals...
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Our AI is analyzing thousands of products to find you the perfect matches
                  </p>
                </div>
              </div>
            )}
            
            {/* Enhanced Error State */}
            {error && (
              <div className="max-w-2xl mx-auto my-12 p-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg">
                <div className="text-center">
                  <span className="text-4xl mb-4 block">❌</span>
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
                    Oops! Something went wrong
                  </h3>
                  <p className="text-red-600 dark:text-red-300 mb-6">
                    {error}
                  </p>
                  <button 
                    onClick={() => setError('')}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
            
            <Results
              results={results}
              allProducts={visibleProducts}
              totalCount={totalCount}
              onLoadMore={handleLoadMore}
              isLoading={isLoading}
              allLoaded={visibleProducts.length >= allProducts.length}
            />
          </>
        ) : (
          <Favorites onBackToSearch={handleBackToSearch} />
        )}
        
        {/* Auth Modal */}
        {authModalOpen && (
          authScreen === 'signin' ? (
            <SignIn onClose={handleAuthClose} onSwitch={handleAuthSwitch} />
          ) : authScreen === 'signup' ? (
            <SignUp onClose={handleAuthClose} onSwitch={handleAuthSwitch} />
          ) : (
            <ResetPassword onClose={handleAuthClose} onSwitch={handleAuthSwitch} />
          )
        )}
      </div>
    </div>
  );
}

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  </ThemeProvider>
);

export default App;