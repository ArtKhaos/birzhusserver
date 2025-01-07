import express from 'express';
import { WebSocketServer } from 'ws';
import authRoutes from './routes/authRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import cors from 'cors';
import dotenv from 'dotenv';
import './config/telegramBot.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: ['https://birzhus.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));



app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', channelRoutes);
app.use('/api', userRoutes);

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Новое WebSocket-соединение');
    ws.on('message', (message) => {
        console.log(`Получено сообщение: ${message}`);
    });
});

export { wss };
