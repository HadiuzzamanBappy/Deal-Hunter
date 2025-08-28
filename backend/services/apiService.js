// backend/services/apiService.js
import axios from 'axios';
import _ from 'lodash';

/**
 * A generic function to call any REST API and map the results to a standardized format.
 * @param {object} provider - The provider configuration from searchProviders.json.
 * @param {string} keywords - The search keywords.
 * @returns {Promise<Array>} - A promise that resolves to an array of standardized product objects.
 */
export const executeApiSearch = async (provider, keywords) => {
    console.log(`[ApiService] Executing search for "${keywords}" on ${provider.name}`);

    // Replace placeholder in params with actual keywords and environment variables
    let paramString = JSON.stringify(provider.config.params)
        .replace('__KEYWORDS__', keywords)
        .replace('${EBAY_SANDBOX_APP_ID}', process.env.EBAY_SANDBOX_APP_ID || '');
    
    const filledParams = JSON.parse(paramString);
    
    console.log(`[ApiService] Request params:`, filledParams);

    try {
        const response = await axios.get(provider.config.apiUrl, { params: filledParams });
        
        console.log(`[ApiService] ${provider.name} response status:`, response.status);
        console.log(`[ApiService] ${provider.name} response structure:`, Object.keys(response.data));

        // Use lodash's _.get to safely access nested properties in the response
        const items = _.get(response.data, provider.config.mapper.itemsPath, []);
        
        if (!Array.isArray(items)) {
            console.error(`[ApiService] Expected an array from itemsPath "${provider.config.mapper.itemsPath}" for ${provider.name}, but got ${typeof items}.`);
            console.log(`[ApiService] Full response data:`, JSON.stringify(response.data, null, 2));
            return [];
        }

        console.log(`[ApiService] Found ${items.length} items from ${provider.name}`);

        // Map the items to our standard format using the provider's mapper
        return items.map(item => {
            const mappedItem = {
                source: provider.name,
            };
            for (const [key, valuePath] of Object.entries(provider.config.mapper.fields)) {
                let value = _.get(item, valuePath, '');
                // Handle cases where price is nested (like eBay)
                if (typeof value === 'object' && value !== null) {
                    value = `${value.__value__} ${value['@currencyId']}`;
                }
                mappedItem[key] = value;
            }
            // Add a prefix to ensure itemId is unique across providers
            mappedItem.itemId = `${provider.name.toLowerCase()}-${mappedItem.itemId}`;
            return mappedItem;
        }).slice(0, provider.config.maxResults || 30); // Limit results

    } catch (error) {
        console.error(`[ApiService] Error fetching from ${provider.name} API:`, error.response?.data || error.message);
        if (error.response?.data) {
            console.error(`[ApiService] Full error response:`, JSON.stringify(error.response.data, null, 2));
        }
        // Return an empty array on failure to not break the Promise.all chain
        return [];
    }
};
