import express from 'express';
import { searchVibe } from '../controllers/searchController.js';

const router = express.Router();

router.get('/', searchVibe);

export default router;
