import mongoose from 'mongoose';

const thumbnailSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // Link to user
    title: { type: String, required: true },
    userPrompt: { type: String },
    aiPrompt: { type: String },
    imageUrl: { type: String, required: true },
    style: { type: String },
    aspectRatio: { type: String },
    colorScheme: { type: String },
    ctrScore: { type: Number },
    metrics: {
        brightness: Number,
        contrast: Number,
        edgeDensity: Number,
        colorfulness: Number
    }
}, { timestamps: true });

export default mongoose.model('Thumbnail', thumbnailSchema);
