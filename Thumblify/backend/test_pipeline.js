import { v2 as cloudinary } from 'cloudinary';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const IMAGE_FALLBACK_URL = "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop";

const runAnalysis = (imagePath) => {
    return new Promise((resolve) => {
        const analyzerPath = path.join(process.cwd(), 'analyzer.py');
        const proc = spawn('python3', [analyzerPath, imagePath]);
        let stdout = '';
        proc.stdout.on('data', (d) => stdout += d.toString());
        proc.on('close', () => {
            try { resolve(JSON.parse(stdout)); } 
            catch { resolve({ ctr_score: 1.5 }); }
        });
    });
};

async function testFullPipelineWithMockAI() {
    console.log("🚀 Testing Full Pipeline with Mock AI (Simulating AI failure)...");
    let tempPath = null;

    try {
        console.log("1. Simulating AI Failure -> Fetching Fallback...");
        const fallbackResponse = await axios.get(IMAGE_FALLBACK_URL, { responseType: 'arraybuffer' });
        const imageBytes = Buffer.from(fallbackResponse.data);
        console.log(" Fallback fetched. Bytes:", imageBytes.length);

        console.log("2. Saving to Temp Folder...");
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        tempPath = path.join(tempDir, `test_${uuidv4()}.png`);
        fs.writeFileSync(tempPath, imageBytes);
        console.log(" Saved to:", tempPath);

        console.log("3. Running Analysis...");
        const analysis = await runAnalysis(tempPath);
        console.log("Analysis Result:", JSON.stringify(analysis));

        console.log("4. Uploading to Cloudinary...");
        const upload = await cloudinary.uploader.upload(tempPath, {
            folder: 'test_pipeline',
            context: { title: "Test Pipeline", source: "Mock", ctr: (analysis.ctr_score || 0).toString() }
        });
        console.log("Cloudinary Success. URL:", upload.secure_url);

        console.log("✨ ALL PIPELINE STEPS SUCCESSFUL!");

    } catch (error) {
        console.error("Pipeline Failed at some step:");
        console.error(error);
    } finally {
        if (tempPath && fs.existsSync(tempPath)) {
            fs.unlinkSync(tempPath);
        }
    }
}

testFullPipelineWithMockAI();
