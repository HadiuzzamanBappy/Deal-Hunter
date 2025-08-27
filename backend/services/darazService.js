// backend/services/darazService.js
import puppeteer from 'puppeteer';

export const searchDaraz = async (keywords) => {
    console.log(`[Daraz Scraper] Starting scrape for: "${keywords}"`);
    const browser = await puppeteer.launch({ 
        headless: true,
        // --- ADD THESE TWO LINES ---
        executablePath: '/usr/bin/chromium-browser', // Point to the system-installed Chromium
        // --- END OF NEW LINES ---
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        const searchUrl = `https://www.daraz.com.bd/catalog/?q=${encodeURIComponent(keywords)}`;
        await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        console.log(`[Daraz Scraper] Navigated to URL.`);

        const productCardSelector = '[data-qa-locator="product-item"]';
        await page.waitForSelector(productCardSelector, { timeout: 10000 });
        console.log(`[Daraz Scraper] Product cards are visible.`);

        const products = await page.$$eval(productCardSelector, (items) => {
            const results = [];
            const itemsToScrape = items.slice(0, 10);

            itemsToScrape.forEach((item) => {
                try {
                    // --- ROBUST SELECTORS BASED ON THE PROVIDED HTML ---
                    const titleElement = item.querySelector('.RfADt a');
                    const priceElement = item.querySelector('.aBrP0 .ooOxS');
                    const imageElement = item.querySelector('.picture-wrapper img');

                    // Use the 'title' attribute for a cleaner title text
                    const title = titleElement?.getAttribute('title')?.trim();
                    const rawViewItemURL = titleElement?.href;
                    const price = priceElement?.textContent.trim();
                    const galleryURL = imageElement?.getAttribute('data-src') || imageElement?.src;
                    console.log(galleryURL);
                    
                    
                    // The 'data-item-id' is the best source for a unique ID
                    const itemId = item.dataset.itemId;

                    // --- VALIDATION ---
                    // Only add the product if we found the essential data
                    if (title && price && rawViewItemURL && itemId) {
                        results.push({
                            itemId: `daraz-${itemId}`,
                            source: 'Daraz',
                            title,
                            galleryURL,
                            // The URL in href is protocol-relative (starts with //), so new URL() handles it correctly.
                            viewItemURL: new URL(rawViewItemURL).href,
                            price
                        });
                    }
                } catch (e) {
                    // This will catch errors on a specific item (e.g., an ad) without crashing the whole scrape
                    console.log(`Could not parse an item card. Error: ${e.message}`);
                }
            });
            return results;
        });

        console.log(`[Daraz Scraper] Scraped ${products.length} items successfully.`);
        return products;

    } catch (error) {
        console.error(`[Daraz Scraper] A critical error occurred: ${error.message}`);
        return [];
    } finally {
        await browser.close();
        console.log(`[Daraz Scraper] Browser closed.`);
    }
};