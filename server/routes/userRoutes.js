import express from 'express';
import { getUserProfile, updateProfile, getSuggestedUsers, followUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suggested', protect, getSuggestedUsers);
router.post('/follow/:id', protect, followUser);
router.get('/:id', getUserProfile);
router.put('/update', protect, updateProfile);

export default router;
