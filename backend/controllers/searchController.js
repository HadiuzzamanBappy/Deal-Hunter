// backend/controllers/searchController.js
import { searchEbay } from '../services/ebayService.js';
import { getAiInsights } from '../services/geminiService.js';
import { searchDaraz } from '../services/darazService.js';

export const handleSearch = async (req, res) => {
    const { searchTerm, country } = req.body;

    // --- LOG #1: What did we receive from the frontend? ---
    console.log('[Controller] Received request body:', req.body);

    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    try {
        const searchPromises = [
            searchEbay(searchTerm)
        ];

        if (country === 'BD') {
            // --- LOG #2: Did we enter the 'if' block? ---
            console.log("[Controller] 'BD' country code detected. Adding Daraz search to promises.");
            searchPromises.push(searchDaraz(searchTerm));
        }

        const searchResults = await Promise.all(searchPromises);
        
        // --- LOG #3: What did the promises return BEFORE combining? ---
        // This will be a nested array, e.g., [[...ebay items], [...daraz items]]
        console.log('[Controller] Results from Promise.all (before flat):', JSON.stringify(searchResults, null, 2));
        
        const allProducts = searchResults.flat();
        
        // --- LOG #4: What does the final combined array look like? ---
        console.log(`[Controller] Found a total of ${allProducts.length} items from all sources.`);

        console.log('Asking Gemini for insights on combined results...');
        const aiSummary = await getAiInsights(allProducts, searchTerm);
        console.log('Received insights from Gemini.');

        res.status(200).json({
            products: allProducts,
            aiSummary: aiSummary,
        });

    } catch (error) {
        console.error('Error in search controller:', error.message);
        res.status(500).json({ error: 'An internal server error occurred. Please try again later.' });
    }
};