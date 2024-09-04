import express from 'express';
import { getUserData } from '../controllers/userController.js';

const router = express.Router();

router.get('/user-data', getUserData);

export default router;