import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testGeneration() {
    console.log("Starting Final Validation for gemini-2.5-flash-image...");
    try {
        const prompt = "A vibrant oil painting of a futuristic cityscape at sunset, ultra realistic, cinematic lighting";
        
        console.log("1. Calling API...");
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash-image",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                response_modalities: ["IMAGE"],
                image_config: {
                    aspectRatio: "1:1",
                    image_size: "1K"
                }
            }
        });

        console.log("2. Inspecting Response...");
        const candidate = response.candidates?.[0];
        if (!candidate) {
            console.error("No candidates found. Response:", JSON.stringify(response, null, 2));
            return;
        }

        const parts = candidate.content?.parts;
        if (!parts) {
            console.error("No parts found in candidate.");
            return;
        }

        console.log(`Found ${parts.length} parts.`);
        let imageFound = false;

        for (const part of parts) {
            if (part.inlineData) {
                console.log("Image data found! Saving to test_output.png...");
                const buffer = Buffer.from(part.inlineData.data, "base64");
                fs.writeFileSync("test_output.png", buffer);
                imageFound = true;
            } else if (part.text) {
                console.log("Text found instead:", part.text);
            }
        }

        if (!imageFound) {
            console.log("No image found in any part.");
        } else {
            console.log("✨ Test Successful! Image saved.");
        }

    } catch (error) {
        console.error("Test Failed with error:");
        console.error(error);
    }
}

testGeneration();
