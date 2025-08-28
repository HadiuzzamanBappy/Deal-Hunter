// Test script for keyword filtering function
import { readFileSync } from 'fs';
import path from 'path';

// Test data - simulated product results
const testProducts = [
    {
        itemId: '1',
        title: 'Neutrogena Ultra Gentle Daily Cleanser Face Wash 365ml',
        price: '$12.99',
        source: 'eBay'
    },
    {
        itemId: '2', 
        title: 'CeraVe Foaming Facial Cleanser for Normal to Oily Skin 355ml',
        price: '$11.49',
        source: 'eBay'
    },
    {
        itemId: '3',
        title: 'Nike Air Jordan Sneakers Size 10',
        price: '$150.00',
        source: 'eBay'
    },
    {
        itemId: '4',
        title: 'Garnier SkinActive Micellar Water Face Wash and Makeup Remover',
        price: '$8.99',
        source: 'eBay'
    },
    {
        itemId: '5',
        title: 'Apple iPhone 13 Pro Max 256GB',
        price: '$999.00', 
        source: 'eBay'
    },
    {
        itemId: '6',
        title: 'La Roche-Posay Effaclar Purifying Foaming Gel Wash',
        price: '$15.99',
        source: 'eBay'
    }
];

// Copy of the filtering function
const filterProductsByKeywords = (products, searchTerm) => {
    if (!searchTerm || !products || products.length === 0) {
        return products;
    }

    // Extract individual keywords from search term
    const keywords = searchTerm
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.replace(/[^\w]/g, '')) // Remove special characters
        .filter(word => word.length >= 2); // Only consider words with 2+ characters

    console.log('   Filtering keywords:', keywords);

    // Filter products that contain at least one keyword in their title
    const filteredProducts = products.filter(product => {
        if (!product.title) return false;
        
        const productTitle = product.title.toLowerCase();
        
        // Check if any keyword exists in the product title
        const hasKeyword = keywords.some(keyword => 
            productTitle.includes(keyword)
        );
        
        return hasKeyword;
    });

    console.log(`   Keyword filtering: ${products.length} → ${filteredProducts.length} products`);
    return filteredProducts;
};

// Test cases
console.log('=== Testing Keyword Filtering ===\n');

console.log('Test 1: Search term "face wash"');
const result1 = filterProductsByKeywords(testProducts, 'face wash');
console.log('Filtered results:');
result1.forEach(p => console.log(`  - ${p.title}`));

console.log('\nTest 2: Search term "cleanser"');
const result2 = filterProductsByKeywords(testProducts, 'cleanser');
console.log('Filtered results:');
result2.forEach(p => console.log(`  - ${p.title}`));

console.log('\nTest 3: Search term "iPhone"');
const result3 = filterProductsByKeywords(testProducts, 'iPhone');
console.log('Filtered results:');
result3.forEach(p => console.log(`  - ${p.title}`));

console.log('\nTest 4: Search term "gaming laptop"');
const result4 = filterProductsByKeywords(testProducts, 'gaming laptop');
console.log('Filtered results:');
result4.forEach(p => console.log(`  - ${p.title}`));
