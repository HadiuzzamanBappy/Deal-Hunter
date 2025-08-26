// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Loads environment variables from .env file

// Import the router from our routes file
import searchRoutes from './routes/searchRoutes.js';

// --- Initialization ---
const app = express();
const PORT = process.env.PORT || 5001;

// --- Middleware ---
app.use(cors()); // Allows requests from your frontend
app.use(express.json()); // Allows the server to understand JSON

// --- API Routes ---
// Any request to /api/search will be handled by our searchRoutes
app.use('/api/search', searchRoutes);


// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});