import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    avatar: { type: String }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
