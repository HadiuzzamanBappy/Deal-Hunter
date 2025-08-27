// Debug script to test Daraz selectors with live website
import puppeteer from 'puppeteer';

const testDarazSelectors = async () => {
    console.log('🔍 Testing Daraz selectors...');
    
    const browser = await puppeteer.launch({
        headless: true, // Must be headless in Docker
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });

    try {
        const page = await browser.newPage();
        
        // Set user agent to avoid blocking
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        const searchUrl = 'https://www.daraz.com.bd/catalog/?q=laptop';
        console.log('🌐 Navigating to:', searchUrl);
        
        await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Wait a bit for dynamic content
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test current selectors from config
        const currentProductCardSelector = "[data-qa-locator='product-item']";
        
        console.log('🔎 Testing product card selector:', currentProductCardSelector);
        const productCards = await page.$$(currentProductCardSelector);
        console.log(`📦 Found ${productCards.length} product cards with current selector`);
        
        if (productCards.length === 0) {
            console.log('🔍 Trying alternative selectors...');
            
            const alternativeSelectors = [
                '.gridItem--Yd0sa2',
                '[data-qa-locator="product-item"]',
                '.product-item',
                '.gridItem',
                '.item-card',
                '[data-item-id]'
            ];
            
            for (const selector of alternativeSelectors) {
                const elements = await page.$$(selector);
                console.log(`   ${selector}: ${elements.length} elements`);
            }
            
            // Get page source to analyze structure
            console.log('📄 Getting page structure...');
            const pageContent = await page.content();
            
            // Look for common product container patterns
            const patterns = [
                'product-item',
                'item-card', 
                'gridItem',
                'data-qa-locator',
                'data-item-id'
            ];
            
            patterns.forEach(pattern => {
                const regex = new RegExp(pattern, 'gi');
                const matches = pageContent.match(regex);
                if (matches) {
                    console.log(`🔍 Found ${matches.length} occurrences of "${pattern}"`);
                }
            });
        } else {
            // Test field selectors on first product card
            console.log('🧪 Testing field selectors on first product...');
            const firstCard = productCards[0];
            
            const fieldSelectors = {
                itemId: "[data-item-id]",
                title: ".RfADt a",
                price: ".aBrP0 .ooOxS",
                galleryURL: ".picture-wrapper img",
                viewItemURL: ".RfADt a"
            };
            
            for (const [field, selector] of Object.entries(fieldSelectors)) {
                try {
                    const element = await firstCard.$(selector);
                    if (element) {
                        let value;
                        if (field === 'itemId') {
                            value = await element.evaluate(el => el.getAttribute('data-item-id'));
                        } else if (field === 'title' || field === 'viewItemURL') {
                            const attr = field === 'viewItemURL' ? 'href' : 'title';
                            value = await element.evaluate((el, attr) => el.getAttribute(attr) || el.textContent, attr);
                        } else if (field === 'galleryURL') {
                            value = await element.evaluate(el => el.getAttribute('src'));
                        } else {
                            value = await element.evaluate(el => el.textContent);
                        }
                        console.log(`   ✅ ${field}: ${value ? 'Found' : 'Empty'} - "${value?.substring(0, 50)}..."`);
                    } else {
                        console.log(`   ❌ ${field}: Selector "${selector}" not found`);
                    }
                } catch (error) {
                    console.log(`   ❌ ${field}: Error - ${error.message}`);
                }
            }
        }
        
        console.log('💾 Taking screenshot for manual inspection...');
        await page.screenshot({ path: '/home/wizard/Deal-Hunter/backend/debug/daraz_debug.png', fullPage: true });
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await browser.close();
    }
};

testDarazSelectors().catch(console.error);
