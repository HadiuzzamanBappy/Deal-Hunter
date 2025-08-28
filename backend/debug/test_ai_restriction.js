// Test script to verify AI restriction works
import axios from 'axios';

const testAIRestriction = async () => {
    const apiUrl = 'http://localhost:5001';
    
    console.log('=== Testing AI Restriction Feature ===\n');
    
    // Test 1: Search without userId (not logged in)
    console.log('Test 1: Search without userId (should disable AI)');
    try {
        const response1 = await axios.post(`${apiUrl}/api/search`, {
            searchTerm: 'face wash',
            country: 'BD',
            maxResults: 5,
            sortBy: 'relevance',
            offset: 0,
            userId: null // Not logged in
        });
        
        console.log('✅ Response received');
        console.log('AI Summary:', response1.data.aiSummary);
        console.log('Best Choice ID:', response1.data.bestChoiceId);
        console.log('Second Best ID:', response1.data.secondBestId);
        console.log('AI Disabled:', response1.data.aiDisabled);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Test 2: Search with userId (logged in)
    console.log('Test 2: Search with userId (should enable AI)');
    try {
        const response2 = await axios.post(`${apiUrl}/api/search`, {
            searchTerm: 'face wash',
            country: 'BD', 
            maxResults: 5,
            sortBy: 'relevance',
            offset: 0,
            userId: 'test-user-123' // Logged in
        });
        
        console.log('✅ Response received');
        console.log('AI Summary:', response2.data.aiSummary.substring(0, 100) + '...');
        console.log('Best Choice ID:', response2.data.bestChoiceId);
        console.log('Second Best ID:', response2.data.secondBestId);
        console.log('AI Disabled:', response2.data.aiDisabled);
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
};

// Run the test
testAIRestriction().catch(console.error);
