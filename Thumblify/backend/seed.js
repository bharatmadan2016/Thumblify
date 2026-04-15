import mongoose from 'mongoose';
import User from './src/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        const existingUser = await User.findOne({ email: "dummy@example.com" });
        if (existingUser) {
            console.log("Dummy user already exists.");
            process.exit(0);
        }

        const dummyUser = new User({
            name: "Dummy User",
            email: "dummy@example.com",
            password: "password123" // Will be hashed by the model's pre-save middleware
        });

        await dummyUser.save();
        console.log("Dummy user created successfully!");
        console.log("Email: dummy@example.com");
        console.log("Password: password123");
        
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
};

seedUser();
