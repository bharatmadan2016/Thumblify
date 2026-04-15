// import { GoogleGenAI } from '@google/genai';
// import { v2 as cloudinary } from 'cloudinary';
// import Thumbnail from '../models/Thumbnail.js';
// import { spawn } from 'child_process';
// import path from 'path';
// import fs from 'fs';
// import { v4 as uuidv4 } from 'uuid';
// import dotenv from 'dotenv';
// import axios from 'axios';

// dotenv.config();

// // Configuration
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// // Official SDK Pattern: Use Object-based initialization
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// // Fallback image for production resilience
// const IMAGE_FALLBACK_URL = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";

// /**
//  * High-Conversion Prompt Engineering
//  */
// const buildPrompt = (title, style, includeHuman) => {
//     const techContext = title.toLowerCase().includes('react') ? "Include a glowing React logo icon." : "";
//     return `
//         TASK: High-conversion YouTube Thumbnail.
//         TEXT: Render "${title.toUpperCase()}" in massive 3D extruded yellow/orange typography with a thick black drop-shadow.
//         STYLE: ${style} cinematic aesthetic with orange/teal lighting. ${techContext}
//         SUBJECT: ${includeHuman ? "A central character with an enthusiastic 'OMG' reaction facing the camera." : "Vibrant tech-inspired symbolic centerpieces."}
//         HOOKS: Include a glowing stylized arrow pointing at the text. 8k resolution, high saturation.
//     `.trim();
// };

// const runAnalysis = (imagePath) => {
//     return new Promise((resolve) => {
//         const analyzerPath = path.join(process.cwd(), 'analyzer.py');
//         const proc = spawn('python3', [analyzerPath, imagePath]);
//         let stdout = '';
//         proc.stdout.on('data', (d) => stdout += d.toString());
//         proc.on('close', () => {
//             try { resolve(JSON.parse(stdout)); } 
//             catch { resolve({ ctr_score: 1.5 }); }
//         });
//     });
// };

// /**
//  * Controller: Optimized for Stability and official "Nano Banana" patterns.
//  */
// export const generateThumbnail = async (req, res) => {
//     const { title, style, includeHuman, aspectRatio = '16:9' } = req.body;
//     let tempPath = null;
//     let imageSource = 'AI';

//     if (!title) return res.status(400).json({ success: false, message: "Title is required." });

//     try {
//         console.log(`[Generate] Starting pipeline for: ${title}`);
//         const prompt = buildPrompt(title, style || 'vibrant', !!includeHuman);
//         let imageBytes;

//         // --- PHASE 1: AI GENERATION (Official Documentation Style) ---
//         try {
//             console.log("[AI] Requesting Gemini 2.5 Flash Image...");
//             const response = await ai.models.generateContent({
//                 model: "gemini-2.5-flash-image",
//                 contents: prompt, // Official doc simplified string support
//                 config: {
//                     response_modalities: ["IMAGE"],
//                     image_config: { aspectRatio, image_size: "1K" }
//                 }
//             });

//             // CRITICAL: Safe parsing to prevent Nodemon crashes
//             const candidate = response.candidates?.[0];
//             if (!candidate) throw new Error("API returned no candidates (Check safety filters or quota).");

//             const parts = candidate.content?.parts;
//             const imagePart = parts?.find(p => p.inlineData);

//             if (!imagePart) {
//                 console.warn("[AI Warning] Parts returned but no image data found. Returning text:", parts?.[0]?.text);
//                 throw new Error("Model returned text instead of an image.");
//             }

//             imageBytes = Buffer.from(imagePart.inlineData.data, 'base64');
//             console.log("[AI] Success. Image bytes captured.");
//         } catch (aiError) {
//             console.error("[AI ERROR] Falling back to stock image:", aiError.message);
//             const fallback = await axios.get(IMAGE_FALLBACK_URL, { responseType: 'arraybuffer' });
//             imageBytes = Buffer.from(fallback.data);
//             imageSource = 'Fallback (Stock)';
//         }

//         // --- PHASE 2: PROCESSING & ANALYSIS ---
//         const tempDir = path.join(process.cwd(), 'temp');
//         if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
//         tempPath = path.join(tempDir, `gen_${uuidv4()}.png`);
//         fs.writeFileSync(tempPath, imageBytes);

//         const analysis = await runAnalysis(tempPath);
        
//         // --- PHASE 3: STORAGE & DB ---
//         const upload = await cloudinary.uploader.upload(tempPath, {
//             folder: 'thumblify_v2',
//             context: { title, source: imageSource, ctr: (analysis.ctr_score || 0).toString() }
//         });

//         const record = new Thumbnail({
//             userId: req.user?.id,
//             title,
//             style,
//             aiPrompt: prompt,
//             imageUrl: upload.secure_url,
//             ctrScore: analysis.ctr_score || 0,
//             metrics: analysis.metrics || {}
//         });

//         await record.save();

//         return res.status(201).json({ success: true, message: `Generated via ${imageSource}`, data: record });

