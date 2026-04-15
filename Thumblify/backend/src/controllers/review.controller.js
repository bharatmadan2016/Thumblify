import Review from '../models/Review.js';

export const submitReview = async (req, res) => {
    try {
        const { name, content, rating } = req.body;
        
        if (!name || !content || !rating) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newReview = new Review({
            name,
            content,
            rating,
            avatar: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random`
        });

        await newReview.save();
        res.status(201).json({ success: true, data: newReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
