import express from 'express';
import { generateThumbnail, getCommunityThumbnails, getUserThumbnails } from '../controllers/thumbnail.controller.js';
import { submitReview, getReviews } from '../controllers/review.controller.js';
import { register, login, googleLogin } from '../controllers/user.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/google', googleLogin);

// Thumbnail Routes
router.post('/thumbnails/generate', auth, generateThumbnail);
router.get('/thumbnails/my', auth, getUserThumbnails);
router.get('/thumbnails/community', getCommunityThumbnails);

// Review Routes
router.post('/reviews', submitReview);
router.get('/reviews', getReviews);

export default router;
