import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const SmartSearchInput = ({ searchTerm, setSearchTerm, onSearch, isLoading }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);
  const { user } = useAuth();

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (query) => {
    setIsLoadingSuggestions(true);
    try {
      const userId = user?.uid || null;
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/suggestions?query=${encodeURIComponent(query)}&userId=${userId}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [user?.uid]);

  // Fetch default suggestions
  const fetchDefaultSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      const userId = user?.uid || null;
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/suggestions?query=&userId=${userId}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const defaultSuggestions = [];
      
      if (data.userHistory?.length > 0) {
        data.userHistory.forEach(item => {
          defaultSuggestions.push({ text: item, type: 'history' });
        });
      }
      
      if (data.trending?.length > 0) {
        data.trending.forEach(item => {
          defaultSuggestions.push({ text: item, type: 'trending' });
        });
      }
      
      if (data.popular?.length > 0) {
        data.popular.forEach(item => {
          defaultSuggestions.push({ text: item, type: 'popular' });
        });
      }

      setSuggestions(defaultSuggestions.slice(0, 8));
    } catch (error) {
      console.error('Error fetching default suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [user?.uid]);

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!showSuggestions) return;

    timeoutRef.current = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        fetchSuggestions(searchTerm.trim());
      } else if (searchTerm.trim().length === 0) {
        fetchDefaultSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, showSuggestions, fetchSuggestions, fetchDefaultSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
    setSelectedIndex(-1);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex]);
        } else {
          onSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    setTimeout(() => {
      if (onSearch) {
        onSearch({ preventDefault: () => {} });
      }
    }, 100);
  };

  const getSuggestionIcon = (type) => {
    const icons = {
      history: '🕒',
      trending: '🔥',
      popular: '⭐',
      category: '📁'
    };
    return icons[type] || '🔍';
  };

  const getSuggestionLabel = (type) => {
    const labels = {
      history: 'Recent',
      trending: 'Trending', 
      popular: 'Popular',
      category: 'Category'
    };
    return labels[type] || '';
  };

  return (
    <div className="relative w-full">
      {/* Input Field */}
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder="Search for products... (e.g., 'wireless headphones', 'gaming laptop')"
        disabled={isLoading}
        className="w-full pl-12 pr-4 py-4 border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-lg font-medium transition-colors duration-200"
        autoComplete="off"
      />
      
      {/* Loading indicator */}
      {isLoadingSuggestions && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
              <span>✨</span>
              Smart Suggestions
            </div>
          </div>
          
          {/* Suggestions List */}
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.text}-${index}`}
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-150 ${
                  index === selectedIndex
                    ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                }`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(suggestion);
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="text-xl flex-shrink-0">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.type && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                        {getSuggestionLabel(suggestion.type)}
                      </span>
                    </div>
                  )}
                </div>
                
                <span className="text-gray-400 text-sm">↗</span>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">Enter</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartSearchInput;
