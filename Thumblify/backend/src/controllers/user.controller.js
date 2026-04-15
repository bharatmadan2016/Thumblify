import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

        res.status(201).json({ 
            success: true, 
            message: "User registered successfully", 
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

        res.json({ 
            success: true, 
            message: "Login successful", 
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const { name, email, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                googleId,
                // Password not required for Google users as per model change
            });
            await user.save();
        } else if (!user.googleId) {
            // Link Google account to existing email-based user
            user.googleId = googleId;
            await user.save();
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

        res.status(200).json({
            success: true,
            message: "Google Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email }
        });
    } catch (error) {
        console.error("Google Login Error:", error);
        res.status(401).json({ success: false, message: "Invalid Google token" });
    }
};
