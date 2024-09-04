import express from 'express';
import { telegramAuth, generateToken, getUserDataByToken } from '../controllers/authController.js';

const router = express.Router();

// Маршрут для авторизации через Telegram
router.post('/auth/telegram', telegramAuth);

// Маршрут для генерации токена
router.post('/generate-token', generateToken);

// Маршрут для получения данных пользователя по токену
router.get('/user', getUserDataByToken);

export default router;