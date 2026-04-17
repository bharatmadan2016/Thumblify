import { generateThumbnail } from './src/controllers/thumbnail.controller.js';
import dotenv from 'dotenv';
dotenv.config();

const req = {
    body: {
        title: "Learn React in 2 Days",
        style: "Cyberpunk",
        includeHuman: true
    },
    user: { id: "mock_user_id" }
};

const res = {
    status: (code) => {
        console.log(`Status Code: ${code}`);
        return res;
    },
    json: (data) => {
        console.log("Response Data:", JSON.stringify(data, null, 2));
    }
};

async function testController() {
    console.log("🚦 Testing Controller Directly...");
    try {
        await generateThumbnail(req, res);
    } catch (error) {
        console.error("Controller Exploded:", error);
    }
}

testController();
