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


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log("Gemini API Key:", process.env.GEMINI_API_KEY ? "Loaded" : "Not found");
console.log(ai)

const IMAGE_FALLBACK_URL = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";

const runAnalysis = (imagePath) => {
    return new Promise((resolve) => {
        const analyzerPath = path.join(process.cwd(), 'analyzer.py');
        const proc = spawn('python3', [analyzerPath, imagePath]);
        let stdout = '';

        proc.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        proc.stderr.on('data', (data) => {
            console.warn('[Analyzer STDERR]', data.toString());
        });

        proc.on('close', () => {
            try {
                resolve(JSON.parse(stdout));
            } catch (err) {
                console.warn('[Analyzer] Failed to parse JSON:', err.message);
                resolve({ ctr_score: 1.5, metrics: {} });
            }
        });
    });
};

const getTempBackupImage = () => {
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) return null;

    const images = fs.readdirSync(tempDir)
        .filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name))
        .map((name) => ({ name, path: path.join(tempDir, name), mtime: fs.statSync(path.join(tempDir, name)).mtime }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    const preferred = images.find((item) => item.name === 'Replace_Thumbnails.jpg');
    const backup = preferred || images[0];
    if (!backup) return null;

    try {
        return fs.readFileSync(backup.path);
    } catch (err) {
        console.warn('[Temp Backup] Unable to read temp backup image:', err.message);
        return null;
    }
};



// DesignedmPrompt

const buildPrompt = (title, style, additionalDetails) => {
    const techContext = title.toLowerCase().includes('react') ? "Include a glowing React logo icon." : "";
    const extra = additionalDetails ? `Additional detail: ${additionalDetails}.` : "";
    return `
        TASK: High-conversion YouTube Thumbnail.
        TEXT: Render "${title.toUpperCase()}" in massive 3D extruded yellow/orange typography with a thick black drop-shadow.
        STYLE: ${style} cinematic aesthetic with orange/teal lighting. ${techContext}
        SUBJECT: A central character with an enthusiastic 'OMG' reaction facing the camera.
        HOOKS: Include a glowing stylized arrow pointing at the text. 8k resolution, high saturation. ${extra}
    `.trim();
};


// TERMINAL UPDATES
export const generateThumbnail = async (req, res) => {
    const { title, style, additionalDetails, aspectRatio = '16:9' } = req.body;
    let tempPath = null;
    let imageSource = 'AI';

    if (!title) return res.status(400).json({ success: false, message: "Title is required." });

    let keepTempFile = false;
    try {
        console.log(`[Generate] Starting pipeline for: ${title}`);
        const prompt = buildPrompt(title, style || 'vibrant', additionalDetails || '');
        let imageBytes;

        // AI GENERATION 
        try {
            console.log("[AI] Requesting Nano Banana (2.5 Flash Image)...");
            
          
            const response = await ai.models.generateContent({
                // Model name: corrected to the supported Gemini image model.
                model: "gemini-2.5-flash-image", 
                contents: prompt,
                config: {
                    responseModalities: ["IMAGE"],
                    imageConfig: {
                        aspectRatio: aspectRatio, 
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
            console.error("[AI ERROR] Falling back to temp backup image:", aiError.message);
            const backupBytes = getTempBackupImage();

            if (backupBytes) {
                imageBytes = backupBytes;
                imageSource = 'Temp backup';
            } else {
                console.warn('[Temp Backup] No backup image found in temp. Falling back to stock image.');
                const fallback = await axios.get(IMAGE_FALLBACK_URL, { responseType: 'arraybuffer' });
                imageBytes = Buffer.from(fallback.data);
                imageSource = 'Fallback (Stock)';
            }
        }
        console.log(process.env.GEMINI_API_KEY);

        // --- PHASE 2: LOCAL PROCESSING ---
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        
        tempPath = path.join(tempDir, `gen_${uuidv4()}.png`);
        fs.writeFileSync(tempPath, imageBytes);

        const analysis = await runAnalysis(tempPath).catch((analysisError) => {
            console.warn('[Analysis] Falling back to default score:', analysisError.message);
            return { ctr_score: 1.5, metrics: {} };
        });
        const ctrScore = Number((analysis.ctr_score || analysis.ctrScore || 1.5).toFixed ? analysis.ctr_score.toFixed(2) : (analysis.ctr_score || analysis.ctrScore || 1.5));

        // --- PHASE 3: STORAGE & DB ---
        const host = req.get('host') || '127.0.0.1:5001';
        const localTempUrl = `${req.protocol}://${host}/temp/${path.basename(tempPath)}`;
        let imageUrl = localTempUrl;
        let upload;

        try {
            upload = await cloudinary.uploader.upload(tempPath, {
                folder: 'thumblify_v2',
                context: { title, source: imageSource, ctr: ctrScore.toString() }
            });
            imageUrl = upload.secure_url;
        } catch (uploadError) {
            console.warn('[Cloudinary] Upload failed, using temp backup URL:', uploadError.message);
            imageSource = `${imageSource} (Local temp backup)`;
            keepTempFile = true;
        }

        const record = new Thumbnail({
            userId: req.user?.id,
            title,
            style,
            userPrompt: additionalDetails || '',
            aiPrompt: prompt,
            imageUrl,
            ctrScore,
            metrics: analysis.metrics || {}
        });

        await record.save();

        const responseData = record.toObject ? record.toObject() : record;
        responseData.imageUrl = imageUrl;

        return res.status(201).json({ success: true, message: `Generated via ${imageSource}`, data: responseData });

    } catch (err) {
        console.error("[SERVER ERROR]", err);
        return res.status(500).json({ success: false, message: "Pipeline failure.", error: err.message });
    } finally {
        // Cleanup temp file only when not being used as the local fallback backup.
        if (!keepTempFile && tempPath && fs.existsSync(tempPath)) {
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
        if (!req.user?.id) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const thumbnails = await Thumbnail.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: thumbnails });
    } catch (err) { 
        res.status(500).json({ success: false, message: err.message }); 
    }
};

export const getThumbnailById = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
        const thumbnail = await Thumbnail.findById(req.params.id);
        if (!thumbnail) return res.status(404).json({ success: false, message: "Thumbnail not found" });
        if (thumbnail.userId?.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });
        res.status(200).json({ success: true, data: thumbnail });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteThumbnail = async (req, res) => {
    try {
        if (!req.user?.id) return res.status(401).json({ success: false, message: "Unauthorized" });
        const thumbnail = await Thumbnail.findById(req.params.id);
        if (!thumbnail) return res.status(404).json({ success: false, message: "Thumbnail not found" });
        if (thumbnail.userId?.toString() !== req.user.id) return res.status(403).json({ success: false, message: "Forbidden" });

        await thumbnail.remove();
        res.status(200).json({ success: true, message: "Thumbnail deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

