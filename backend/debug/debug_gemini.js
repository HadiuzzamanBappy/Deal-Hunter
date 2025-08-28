// debug_gemini.js
// Debug script for Gemini AI response
import { getAiInsights, extractProductName } from '../services/geminiService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Load sample products from a local file or define inline
const sampleProducts = [
  {
    itemId: '12345',
    title: 'Apple MacBook Air 13-inch',
    price: '999.99 USD',
    source: 'eBay',
    galleryURL: '',
    viewItemURL: '',
    originalQuery: 'best macbook air',
    refinedQuery: 'MacBook Air 13-inch'
  },
  {
    itemId: '67890',
    title: 'Apple MacBook Pro 14-inch',
    price: '1299.99 USD',
    source: 'eBay',
    galleryURL: '',
    viewItemURL: '',
    originalQuery: 'best macbook air',
    refinedQuery: 'MacBook Air 13-inch'
  }
];

const searchTerm = 'best macbook air';

async function debugGemini() {
  console.log('=== TESTING GEMINI SERVICE ===\n');
  
  try {
    console.log('1. Testing extractProductName...');
    const refinedName = await Promise.race([
      extractProductName(searchTerm),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
    ]);
    console.log('✓ Refined product name:', refinedName);
    
    console.log('\n2. Testing getAiInsights...');
    const aiResponse = await Promise.race([
      getAiInsights(sampleProducts, searchTerm),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
    ]);
    console.log('✓ Gemini AI Response:', JSON.stringify(aiResponse, null, 2));
    
    console.log('\n=== ALL TESTS PASSED ===');
    process.exit(0);
  } catch (err) {
    console.error('❌ Debug Gemini error:', err.message);
    process.exit(1);
  }
}

debugGemini();
