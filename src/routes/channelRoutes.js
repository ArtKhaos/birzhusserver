import express from 'express';
import { addChannel, getChannelInfo, getUserChannels } from '../controllers/channelController.js';

const router = express.Router();

router.post('/add-channel', addChannel);
router.get('/get-channel-info', getChannelInfo);
router.get('/user-channels', getUserChannels);

export default router;