import { getAiInsights, extractProductName } from '../services/geminiService.js';
import searchSuggestionService from '../services/searchSuggestionService.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeApiSearch } from '../services/apiService.js';
import { executeScraping } from '../services/scrapingService.js';
import { convertPriceForCountry, detectCurrencyFromPrice } from '../utils/currencyUtils.js';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load and prepare search providers
const loadSearchProviders = async () => {
  try {
    const providersPath = path.join(__dirname, '../data/searchProviders.json');
    const providersData = await fs.readFile(providersPath, 'utf-8');
    const providers = JSON.parse(providersData);
    
    return providers.map(provider => {
      const newProvider = { ...provider };
      
      // Assign appropriate service function based on provider type
      if (newProvider.type === 'API') {
        newProvider.serviceFunc = executeApiSearch;
      } else if (newProvider.type === 'SCRAPER') {
        newProvider.serviceFunc = executeScraping;
      } else {
        throw new Error(`Unsupported provider type: ${newProvider.type}`);
      }

      return newProvider;
    });
  } catch (error) {
    console.error('[SearchController] Error loading providers:', error);
    return [];
  }
};

// Initialize providers
let searchProviders = [];
(async () => {
  try {
    searchProviders = await loadSearchProviders();
    console.log('[SearchController] Providers loaded:', searchProviders.map(p => p.name).join(', '));
  } catch (error) {
    console.error('[SearchController] Failed to load providers:', error);
  }
})();

// Helper function to extract numeric price for sorting
const extractNumericPrice = (priceString) => {
    if (!priceString) return 0;
    const matches = priceString.match(/[\d,]+\.?\d*/);
    if (matches) {
        return parseFloat(matches[0].replace(/,/g, ''));
    }
    return 0;
};

