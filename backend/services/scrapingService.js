// backend/services/scrapingService.js
import puppeteer from 'puppeteer';

/**
 * A generic function to scrape a website and extract product data.
 * @param {object} provider - The provider configuration from searchProviders.json.
 * @param {string} keywords - The search keywords.
 * @returns {Promise<Array>} - A promise that resolves to an array of standardized product objects.
 */
export const executeScraping = async (provider, keywords) => {
    console.log(`[ScrapingService] Starting scrape for "${keywords}" on ${provider.name}`);
    
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        const searchUrl = provider.config.searchUrl.replace('__KEYWORDS__', encodeURIComponent(keywords));
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        console.log(`[ScrapingService] Navigated to ${provider.name} URL.`);

        const { productCardSelector, maxResults } = provider.config;
        await page.waitForSelector(productCardSelector, { timeout: 10000 });
        console.log(`[ScrapingService] Product cards are visible on ${provider.name}.`);

        const products = await page.$$eval(productCardSelector, (items, providerConfig) => {
            const results = [];
            const itemsToScrape = items.slice(0, providerConfig.maxResults || 10);
            const { fields } = providerConfig.mapper;

            itemsToScrape.forEach(item => {
                try {
                    const productData = { source: providerConfig.name };
                    let allFieldsFound = true;

                    for (const [key, selectorConfig] of Object.entries(fields)) {
                        let element;
                        let value = null;

                        // If selector is empty, use the product card itself
                        if (!selectorConfig.selector || selectorConfig.selector === '') {
                            element = item;
                        } else {
                            element = item.querySelector(selectorConfig.selector);
                        }

                        if (element) {
                            if (selectorConfig.attribute) {
                                value = element.getAttribute(selectorConfig.attribute);
                            } else {
                                value = element.textContent;
                            }
                        }

                        if (value) {
                            productData[key] = value.trim();
                        } else {
                            // If a required field is missing, we might not want to add it
                            allFieldsFound = false;
                            console.log(`Could not find '${key}' for an item on ${providerConfig.name}`);
                        }
                    }
                    
                    // Ensure essential fields like itemId, title, and price are present
                    if (productData.itemId && productData.title && productData.price) {
                        // Prefix itemId to ensure uniqueness
                        productData.itemId = `${providerConfig.name.toLowerCase()}-${productData.itemId}`;
                        // Clean up URL if needed
                        if (productData.viewItemURL && !productData.viewItemURL.startsWith('http')) {
                            productData.viewItemURL = new URL(productData.viewItemURL, providerConfig.baseUrl).href;
                        }
                        results.push(productData);
                    }

                } catch (e) {
                    console.log(`Could not parse an item card on ${providerConfig.name}. Error: ${e.message}`);
                }
            });
            return results;
        }, { ...provider.config, name: provider.name }); // Pass config and name to page context

        console.log(`[ScrapingService] Scraped ${products.length} items successfully from ${provider.name}.`);
        return products;

    } catch (error) {
        console.error(`[ScrapingService] A critical error occurred on ${provider.name}: ${error.message}`);
        return []; // Return empty array on failure
    } finally {
        await browser.close();
        console.log(`[ScrapingService] Browser closed for ${provider.name}.`);
    }
};
