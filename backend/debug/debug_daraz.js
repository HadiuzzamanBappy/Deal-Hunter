// backend/debug_daraz.js
import puppeteer from 'puppeteer';

// --- We are temporarily putting the scraper function here for easy testing ---
// --- Once this works, we will move it back to darazService.js ---
const searchDarazForDebug = async (keywords) => {
    console.log(`[Daraz Scraper] Starting scrape for: "${keywords}"`);
    const browser = await puppeteer.launch({ 
        headless: false, // <-- KEEP THIS FALSE TO WATCH IT WORK!
        slowMo: 50,
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
                    // --- NEW, ROBUST SELECTORS BASED ON YOUR HTML ---
                    const titleElement = item.querySelector('.RfADt a');
                    const priceElement = item.querySelector('.aBrP0 .ooOxS');
                    const imageElement = item.querySelector('.picture-wrapper img');

                    // Use the 'title' attribute for a cleaner title text
                    const title = titleElement?.getAttribute('title')?.trim();
                    const rawViewItemURL = titleElement?.href;
                    const price = priceElement?.textContent.trim();
                    const galleryURL = imageElement?.src;
                    
                    // The 'data-item-id' is the best source for a unique ID
                    const itemId = item.dataset.itemId;

                    // --- VALIDATION ---
                    // Only proceed if we have the essential data
                    if (title && price && rawViewItemURL && itemId) {
                        results.push({
                            itemId: `daraz-${itemId}`,
                            source: 'Daraz',
                            title,
                            galleryURL,
                            // The URL in href is protocol-relative (starts with //), so we add https:
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
        
        await browser.close();
        return products;

    } catch (error) {
        console.error(`[Daraz Scraper] A critical error occurred: ${error.message}`);
        await browser.close();
        return [];
    }
};


// The main function to run our test
async function main() {
  const searchTerm = 'laptop';
  console.log(`--- Starting Daraz Debug Script for: "${searchTerm}" ---`);
  
  const results = await searchDarazForDebug(searchTerm);

  console.log(`\n--- SCRAPING COMPLETE ---`);
  if (results.length > 0) {
    console.log(`Successfully scraped ${results.length} products.`);
    console.log('--- Here is the full scraped array: ---');
    console.log(JSON.stringify(results, null, 2)); // Pretty-print the entire results array
  } else {
    console.log('No products were scraped. Check the browser window for CAPTCHAs or layout changes.');
  }
  console.log('--------------------------');
}

main();