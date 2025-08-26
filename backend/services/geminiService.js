// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the client once and reuse it
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const getAiInsights = async (products, searchTerm) => {
    if (!products || products.length === 0) {
        return "I couldn't find any listings on eBay for this search. You might want to try a different keyword.";
    }

    // This is the "prompt" - the instruction we give to the AI
    const prompt = `
        You are "Deal Hunter AI", an expert at analyzing product listings to find the best value.
        A user has searched for "${searchTerm}".
        Here are the top search results from eBay in JSON format: ${JSON.stringify(products)}

        Please analyze these listings and provide a short, helpful summary (3-4 sentences) for the user.
        Focus on identifying the best overall value. Mention if there are significant price differences,
        and give a friendly tip, like checking seller feedback. Start your response with "Here's the deal:".
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        console.log(response);
        
        return response.text();
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        throw new Error('Failed to get insights from AI service.');
    }
};