//     } catch (err) {
//         console.error("[CRITICAL SERVER ERROR]", err);
//         return res.status(500).json({ success: false, message: "Server-side pipeline failure.", error: err.message });
//     } finally {
//         if (tempPath && fs.existsSync(tempPath)) {
//             try { fs.unlinkSync(tempPath); } catch {}
//         }
//     }
// };

// /** Get Community Feed */
// export const getCommunityThumbnails = async (req, res) => {
//     try {
//         const thumbnails = await Thumbnail.find().sort({ createdAt: -1 }).limit(50);
//         res.status(200).json({ success: true, data: thumbnails });
//     } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

// /** Get User Generations */
// export const getUserThumbnails = async (req, res) => {
//     try {
//         if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
//         const thumbnails = await Thumbnail.find({ userId: req.user.id }).sort({ createdAt: -1 });
//         res.status(200).json({ success: true, data: thumbnails });
//     } catch (err) { res.status(500).json({ success: false, message: err.message }); }
// };

import { GoogleGenAI } from '@google/genai';
import { v2 as cloudinary } from 'cloudinary';
import Thumbnail from '../models/Thumbnail.js';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// --- Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// FIX 1: Correct initialization for the @google/genai SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const IMAGE_FALLBACK_URL = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";

/**
 * High-Conversion Prompt Engineering
 */
const buildPrompt = (title, style, includeHuman) => {
    const techContext = title.toLowerCase().includes('react') ? "Include a glowing React logo icon." : "";
    return `
        TASK: High-conversion YouTube Thumbnail.
        TEXT: Render "${title.toUpperCase()}" in massive 3D extruded yellow typography.
        STYLE: ${style} cinematic aesthetic with orange/teal lighting. ${techContext}
        SUBJECT: ${includeHuman ? "A central character with an enthusiastic reaction." : "Vibrant tech-inspired symbolic centerpieces."}
        HOOKS: 8k resolution, high saturation, sharp focus.
    `.trim();
};

/**
 * Controller: Optimized for Gemini 2.5 Flash Image (Nano Banana)
 */
export const generateThumbnail = async (req, res) => {
    const { title, style, includeHuman, aspectRatio = '16:9' } = req.body;
    let tempPath = null;
    let imageSource = 'AI';

    if (!title) return res.status(400).json({ success: false, message: "Title is required." });

    try {
        console.log(`[Generate] Starting pipeline for: ${title}`);
        const prompt = buildPrompt(title, style || 'vibrant', !!includeHuman);
        let imageBytes;

        // --- PHASE 1: AI GENERATION ---
        try {
            console.log("[AI] Requesting Nano Banana (2.5 Flash Image)...");
            
            // FIX 2: Use 'config' with camelCase properties (responseModalities, imageConfig)
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash-image",
                contents: prompt,
                config: {
                    responseModalities: ["IMAGE"],
                    imageConfig: {
                        aspectRatio: aspectRatio, // e.g., "16:9"
                        imageSize: "1K"
                    }
                }
            });

            // FIX 3: Safe parsing of the multipart response
            const candidate = response.candidates?.[0];
            const imagePart = candidate?.content?.parts?.find(p => p.inlineData);

            if (!imagePart) {
                console.warn("[AI Warning] No image data. Check if safety filters blocked it.");
                throw new Error("Model returned text instead of an image.");
            }

            imageBytes = Buffer.from(imagePart.inlineData.data, 'base64');
            console.log("[AI] Success. Image bytes captured.");

        } catch (aiError) {
            console.error("[AI ERROR] Falling back to stock image:", aiError.message);
            const fallback = await axios.get(IMAGE_FALLBACK_URL, { responseType: 'arraybuffer' });
            imageBytes = Buffer.from(fallback.data);
            imageSource = 'Fallback (Stock)';
        }

        // --- PHASE 2: LOCAL PROCESSING ---
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        tempPath = path.join(tempDir, `gen_${uuidv4()}.png`);
        fs.writeFileSync(tempPath, imageBytes);

        // --- PHASE 3: STORAGE & DB ---
        const upload = await cloudinary.uploader.upload(tempPath, {
            folder: 'thumblify_v2',
            context: { title, source: imageSource }
        });

        const record = new Thumbnail({
            userId: req.user?.id,
            title,
            style,
            aiPrompt: prompt,
            imageUrl: upload.secure_url,
            ctrScore: 0 // Analysis step can be added here
        });

        await record.save();

        return res.status(201).json({ success: true, message: `Generated via ${imageSource}`, data: record });

    } catch (err) {
        console.error("[SERVER ERROR]", err);
        return res.status(500).json({ success: false, message: "Pipeline failure.", error: err.message });
    } finally {
        // Cleanup temp file
        if (tempPath && fs.existsSync(tempPath)) {
            try { fs.unlinkSync(tempPath); } catch {}
        }
    }
};
export const getCommunityThumbnails = async (req, res) => {
    try {
        const thumbnails = await Thumbnail.find().sort({ createdAt: -1 }).limit(50);
        res.status(200).json({ success: true, data: thumbnails });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};
export const getUserThumbnails = async (req, res) => {
    try {
        // Ensure you have auth middleware providing req.user
        if (!req.user?.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const thumbnails = await Thumbnail.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: thumbnails });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};