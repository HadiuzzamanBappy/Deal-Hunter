// frontend/src/components/SmartSearchInput.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const SmartSearchInput = ({ searchTerm, setSearchTerm, onSearch, isLoading }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const { user } = useAuth();

  const fetchSuggestions = useCallback(async (query) => {
    setIsLoadingSuggestions(true);
    try {
      const userId = user?.uid || null;
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/suggestions?query=${encodeURIComponent(query)}&userId=${userId}`
      );
      const data = await response.json();
      
      if (data.suggestions) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [user?.uid]);

  const fetchDefaultSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      const userId = user?.uid || null;
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/suggestions?query=&userId=${userId}`
      );
      const data = await response.json();
      
      const defaultSuggestions = [];
      
      // Add user history
      if (data.userHistory && data.userHistory.length > 0) {
        data.userHistory.forEach(item => {
          defaultSuggestions.push({ text: item, type: 'history', score: 4 });
        });
      }
      
      // Add trending
      if (data.trending) {
        data.trending.forEach(item => {
          defaultSuggestions.push({ text: item, type: 'trending', score: 3 });
        });
      }
      
      // Add popular
      if (data.popular) {
        data.popular.forEach(item => {
          defaultSuggestions.push({ text: item, type: 'popular', score: 2 });
        });
      }

      setSuggestions(defaultSuggestions.slice(0, 8));
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching default suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [user?.uid]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Debounce search suggestions - only when focused
  useEffect(() => {
    if (!isFocused) return; // Only fetch suggestions when input is focused
    
    const timer = setTimeout(() => {
      if (searchTerm.length >= 1) {
        // Lowered threshold for faster suggestions
        fetchSuggestions(searchTerm);
      } else if (searchTerm.length === 0) {
        fetchDefaultSuggestions();
      } else {
        // Keep existing suggestions visible for short terms
        if (suggestions.length > 0) {
          setShowSuggestions(true);
        }
      }
    }, 200); // Reduced delay for more responsive suggestions

    return () => clearTimeout(timer);
  }, [searchTerm, isFocused, fetchSuggestions, fetchDefaultSuggestions, suggestions.length]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setSelectedIndex(-1);
    // Ensure suggestions can show again when typing
    if (isFocused && e.target.value.length >= 1) {
      setShowSuggestions(true);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    // Clear any pending hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Always try to show suggestions when focusing
    if (searchTerm.length === 0) {
      fetchDefaultSuggestions();
    } else if (searchTerm.length >= 1) {
      // Lowered threshold to show suggestions faster
      fetchSuggestions(searchTerm);
    }
    // If we have existing suggestions, show them
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e) => {
    // Check if the blur is caused by clicking on a suggestion
    const relatedTarget = e.relatedTarget;
    const currentTarget = e.currentTarget;
    
    // If clicking within the suggestions dropdown, don't blur
    if (suggestionRef.current && suggestionRef.current.contains(relatedTarget)) {
      return;
    }
    
    // If clicking on the input itself, don't blur
    if (currentTarget && currentTarget.contains(relatedTarget)) {
      return;
    }
    
    setIsFocused(false);
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    // Longer delay to allow suggestion clicks to register
    hideTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
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
      default:
        break;
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    // Keep focus state so suggestions can show again when user types
    
    // Trigger search immediately
    setTimeout(() => {
      if (onSearch) {
        const event = { preventDefault: () => {} };
        onSearch(event);
      }
    }, 100);
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'history':
        return '🕒';
      case 'trending':
        return '🔥';
      case 'popular':
        return '⭐';
      case 'category':
        return '📁';
      default:
        return '🔍';
    }
  };

  const getSuggestionLabel = (type) => {
    switch (type) {
      case 'history':
        return 'Recent';
      case 'trending':
        return 'Trending';
      case 'popular':
        return 'Popular';
      case 'category':
        return 'Category';
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex items-center w-full">
        <span className="px-4 text-2xl text-indigo-600 dark:text-purple-400 transition-colors duration-200">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder="Search for products... (e.g., 'wireless headphones under $100', 'best gaming laptop 2024')"
          disabled={isLoading}
          className="flex-1 px-3 py-4 border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 text-lg font-medium"
          autoComplete="off"
        />
        {isLoadingSuggestions && (
          <div className="px-3 flex items-center">
            <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Enhanced Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionRef}
          className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 z-[9999] max-h-96 overflow-y-auto transition-all duration-300 animate-in fade-in-0 zoom-in-95"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking on suggestions
          onMouseUp={(e) => e.preventDefault()}
          onMouseEnter={() => {
            // Cancel any pending hide timeout when hovering
            if (hideTimeoutRef.current) {
              clearTimeout(hideTimeoutRef.current);
            }
          }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <span>✨</span>
              Smart Suggestions
            </h3>
          </div>
          
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={`${suggestion.text}-${index}`}
                className={`group px-6 py-4 cursor-pointer transition-all duration-150 flex items-center gap-4 relative ${
                  index === selectedIndex
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 dark:from-indigo-400/20 dark:to-purple-400/20 shadow-lg'
                    : 'hover:bg-gray-100/60 dark:hover:bg-gray-700/60'
                }`}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {/* Selection Indicator */}
                {index === selectedIndex && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r"></div>
                )}
                
                <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  {getSuggestionIcon(suggestion.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-gray-900 dark:text-white font-semibold truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.type && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full font-medium">
                        {getSuggestionLabel(suggestion.type)}
                      </span>
                      {suggestion.category && (
                        <span className="text-gray-400">•</span>
                      )}
                      {suggestion.category && (
                        <span>{suggestion.category}</span>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-gray-400 dark:text-gray-500 text-lg group-hover:text-indigo-500 transition-colors duration-200">
                  ↗
                </span>
              </div>
            ))}
          </div>
          
          {/* Enhanced Footer with tips */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded shadow text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded shadow text-xs">Enter</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 rounded shadow text-xs">Esc</kbd>
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
