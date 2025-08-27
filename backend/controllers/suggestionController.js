// backend/controllers/suggestionController.js
import searchSuggestionService from '../services/searchSuggestionService.js';

export const getSuggestions = async (req, res) => {
    try {
        const { query, userId } = req.query;
        const suggestions = await searchSuggestionService.getSuggestions(query, userId);
        res.json(suggestions);
    } catch (error) {
        console.error('Error in getSuggestions controller:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
};

export const recordSearch = async (req, res) => {
    try {
        const { query, userId } = req.body;
        await searchSuggestionService.recordSearch(query, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error in recordSearch controller:', error);
        res.status(500).json({ error: 'Failed to record search' });
    }
};

export const getTrendingSearches = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const trending = await searchSuggestionService.getTopSearches(parseInt(limit));
        res.json({ trending });
    } catch (error) {
        console.error('Error in getTrendingSearches controller:', error);
        res.status(500).json({ error: 'Failed to get trending searches' });
    }
};
