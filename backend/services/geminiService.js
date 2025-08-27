// services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the client once and reuse it
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const getAiInsights = async (products, searchTerm) => {
    if (!products || products.length === 0) {
        return { summary: "I couldn't find any listings for this search. Try a different keyword.", bestChoiceId: null, secondBestId: null };
    }

    // Ask for best and second best choice
    const prompt = `
        You are "Deal Hunter AI", an expert at analyzing product listings to find the best value.
        A user has searched for "${searchTerm}".
        Here are the top search results in JSON format: ${JSON.stringify(products)}

        Please:
        1. Provide a concise summary (max 2 sentences) for the user, starting with "Here's the deal:".
        2. Pick the best overall product (itemId) from the list and return its itemId as "bestChoiceId".
        3. Optionally, pick a second best product and return its itemId as "secondBestId" (if applicable).
        Respond in JSON format: { "summary": "...", "bestChoiceId": "...", "secondBestId": "..." }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let aiJson;
        try {
            aiJson = JSON.parse(response.text());
        } catch (e) {
            // fallback: try to extract summary and bestChoiceId manually
            const text = response.text();
            const summaryMatch = text.match(/Here's the deal:[^\n]*/);
            const bestIdMatch = text.match(/"bestChoiceId"\s*:\s*"([^"]+)"/);
            const secondIdMatch = text.match(/"secondBestId"\s*:\s*"([^"]+)"/);
            return {
                summary: summaryMatch ? summaryMatch[0] : text,
                bestChoiceId: bestIdMatch ? bestIdMatch[1] : null,
                secondBestId: secondIdMatch ? secondIdMatch[1] : null
            };
        }
        // Always return summary, bestChoiceId, and secondBestId (if present)
        return {
            summary: aiJson.summary || '',
            bestChoiceId: aiJson.bestChoiceId || null,
            secondBestId: aiJson.secondBestId || null
        };
    } catch (error) {
        console.error("Error fetching from Gemini API:", error);
        throw new Error('Failed to get insights from AI service.');
    }
};