// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState('GLOBAL');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await axios.post('http://localhost:5001/api/search', {
        searchTerm: searchTerm,
        country: country
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🤖 Deal Hunter AI</h1>
        <p>Enter a product and let AI find you the best deal!</p>
      </header>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="e.g., Nintendo Switch OLED"
            disabled={isLoading}
          />
          <select
            className="country-selector"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={isLoading}
          >
            <option value="GLOBAL">Global</option>
            <option value="BD">Bangladesh</option>
            {/* Add more countries here in the future */}
          </select>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Hunting...' : 'Hunt for Deals'}
          </button>
        </form>
      </div>

      {isLoading && <div className="loader"></div>}
      {error && <p className="error-message">{error}</p>}

      {results && (
        <div className="results-container">
          <div className="ai-summary">
            <h2>AI Deal Summary</h2>
            <p>{results.aiSummary}</p>
          </div>
          <div className="product-list">
            {results.products.map((product) => (
              <a href={product.viewItemURL} target="_blank" rel="noopener noreferrer" className="product-card" key={product.itemId}>
                <img
                  src={product.galleryURL || 'https://placehold.co/400'}
                  alt={product.title}
                />
                <div className="product-info">
                  <p className="product-title">{product.title}</p>
                  <p className="product-price">{product.price}</p>
                </div>
                <span className="product-source-badge">{product.source || 'eBay'}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;