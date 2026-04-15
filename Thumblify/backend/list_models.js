import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
    try {
        const models = await genAI.models.list();
        console.log("Available Models:", models.map(m => m.name));
    } catch (error) {
        console.error("List models failed:", error);
    }
}

listModels();
