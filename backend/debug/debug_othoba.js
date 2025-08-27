// backend/debug/debug_othoba.js
import puppeteer from 'puppeteer';

const testOthobaSearch = async (keywords) => {
    console.log(`[Othoba Debug] Starting scrape for: "${keywords}"`);
    const browser = await puppeteer.launch({ 
        headless: true, // Keep headless in Docker
        executablePath: '/usr/bin/chromium-browser',
        slowMo: 100,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        
        // Set a user agent to avoid being blocked
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const searchUrl = `https://othoba.com/ts/search/${encodeURIComponent(keywords)}?t=t&q=${encodeURIComponent(keywords)}`;
        console.log(`[Othoba Debug] Navigating to: ${searchUrl}`);
        
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        console.log(`[Othoba Debug] Page loaded successfully`);
        
        // Let's first check what the page title is
        const pageTitle = await page.title();
        console.log(`[Othoba Debug] Page title: ${pageTitle}`);
        
        // Let's see if there are any error messages on the page
        const pageContent = await page.content();
        console.log(`[Othoba Debug] Page content length: ${pageContent.length} characters`);
        
        // Check for specific error indicators, not just any mention of "error"
        if (pageContent.includes('internal error occurred') || pageContent.includes('We\'re sorry, an internal error occurred')) {
            console.log(`[Othoba Debug] ❌ Error page detected!`);
            console.log('First 500 characters of content:');
            console.log(pageContent.substring(0, 500));
            return [];
        }
        
        // Try to find product cards with different possible selectors
        const possibleSelectors = [
            '.product',
            '.product-card',
            '.product-item',
            '[data-product]',
            '.search-result .product',
            '.product-list .product',
            '.swiper-slide .product'
        ];
        
        let foundSelector = null;
        for (const selector of possibleSelectors) {
            const elements = await page.$$(selector);
            console.log(`[Othoba Debug] Trying selector "${selector}": found ${elements.length} elements`);
            if (elements.length > 0) {
                foundSelector = selector;
                break;
            }
        }
        
        if (!foundSelector) {
            console.log(`[Othoba Debug] ❌ No product cards found with any known selector`);
            
            // Let's try to find any elements that might contain products
            const allDivs = await page.$$('div[class*="product"]');
            console.log(`[Othoba Debug] Found ${allDivs.length} divs with 'product' in class name`);
            
            // Save a screenshot for debugging
            await page.screenshot({ path: 'othoba-debug.png', fullPage: true });
            console.log(`[Othoba Debug] Screenshot saved as othoba-debug.png`);
            
            return [];
        }
        
        console.log(`[Othoba Debug] ✅ Found products with selector: ${foundSelector}`);
        
        // Now let's try to extract data using the found selector
        const products = await page.$$eval(foundSelector, (items) => {
            const results = [];
            const itemsToTest = items.slice(0, 3); // Just test first 3 items
            
            itemsToTest.forEach((item, index) => {
                try {
                    console.log(`Analyzing item ${index + 1}:`);
                    console.log('Full HTML:', item.outerHTML.substring(0, 200) + '...');
                    
                    // Try different selectors for each field
                    const titleSelectors = ['.product-name a', '.product-title', 'h3 a', 'h4 a', 'a[title]'];
                    const priceSelectors = ['.new-price', '.price', '.product-price', '.current-price'];
                    const imageSelectors = ['.product-media img', 'img', '.product-image img'];
                    const idSelectors = ['.dl-product-id', '[data-product-id]', '[data-id]'];
                    
                    let title = null, price = null, image = null, itemId = null, viewUrl = null;
                    
                    // Find title
                    for (const selector of titleSelectors) {
                        const el = item.querySelector(selector);
                        if (el) {
                            title = el.textContent?.trim() || el.getAttribute('title')?.trim();
                            viewUrl = el.href;
                            if (title) break;
                        }
                    }
                    
                    // Find price
                    for (const selector of priceSelectors) {
                        const el = item.querySelector(selector);
                        if (el) {
                            price = el.textContent?.trim();
                            if (price) break;
                        }
                    }
                    
                    // Find image
                    for (const selector of imageSelectors) {
                        const el = item.querySelector(selector);
                        if (el) {
                            image = el.src || el.getAttribute('data-src');
                            if (image) break;
                        }
                    }
                    
                    // Find item ID
                    for (const selector of idSelectors) {
                        const el = item.querySelector(selector);
                        if (el) {
                            itemId = el.value || el.getAttribute('value') || el.textContent?.trim();
                            if (itemId) break;
                        }
                    }
                    
                    console.log(`Item ${index + 1} extracted data:`, {
                        title: title?.substring(0, 50) + '...',
                        price,
                        image: image?.substring(0, 50) + '...',
                        itemId,
                        viewUrl: viewUrl?.substring(0, 50) + '...'
                    });
                    
                    if (title || price) {
                        results.push({
                            itemId: itemId || `othoba-${Date.now()}-${index}`,
                            title: title || 'No title found',
                            price: price || 'No price found',
                            galleryURL: image || '',
                            viewItemURL: viewUrl || '',
                            source: 'Othoba'
                        });
                    }
                    
                } catch (e) {
                    console.log(`Error parsing item ${index + 1}: ${e.message}`);
                }
            });
            
            return results;
        });
        
        console.log(`[Othoba Debug] ✅ Successfully extracted ${products.length} products`);
        products.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, product);
        });
        
        return products;
        
    } catch (error) {
        console.error(`[Othoba Debug] Critical error: ${error.message}`);
        return [];
    } finally {
        await browser.close();
        console.log(`[Othoba Debug] Browser closed`);
    }
};

// Run the debug test
const main = async () => {
    console.log('=== OTHOBA DEBUG SCRIPT ===');
    const results = await testOthobaSearch('laptop');
    console.log('\n=== FINAL RESULTS ===');
    console.log(`Found ${results.length} products`);
    if (results.length > 0) {
        console.log('Sample result:', JSON.stringify(results[0], null, 2));
    }
    console.log('=== END ===');
};

main();
