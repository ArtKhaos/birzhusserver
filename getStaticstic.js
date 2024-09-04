import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token);

const getChannelInfo = async (username) => {
    try {
        // Получение информации о канале
        const chat = await bot.getChat(`@${username}`);

        let chatPhotoUrl = null;
        if (chat.photo) {
            // Получение file_id для большого фото
            const fileId = chat.photo.big_file_id;

            // Получение file_path
            const file = await bot.getFile(fileId);
            chatPhotoUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        }

        console.log({
            title: chat.title,
            imageUrl: chatPhotoUrl,
            subscribers: chat.members_count, // Это значение доступно только если бот является администратором канала
        });
    } catch (error) {
        console.error('Ошибка при получении информации о канале:', error);
    }
};

// Вызов функции с нужным юзернеймом канала
getChannelInfo('dpmnhl');