// backend/controllers/searchController.js
import { searchEbay } from '../services/ebayService.js';
import { getAiInsights } from '../services/geminiService.js';
import { searchDaraz } from '../services/darazService.js';

export const handleSearch = async (req, res) => {
    const { searchTerm, country, maxResults = 12, sortBy = 'relevance', offset = 0, sessionId } = req.body;

    // --- LOG #1: What did we receive from the frontend? ---
    console.log('[Controller] Received request body:', req.body);

    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    // Simple in-memory session store (for demo; use Redis or DB for production)
    global.__dealHunterSessions = global.__dealHunterSessions || {};
    try {
        let searchPromises = [];
        if (!sessionId) {
            // First request: fetch all products and store in session
            searchPromises.push(searchEbay(searchTerm));
            if (country === 'BD') {
                searchPromises.push(searchDaraz(searchTerm));
            }
            const searchResults = await Promise.all(searchPromises);
            let allProducts = searchResults.flat();
            // Sort results
            if (sortBy === 'price') {
                allProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            } else if (sortBy === 'latest') {
                // If you have a date field, sort by it.
                allProducts.sort((a, b) => {
                    if (a.listingDate && b.listingDate) {
                        return new Date(b.listingDate) - new Date(a.listingDate);
                    }
                    return 0;
                });
            } else if (sortBy === 'relevance') {
                // Default: leave as is (API order)
            }
            // Generate a sessionId
            const newSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            global.__dealHunterSessions[newSessionId] = {
                products: allProducts,
                searchTerm,
                sortBy,
                country
            };
            // Return first batch
            const batch = allProducts.slice(offset, offset + maxResults);
            // Only send basic details to AI
            const basicBatch = batch.map(p => ({
                itemId: p.itemId,
                title: p.title,
                price: p.price,
                source: p.source || 'eBay',
                viewItemURL: p.viewItemURL
            }));
            const aiResult = await getAiInsights(basicBatch, searchTerm);
            // Add label to products in batch
            let labeledBatch = batch.map(p => ({ ...p }));
            labeledBatch = labeledBatch.map((p) => {
                if (p.itemId === aiResult.bestChoiceId) {
                    return { ...p, label: 'Best Choice' };
                }
                if (aiResult.secondBestId && p.itemId === aiResult.secondBestId) {
                    return { ...p, label: 'Second Best' };
                }
                return p;
            });
            res.status(200).json({
                products: labeledBatch,
                aiSummary: aiResult.summary,
                bestChoiceId: aiResult.bestChoiceId,
                totalCount: allProducts.length,
                sessionId: newSessionId
            });
        } else {
            // Subsequent requests: use session
            const session = global.__dealHunterSessions[sessionId];
            if (!session) return res.status(400).json({ error: 'Session expired or invalid.' });
            let allProducts = session.products;
            // Optionally re-sort if sortBy changed
            if (sortBy && sortBy !== session.sortBy) {
                if (sortBy === 'price') {
                    allProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
                } else if (sortBy === 'latest') {
                    allProducts.sort((a, b) => {
                        if (a.listingDate && b.listingDate) {
                            return new Date(b.listingDate) - new Date(a.listingDate);
                        }
                        return 0;
                    });
                } else if (sortBy === 'relevance') {
                    // Default: leave as is
                }
                session.sortBy = sortBy;
            }
            const batch = allProducts.slice(offset, offset + maxResults);
            const basicBatch = batch.map(p => ({
                itemId: p.itemId,
                title: p.title,
                price: p.price,
                source: p.source || 'eBay',
                viewItemURL: p.viewItemURL
            }));
            const aiResult = await getAiInsights(basicBatch, session.searchTerm);
            // Add label to products in batch
            let labeledBatch = batch.map(p => ({ ...p }));
            if (aiResult.bestChoiceId) {
                labeledBatch = labeledBatch.map((p, idx) => {
                    if (p.itemId === aiResult.bestChoiceId) {
                        return { ...p, label: 'Best Choice' };
                    }
                    // Second best: next product in batch (demo logic)
                    if (batch.length > 1 && batch[(batch.findIndex(x => x.itemId === aiResult.bestChoiceId) + 1) % batch.length].itemId === p.itemId) {
                        return { ...p, label: 'Second Best' };
                    }
                    return p;
                });
            }
            res.status(200).json({
                products: labeledBatch,
                aiSummary: aiResult.summary,
                bestChoiceId: aiResult.bestChoiceId,
                totalCount: allProducts.length,
                sessionId
            });
        }
    } catch (error) {
        console.error('Error in search controller:', error.message);
        res.status(500).json({ error: 'An internal server error occurred. Please try again later.' });
    }
};