export const handleSearch = async (req, res) => {
    const { searchTerm, country, maxResults = 50, sortBy = 'relevance', offset = 0, sessionId, userId } = req.body;

    // STEP 1: Get input from user
    console.log('🔹 STEP 1: Received user input');
    console.log('   Search Term:', searchTerm);
    console.log('   Country:', country);

    if (!searchTerm) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    // Record search for suggestions
    if (searchTerm?.length >= 2) {
        try {
            await searchSuggestionService.recordSearch(searchTerm, userId);
        } catch (error) {
            console.error('Error recording search:', error);
        }
    }

    // Session management
    global.__dealHunterSessions = global.__dealHunterSessions || {};
    
    try {
        if (!sessionId) {
            // STEP 2: Give input to AI for search term refinement
            console.log('🔹 STEP 2: Sending to AI for product name extraction...');
            console.log('   Input:', searchTerm);
            
            const refinedProductName = await extractProductName(searchTerm);
            
            console.log('   AI Response:', refinedProductName);
            console.log('✅ STEP 2 Complete: AI refined search term');

            // Wait for providers to load if they haven't yet
            let retries = 0;
            while (searchProviders.length === 0 && retries < 10) {
                console.log('   Waiting for providers to load...');
                await new Promise(resolve => setTimeout(resolve, 100));
                retries++;
            }

            if (searchProviders.length === 0) {
                console.log('   No providers available, returning empty results');
                return res.status(500).json({ error: 'Search providers not available' });
            }

            // STEP 3: Get products from APIs and scrapers
            console.log('🔹 STEP 3: Fetching products from APIs and scrapers...');
            
            // Filter providers based on country
            const availableProviders = searchProviders.filter(provider => {
                if (!provider.enabled) return false;
                if (provider.countries && provider.countries.length > 0) {
                    return provider.countries.includes(country);
                }
                return true; // Global provider (like eBay)
            });

            console.log('   Available providers for', country + ':', availableProviders.map(p => `${p.name} (${p.type})`));

            if (availableProviders.length === 0) {
                console.log('   No providers available for this country');
                return res.status(200).json({
                    products: [],
                    aiSummary: "No search providers available for this country.",
                    bestChoiceId: null,
                    totalCount: 0,
                    sessionId: null,
                    originalSearchTerm: searchTerm,
                    refinedSearchTerm: refinedProductName
                });
            }

            // Execute searches in parallel
            const searchPromises = availableProviders.map(async (provider) => {
                try {
                    console.log(`   Searching ${provider.name}...`);
                    return await provider.serviceFunc(provider, refinedProductName);
                } catch (error) {
                    console.error(`   Error searching ${provider.name}:`, error.message);
                    return [];
                }
            });

            const searchResults = await Promise.all(searchPromises);
            const allProducts = searchResults.flat();

            console.log(`   Results: ${searchResults.map((result, i) => `${availableProviders[i].name}: ${result.length}`).join(', ')}`);
            console.log(`✅ STEP 3 Complete: ${allProducts.length} total products found`);

            // STEP 4: Create structured product array with currency conversion
            console.log('🔹 STEP 4: Creating structured product array...');
            
            const structuredProducts = allProducts.map(product => {
                // Detect original currency and convert to country currency
                const originalCurrency = detectCurrencyFromPrice(product.price);
                const convertedPrice = convertPriceForCountry(product.price, originalCurrency, country);
                
                return {
                    itemId: product.itemId,
                    title: product.title,
                    price: convertedPrice,
                    originalPrice: product.price, // Keep original for reference
                    galleryURL: product.galleryURL,
                    viewItemURL: product.viewItemURL,
                    source: product.source,
                    priceNumeric: extractNumericPrice(product.price),
                    originalSearchTerm: searchTerm,
                    refinedSearchTerm: refinedProductName
                };
            });

            // Sort products
            if (sortBy === 'price') {
                structuredProducts.sort((a, b) => a.priceNumeric - b.priceNumeric);
            }

            console.log(`✅ STEP 4 Complete: ${structuredProducts.length} products structured and sorted by ${sortBy}`);

            // Create session
            const newSessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            global.__dealHunterSessions[newSessionId] = {
                products: structuredProducts,
                searchTerm,
                refinedSearchTerm: refinedProductName,
                sortBy,
                country
            };

            // Get first batch for AI analysis
            const batch = structuredProducts.slice(offset, offset + maxResults);

            // STEP 5: Send to AI for analysis and get best 2 recommendations + summary
            console.log('🔹 STEP 5: Sending products to AI for analysis...');
            
            const aiAnalysisData = batch.map(p => ({
                itemId: p.itemId,
                title: p.title,
                price: p.price,
                source: p.source,
                viewItemURL: p.viewItemURL,
                priceNumeric: p.priceNumeric,
                originalQuery: searchTerm,
                refinedQuery: refinedProductName
            }));

            console.log(`   Sending ${aiAnalysisData.length} products to AI...`);
            
            let aiResult;
            try {
                aiResult = await getAiInsights(aiAnalysisData, refinedProductName);
                console.log('   AI Response:');
                console.log(`   - Best Choice: ${aiResult.bestChoiceId}`);
                console.log(`   - Second Best: ${aiResult.secondBestId}`);
                console.log(`   - Summary: ${aiResult.summary?.substring(0, 100)}...`);
                console.log('✅ STEP 5 Complete: AI analysis done');
            } catch (error) {
                console.error('⚠️  AI analysis failed, using fallback:', error.message);
                // Fallback: Use simple price-based analysis
                const sortedByPrice = [...aiAnalysisData].sort((a, b) => a.priceNumeric - b.priceNumeric);
                aiResult = {
                    summary: `Here's the deal: Found ${aiAnalysisData.length} products for "${refinedProductName}". Prices range from ${sortedByPrice[0]?.price} to ${sortedByPrice[sortedByPrice.length - 1]?.price}. Compare features and choose what fits your needs best.`,
                    bestChoiceId: sortedByPrice[0]?.itemId || null,
                    secondBestId: sortedByPrice[1]?.itemId || null
                };
                console.log('✅ STEP 5 Complete: Using fallback analysis');
            }

            // STEP 6: Label products and show to user
            console.log('🔹 STEP 6: Labeling products and preparing response...');
            
            const labeledBatch = batch.map(product => {
                if (product.itemId === aiResult.bestChoiceId) {
                    return { ...product, label: 'Best Choice' };
                }
                if (product.itemId === aiResult.secondBestId) {
                    return { ...product, label: 'Second Best' };
                }
                return product;
            });

            // Clean response (remove internal fields)
            const finalProducts = labeledBatch.map(p => ({
                itemId: p.itemId,
                title: p.title,
                price: p.price,
                galleryURL: p.galleryURL,
                viewItemURL: p.viewItemURL,
                source: p.source,
                label: p.label
            }));

            const labeledCount = finalProducts.filter(p => p.label).length;
            console.log(`   Labeled ${labeledCount} products with AI recommendations`);
            console.log('✅ STEP 6 Complete: Response prepared for user');

            // Send final response
            console.log('🎯 SEARCH FLOW COMPLETE: Sending response to user');
            
            res.status(200).json({
                products: finalProducts,
                aiSummary: aiResult.summary,
                bestChoiceId: aiResult.bestChoiceId,
                totalCount: structuredProducts.length,
                sessionId: newSessionId,
                originalSearchTerm: searchTerm,
                refinedSearchTerm: refinedProductName
            });

        } else {
            // Handle session-based requests (pagination, etc.)
            console.log('📄 SESSION REQUEST: Using existing session', sessionId);
            
            const session = global.__dealHunterSessions[sessionId];
            if (!session) {
                return res.status(400).json({ error: 'Session expired or invalid.' });
            }

            let allProducts = session.products;
            
            // Re-sort if needed
            if (sortBy && sortBy !== session.sortBy) {
                if (sortBy === 'price') {
                    allProducts.sort((a, b) => a.priceNumeric - b.priceNumeric);
                }
                session.sortBy = sortBy;
            }
            
            const batch = allProducts.slice(offset, offset + maxResults);
            
            // Get AI analysis for this batch with fallback
            const aiAnalysisData = batch.map(p => ({
                itemId: p.itemId,
                title: p.title,
                price: p.price,
                source: p.source,
                viewItemURL: p.viewItemURL,
                priceNumeric: p.priceNumeric,
                originalQuery: session.searchTerm,
                refinedQuery: session.refinedSearchTerm
            }));
            
            let aiResult;
            try {
                aiResult = await getAiInsights(aiAnalysisData, session.refinedSearchTerm || session.searchTerm);
            } catch (error) {
                console.error('⚠️  AI analysis failed for session, using fallback:', error.message);
                // Fallback: Use simple price-based analysis
                const sortedByPrice = [...aiAnalysisData].sort((a, b) => a.priceNumeric - b.priceNumeric);
                aiResult = {
                    summary: `Here's the deal: Found ${aiAnalysisData.length} products. Browse through the options to find what works best for you.`,
                    bestChoiceId: sortedByPrice[0]?.itemId || null,
                    secondBestId: sortedByPrice[1]?.itemId || null
                };
            }
            
            // Label products
            const labeledBatch = batch.map(product => {
                if (product.itemId === aiResult.bestChoiceId) {
                    return { ...product, label: 'Best Choice' };
                }
                if (product.itemId === aiResult.secondBestId) {
                    return { ...product, label: 'Second Best' };
                }
                return product;
            });
            
            // Clean response
            const finalProducts = labeledBatch.map(p => ({
                itemId: p.itemId,
                title: p.title,
                price: p.price,
                galleryURL: p.galleryURL,
                viewItemURL: p.viewItemURL,
                source: p.source,
                label: p.label
            }));
            
            res.status(200).json({
                products: finalProducts,
                aiSummary: aiResult.summary,
                bestChoiceId: aiResult.bestChoiceId,
                totalCount: allProducts.length,
                sessionId,
                originalSearchTerm: session.searchTerm,
                refinedSearchTerm: session.refinedSearchTerm
            });
        }
    } catch (error) {
        console.error('❌ SEARCH ERROR:', {
            message: error.message,
            stack: error.stack,
            searchTerm,
            country
        });
        res.status(500).json({ error: 'An internal server error occurred. Please try again later.' });
    }
};

