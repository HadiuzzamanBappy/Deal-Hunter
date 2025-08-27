// backend/services/searchSuggestionService.js
import fs from 'fs/promises';
import path from 'path';

class SearchSuggestionService {
    constructor() {
        this.suggestionsFile = path.join(process.cwd(), 'data', 'search-suggestions.json');
        this.searchHistoryFile = path.join(process.cwd(), 'data', 'search-history.json');
        this.initializeData();
    }

    async initializeData() {
        try {
            // Create data directory if it doesn't exist
            await fs.mkdir(path.dirname(this.suggestionsFile), { recursive: true });
            
            // Initialize suggestions file with default data
            const defaultSuggestions = {
                trending: [
                    "wireless headphones",
                    "gaming laptop",
                    "smartphone under 500",
                    "bluetooth speaker",
                    "mechanical keyboard",
                    "fitness tracker",
                    "coffee maker",
                    "air fryer",
                    "smart watch",
                    "laptop bag"
                ],
                popular: [
                    "iPhone",
                    "Samsung Galaxy",
                    "MacBook",
                    "AirPods",
                    "iPad",
                    "PlayStation",
                    "Xbox",
                    "Nintendo Switch",
                    "Canon camera",
                    "Sony headphones"
                ],
                categories: {
                    "Electronics": ["smartphone", "laptop", "tablet", "headphones", "camera", "smart tv"],
                    "Gaming": ["gaming laptop", "gaming mouse", "gaming keyboard", "gaming chair", "PS5", "Xbox"],
                    "Fashion": ["shoes", "jacket", "watch", "sunglasses", "backpack", "wallet"],
                    "Home": ["coffee maker", "air fryer", "vacuum cleaner", "smart bulb", "speaker"],
                    "Sports": ["fitness tracker", "yoga mat", "dumbbells", "running shoes", "bicycle"]
                }
            };

            const defaultHistory = {
                searches: [],
                popularSearches: {}
            };

            try {
                await fs.access(this.suggestionsFile);
            } catch {
                await fs.writeFile(this.suggestionsFile, JSON.stringify(defaultSuggestions, null, 2));
            }

            try {
                await fs.access(this.searchHistoryFile);
            } catch {
                await fs.writeFile(this.searchHistoryFile, JSON.stringify(defaultHistory, null, 2));
            }
        } catch (error) {
            console.error('Error initializing search suggestion data:', error);
        }
    }

    async getSuggestions(query, userId = null, limit = 10) {
        try {
            const suggestions = await this.loadSuggestions();
            const history = await this.loadSearchHistory();
            
            if (!query || query.length < 2) {
                // Return trending and popular suggestions for empty/short queries
                return {
                    trending: suggestions.trending.slice(0, 5),
                    popular: suggestions.popular.slice(0, 5),
                    userHistory: userId ? this.getUserHistory(history, userId).slice(0, 3) : [],
                    categories: Object.keys(suggestions.categories).slice(0, 5)
                };
            }

            const queryLower = query.toLowerCase();
            const results = [];

            // Search in trending searches
            const trendingMatches = suggestions.trending
                .filter(item => item.toLowerCase().includes(queryLower))
                .map(item => ({ text: item, type: 'trending', score: 3 }));

            // Search in popular searches
            const popularMatches = suggestions.popular
                .filter(item => item.toLowerCase().includes(queryLower))
                .map(item => ({ text: item, type: 'popular', score: 2 }));

            // Search in categories
            const categoryMatches = [];
            Object.entries(suggestions.categories).forEach(([category, items]) => {
                items.filter(item => item.toLowerCase().includes(queryLower))
                     .forEach(item => categoryMatches.push({ 
                         text: item, 
                         type: 'category', 
                         category: category, 
                         score: 1 
                     }));
            });

            // Search in user's history
            const historyMatches = userId ? 
                this.getUserHistory(history, userId)
                    .filter(item => item.toLowerCase().includes(queryLower))
                    .map(item => ({ text: item, type: 'history', score: 4 })) : [];

            // Combine and sort by score
            results.push(...historyMatches, ...trendingMatches, ...popularMatches, ...categoryMatches);
            results.sort((a, b) => b.score - a.score);

            // Remove duplicates and limit results
            const uniqueResults = results.filter((item, index, self) => 
                index === self.findIndex(t => t.text.toLowerCase() === item.text.toLowerCase())
            ).slice(0, limit);

            return {
                suggestions: uniqueResults,
                hasMore: results.length > limit
            };

        } catch (error) {
            console.error('Error getting suggestions:', error);
            return { suggestions: [], hasMore: false };
        }
    }

    async recordSearch(query, userId = null) {
        try {
            if (!query || query.length < 2) return;

            const history = await this.loadSearchHistory();
            const timestamp = Date.now();

            // Add to general search history
            history.searches.unshift({
                query: query.trim(),
                timestamp,
                userId
            });

            // Keep only last 1000 searches
            history.searches = history.searches.slice(0, 1000);

            // Update popular searches counter
            const queryLower = query.toLowerCase().trim();
            history.popularSearches[queryLower] = (history.popularSearches[queryLower] || 0) + 1;

            await this.saveSearchHistory(history);

            // Update trending searches based on popularity
            await this.updateTrendingSuggestions();

        } catch (error) {
            console.error('Error recording search:', error);
        }
    }

    async updateTrendingSuggestions() {
        try {
            const history = await this.loadSearchHistory();
            const suggestions = await this.loadSuggestions();

            // Get top searches from last 7 days
            const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const recentSearches = history.searches
                .filter(search => search.timestamp > weekAgo)
                .reduce((acc, search) => {
                    const query = search.query.toLowerCase();
                    acc[query] = (acc[query] || 0) + 1;
                    return acc;
                }, {});

            // Sort by frequency and update trending
            const trending = Object.entries(recentSearches)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([query]) => query);

            if (trending.length > 0) {
                suggestions.trending = [...new Set([...trending, ...suggestions.trending])].slice(0, 10);
                await this.saveSuggestions(suggestions);
            }

        } catch (error) {
            console.error('Error updating trending suggestions:', error);
        }
    }

    getUserHistory(history, userId, limit = 10) {
        return history.searches
            .filter(search => search.userId === userId)
            .map(search => search.query)
            .filter((query, index, self) => self.indexOf(query) === index) // Remove duplicates
            .slice(0, limit);
    }

    async loadSuggestions() {
        try {
            const data = await fs.readFile(this.suggestionsFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading suggestions:', error);
            return { trending: [], popular: [], categories: {} };
        }
    }

    async saveSuggestions(suggestions) {
        try {
            await fs.writeFile(this.suggestionsFile, JSON.stringify(suggestions, null, 2));
        } catch (error) {
            console.error('Error saving suggestions:', error);
        }
    }

    async loadSearchHistory() {
        try {
            const data = await fs.readFile(this.searchHistoryFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading search history:', error);
            return { searches: [], popularSearches: {} };
        }
    }

    async saveSearchHistory(history) {
        try {
            await fs.writeFile(this.searchHistoryFile, JSON.stringify(history, null, 2));
        } catch (error) {
            console.error('Error saving search history:', error);
        }
    }

    async getTopSearches(limit = 10) {
        try {
            const history = await this.loadSearchHistory();
            return Object.entries(history.popularSearches)
                .sort(([,a], [,b]) => b - a)
                .slice(0, limit)
                .map(([query, count]) => ({ query, count }));
        } catch (error) {
            console.error('Error getting top searches:', error);
            return [];
        }
    }
}

export default new SearchSuggestionService();
