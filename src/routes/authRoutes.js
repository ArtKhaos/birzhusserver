import express from 'express';
import { getUserDataByTelegramId } from '../controllers/authController.js';

const router = express.Router();

router.get('/user', getUserDataByTelegramId);

export default router;
