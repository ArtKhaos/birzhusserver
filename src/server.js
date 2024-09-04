import express from 'express';
import { WebSocketServer } from 'ws';
import authRoutes from './routes/authRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import './config/telegramBot.js';
import userRoutes from "./routes/userRoutes.js"; // Инициализация Telegram-бота
import cors from 'cors';

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', // Разрешить запросы с этого домена
}));

app.use(express.json());

// Использование маршрутов
app.use('/api', authRoutes);
app.use('/api', channelRoutes);
app.use('/api', userRoutes);


const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});



// Создание WebSocket-сервера
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Новое WebSocket-соединение');
    ws.on('message', (message) => {
        console.log(`Получено сообщение: ${message}`);
    });
});

export { wss };