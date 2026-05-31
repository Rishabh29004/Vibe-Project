import express from 'express';
import { createPost, getPosts, getFeed, likePost, commentOnPost, deletePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createPost)
  .get(getPosts);

router.get('/feed', protect, getFeed);

router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentOnPost);
router.delete('/:id', protect, deletePost);

export default router;
