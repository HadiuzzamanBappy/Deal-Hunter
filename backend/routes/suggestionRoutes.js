// backend/routes/suggestionRoutes.js
import express from 'express';
import { getSuggestions, recordSearch, getTrendingSearches } from '../controllers/suggestionController.js';

const router = express.Router();

// GET /api/suggestions?query=wireless&userId=123
router.get('/', getSuggestions);

// POST /api/suggestions/record
router.post('/record', recordSearch);

// GET /api/suggestions/trending
router.get('/trending', getTrendingSearches);

export default router;
