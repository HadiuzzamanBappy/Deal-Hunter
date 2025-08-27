// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the client once and reuse it
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// New function to extract specific product name from user input
export const extractProductName = async (userInput) => {
    const prompt = `
        You are a product search expert. Analyze the user's search input and extract the most specific, searchable product name.
        
        User input: "${userInput}"
        
        Your task:
        1. Extract the core product name from the user's query
        2. Remove unnecessary words like "cheap", "best", "buy", "online", etc.
        3. Keep brand names and model numbers if present
        4. Make it suitable for e-commerce search engines
        5. Return ONLY the refined product name, nothing else
        
        Examples:
        - "I want to buy a cheap iPhone 15" → "iPhone 15"
        - "best gaming laptop under 1000" → "gaming laptop"
        - "Samsung Galaxy S24 Ultra review" → "Samsung Galaxy S24 Ultra"
        - "where can I find Nike Air Max shoes" → "Nike Air Max shoes"
        
        Respond with only the refined product name:
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const extractedName = response.text().trim();
        
        console.log(`[Gemini] User input: "${userInput}" → Extracted: "${extractedName}"`);
        return extractedName;
    } catch (error) {
        console.error("Error extracting product name from Gemini:", error);
        // Fallback: return original input if AI fails
        return userInput;
    }
};

export const getAiInsights = async (products, searchTerm) => {
    if (!products || products.length === 0) {
        return { summary: "I couldn't find any listings for this search. Try a different keyword.", bestChoiceId: null, secondBestId: null };
    }

    // Enhanced prompt with more context about the refined search
    const hasRefinedQuery = products[0]?.originalQuery !== products[0]?.refinedQuery;
    const originalQuery = products[0]?.originalQuery || searchTerm;
    const refinedQuery = products[0]?.refinedQuery || searchTerm;
    
    const prompt = `
        You are "Deal Hunter AI", an expert at analyzing product listings to find the best value deals.
        
        SEARCH CONTEXT:
        ${hasRefinedQuery ? 
            `- User originally searched: "${originalQuery}"
        - Refined to specific product: "${refinedQuery}"` : 
            `- User searched for: "${searchTerm}"`
        }
        
        PRODUCT DATA:
        ${JSON.stringify(products, null, 2)}
        
        ANALYSIS TASKS:
        1. Provide a concise, helpful summary (max 2-3 sentences) starting with "Here's the deal:"
        2. Consider price, product quality indicators (title details), and source reliability
        3. Pick the BEST overall value product and return its exact "itemId" as "bestChoiceId"
        4. Pick a SECOND best option and return its exact "itemId" as "secondBestId" (if applicable)
        5. Focus on value for money, not just lowest price
        
        RESPONSE FORMAT (must be valid JSON):
        {
            "summary": "Here's the deal: [Your analysis of the best options available]",
            "bestChoiceId": "exact_item_id_here", 
            "secondBestId": "exact_item_id_here_or_null"
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let aiJson;
        try {
            aiJson = JSON.parse(response.text());
        } catch (e) {
            // Enhanced fallback parsing
            const text = response.text();
            console.log('[Gemini] Failed to parse JSON, attempting fallback extraction:', text);
            
            const summaryMatch = text.match(/Here's the deal:[^\n\r]*/i);
            const bestIdMatch = text.match(/"bestChoiceId"\s*:\s*"([^"]+)"/);
            const secondIdMatch = text.match(/"secondBestId"\s*:\s*"([^"]+)"/);
            
            return {
                summary: summaryMatch ? summaryMatch[0] : "Here's the deal: Found several options - check the listings for the best fit for your needs.",
                bestChoiceId: bestIdMatch ? bestIdMatch[1] : (products[0]?.itemId || null),
                secondBestId: secondIdMatch ? secondIdMatch[1] : (products[1]?.itemId || null)
            };
        }
        
        // Validate and return structured response
        return {
            summary: aiJson.summary || "Here's the deal: Multiple options available with varying prices and features.",
            bestChoiceId: aiJson.bestChoiceId || products[0]?.itemId || null,
            secondBestId: aiJson.secondBestId || (products.length > 1 ? products[1]?.itemId : null)
        };
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        throw new Error('Failed to get insights from AI service.');
    }
};