// Get available countries from search providers
export const getAvailableCountries = async (req, res) => {
    try {
        console.log('[SearchController] Getting available countries...');
        
        // Wait for providers to load if they haven't yet
        let retries = 0;
        while (searchProviders.length === 0 && retries < 10) {
            console.log('   Waiting for providers to load...');
            await new Promise(resolve => setTimeout(resolve, 100));
            retries++;
        }

        if (searchProviders.length === 0) {
            return res.status(500).json({ error: 'Search providers not available' });
        }

        // Collect all countries from providers
        const countryMap = new Map();
        
        // Get global providers (those without specific countries - available everywhere)
        const globalProviders = searchProviders.filter(p => 
            p.enabled && (!p.countries || p.countries.length === 0)
        );
        
        // Get country-specific providers and extract unique countries
        const countrySpecificProviders = searchProviders.filter(p => 
            p.enabled && p.countries && p.countries.length > 0
        );

        // Build country list from actual provider configurations
        const countryNames = {
            'BD': { name: 'Bangladesh', flag: '🇧🇩' },
            'US': { name: 'United States', flag: '🇺🇸' },
            'UK': { name: 'United Kingdom', flag: '🇬🇧' },
            'CA': { name: 'Canada', flag: '🇨🇦' },
            'DE': { name: 'Germany', flag: '🇩🇪' },
            'AU': { name: 'Australia', flag: '🇦🇺' },
            'FR': { name: 'France', flag: '🇫🇷' },
            'IT': { name: 'Italy', flag: '🇮🇹' },
            'ES': { name: 'Spain', flag: '🇪🇸' },
            'IN': { name: 'India', flag: '🇮🇳' },
            'JP': { name: 'Japan', flag: '🇯🇵' }
        };

        // Add each country that has specific providers
        countrySpecificProviders.forEach(provider => {
            provider.countries.forEach(countryCode => {
                const countryInfo = countryNames[countryCode] || { 
                    name: countryCode, 
                    flag: '🌐' 
                };

                if (!countryMap.has(countryCode)) {
                    countryMap.set(countryCode, {
                        code: countryCode,
                        name: countryInfo.name,
                        flag: countryInfo.flag,
                        providers: [
                            // Add global providers first (available for all countries)
                            ...globalProviders.map(p => ({ 
                                name: p.name, 
                                type: p.type,
                                scope: 'global'
                            })),
                            // Add country-specific provider
                            { 
                                name: provider.name, 
                                type: provider.type,
                                scope: 'country-specific'
                            }
                        ]
                    });
                } else {
                    // Add this country-specific provider to existing country
                    const existing = countryMap.get(countryCode);
                    existing.providers.push({ 
                        name: provider.name, 
                        type: provider.type,
                        scope: 'country-specific'
                    });
                }
            });
        });

        // Convert to array and sort
        const countries = Array.from(countryMap.values())
            .sort((a, b) => a.name.localeCompare(b.name));

        console.log(`[SearchController] Found ${countries.length} available countries`);
        console.log(`[SearchController] Global providers: ${globalProviders.map(p => p.name).join(', ')}`);
        console.log(`[SearchController] Country-specific providers: ${countrySpecificProviders.map(p => `${p.name} (${p.countries.join(', ')})`).join(', ')}`);
        
        res.status(200).json({
            countries,
            globalProviders: globalProviders.map(p => ({ name: p.name, type: p.type })),
            totalProviders: searchProviders.length,
            enabledProviders: searchProviders.filter(p => p.enabled).length
        });

    } catch (error) {
        console.error('[SearchController] Error getting countries:', error);
        res.status(500).json({ error: 'Failed to get available countries' });
    }
};
