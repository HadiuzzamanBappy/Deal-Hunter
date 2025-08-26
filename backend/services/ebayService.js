// services/ebayService.js
import axios from 'axios';

export const searchEbay = async (keywords) => {
    const EBAY_API_URL = 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1';
    
    // Use the environment variable for the App ID
    const EBAY_APP_ID = process.env.EBAY_SANDBOX_APP_ID;
    if (!EBAY_APP_ID) {
        throw new Error('eBay App ID is not defined in the environment variables.');
    }

    const params = {
        'OPERATION-NAME': 'findItemsByKeywords',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': EBAY_APP_ID,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'keywords': keywords,
        'paginationInput.entriesPerPage': '10' // Get up to 10 items
    };

    try {
        const response = await axios.get(EBAY_API_URL, { params });
        const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
        
        // Clean up the data to send only what we need
        return items.map(item => ({
            itemId: item.itemId[0],
            title: item.title[0],
            galleryURL: item.galleryURL ? item.galleryURL[0] : 'https://via.placeholder.com/150',
            viewItemURL: item.viewItemURL[0],
            price: `${item.sellingStatus[0].currentPrice[0].__value__} ${item.sellingStatus[0].currentPrice[0]['@currencyId']}`,
        }));
    } catch (error) {
        console.error("Error fetching from eBay API:", error.response?.data || error.message);
        throw new Error('Failed to fetch data from eBay.');
    }
};