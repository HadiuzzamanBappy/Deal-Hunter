// routes/searchRoutes.js
import express from 'express';
import { handleSearch } from '../controllers/searchController.js';

const router = express.Router();

// All requests to POST / will be handled by the handleSearch controller
router.post('/', handleSearch);

export default router;