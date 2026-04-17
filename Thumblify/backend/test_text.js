import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testText() {
    console.log("🚀 Testing TEXT ONLY with new key...");
    try {
        const response = await genAI.models.generateContent({
            model: "gemini-1.5-flash", // Use a standard text model
            contents: "Say hello",
        });
        console.log("Text success:", response.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error("Text failed:", error);
    }
}

testText();
