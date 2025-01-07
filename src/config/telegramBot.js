import TelegramBot from 'node-telegram-bot-api';
import supabase from './supabase.js';
import dotenv from "dotenv";

dotenv.config();
const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    try {
        const { data, error } = await supabase
            .from('users')
            .upsert({
                telegram_id: userId,
                username: msg.from.username,
                image_url: `https://t.me/i/userpic/320/${msg.from.username}.jpg`
            });

        if (error) throw error;

        const webAppUrl = process.env.WEBAPP_URL || 'https://your-webapp-url.com';

        bot.sendMessage(chatId, 'Добро пожаловать! Нажмите кнопку ниже, чтобы открыть веб-приложение.', {
            reply_markup: {
                keyboard: [[{ text: 'Открыть веб-приложение', web_app: { url: webAppUrl } }]],
                resize_keyboard: true
            }
        });
    } catch (error) {
        console.error('Ошибка при обработке команды /start:', error);
        bot.sendMessage(chatId, 'Произошла ошибка. Пожалуйста, попробуйте позже.');
    }
});

bot.onText(/\/addchannel/, async (msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, 'Пожалуйста, добавьте меня в ваш канал как администратора, затем перешлите любое сообщение из канала сюда.');
});

bot.on('channel_post', async (msg) => {
    if (msg.chat.type === 'channel') {
        const channelId = msg.chat.id;
        const channelTitle = msg.chat.title;
        const channelUsername = msg.chat.username;

        try {
            const chatInfo = await bot.getChat(channelId);
            const chatPhotoUrl = chatInfo.photo ? await bot.getFileLink(chatInfo.photo.big_file_id) : null;

            const { data, error } = await supabase
                .from('channels')
                .upsert({
                    channel_id: channelId,
                    title: channelTitle,
                    username: channelUsername,
                    image_url: chatPhotoUrl,
                    link: `https://t.me/${channelUsername}`,
                    status: true
                });

            if (error) throw error;

            bot.sendMessage(channelId, 'Канал успешно добавлен в систему!');
        } catch (error) {
            console.error('Ошибка при добавлении канала:', error);
            bot.sendMessage(channelId, 'Произошла ошибка при добавлении канала. Пожалуйста, попробуйте позже.');
        }
    }
});

export default bot;
