// routes/searchRoutes.js
import express from 'express';
import { handleSearch, getAvailableCountries } from '../controllers/searchController.js';

const router = express.Router();

// Get available countries for search filtering
router.get('/countries', getAvailableCountries);

// All requests to POST / will be handled by the handleSearch controller
router.post('/', handleSearch);

export default router;