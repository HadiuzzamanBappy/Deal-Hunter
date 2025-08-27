// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import { ThemeProvider, useTheme } from './context/ThemeContext';

function MainApp() {
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
        offset: 0
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Header
          theme={useTheme().theme}
          toggleTheme={useTheme().toggleTheme}
          maxResults={maxResults}
          setMaxResults={setMaxResults}
          sortBy={sortBy}
          setSortBy={setSortBy}
          country={country}
          setCountry={setCountry}
        />
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          country={country}
          setCountry={setCountry}
          isLoading={isLoading}
          handleSearch={handleSearch}
        />
  {/* SettingsModal removed. Options now in header area. */}
        {isLoading && <div className="flex justify-center my-8"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div></div>}
        {error && <p className="text-red-500 text-center font-semibold my-4">{error}</p>}
        <Results
          results={results}
          allProducts={visibleProducts}
          totalCount={totalCount}
          onLoadMore={handleLoadMore}
          isLoading={isLoading}
          allLoaded={visibleProducts.length >= allProducts.length}
        />
      </div>
    </div>
  );
}

const App = () => (
  <ThemeProvider>
    <MainApp />
  </ThemeProvider>
);

export default App;