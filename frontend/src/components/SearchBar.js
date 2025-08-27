import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SmartSearchInput from './SmartSearchInput';

const SearchBar = ({ searchTerm, setSearchTerm, country, setCountry, availableCountries = [], isLoading, handleSearch }) => {
    const [countries, setCountries] = useState(availableCountries);

    useEffect(() => {
        if (availableCountries.length > 0) {
            setCountries(availableCountries);
            return;
        }

        const fetchCountries = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}/api/search/countries`);
                if (response.data.countries) {
                    setCountries(response.data.countries);
                } else {
                    throw new Error('Invalid response format');
                }
            } catch (error) {
                console.error('Failed to fetch countries:', error);
                setCountries([
                    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
                    { code: 'US', name: 'United States', flag: '🇺🇸' },
                ]);
            }
        };
        fetchCountries();
    }, [availableCountries]);

    return (
        <div className="mb-16 flex justify-center relative z-10 px-4">
            <div className="w-full max-w-5xl">
                <form onSubmit={handleSearch} className="relative">
                    <div className="flex flex-col lg:flex-row gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-3 transition-all duration-300 hover:shadow-3xl">
                        
                        {/* Search Input Container */}
                        <div className="flex-1 relative">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none z-10">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        
                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {/* Country Selector */}
                            <select
                                value={country}
                                onChange={e => setCountry(e.target.value)}
                                disabled={isLoading}
                                className="px-4 py-3 bg-white/80 dark:bg-gray-800/80 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-2xl font-medium shadow-sm transition-all duration-200 hover:shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none cursor-pointer"
                            >
                                {countries.map(c => (
                                    <option key={c.code} value={c.code} className="bg-white dark:bg-gray-800">
                                        {c.flag} {c.name}
                                    </option>
                                ))}
                            </select>
                            
                            {/* Search Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md min-w-[120px] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Search</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchBar;
