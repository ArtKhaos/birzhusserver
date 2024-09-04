import TelegramBot from 'node-telegram-bot-api';
import supabase from './supabase.js';
import { wss } from '../server.js'; // Импорт WebSocket-сервера
import { WebSocket } from 'ws';
import dotenv from "dotenv"; // Импорт WebSocket из библиотеки ws

dotenv.config();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userToken = match[1];

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('token', userToken)
        .single();

    if (error || !data) {
        bot.sendMessage(chatId, 'Неверный токен или пользователь не найден.');
        return;
    }

    bot.sendMessage(chatId, 'Нажмите кнопку ниже, чтобы завершить авторизацию.', {
        reply_markup: {
            inline_keyboard: [[{
                text: 'Авторизоваться',
                callback_data: `auth_${userToken}`
            }]]
        }
    });
});

bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userToken = callbackQuery.data.split('_')[1];

    // Извлечение имени пользователя
    const username = callbackQuery.from.first_name || callbackQuery.from.username;
    const photoUrl = `https://t.me/i/userpic/320/${callbackQuery.from.username}.jpg`;

    const { data, error } = await supabase
        .from('users')
        .update({ telegram_id: chatId, username: username, image_url: photoUrl })
        .eq('token', userToken);

    if (error) {
        bot.sendMessage(chatId, 'Ошибка при завершении авторизации. Попробуйте еще раз.');
    } else {
        bot.sendMessage(chatId, 'Вы успешно авторизованы! Вернитесь на сайт, страница обновится автоматически');

        // Отправка сигнала на фронтенд
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'AUTH_SUCCESS', token: userToken }));
            }
        });
    }
});

bot.on('my_chat_member', async (msg) => {
    const chat = msg.chat;
    const newChatMember = msg.new_chat_member;

    console.log('Получено событие my_chat_member:', msg);

    if (newChatMember && newChatMember.status === 'administrator' && newChatMember.user.username === 'birzhusbot') {
        try {
            const chatInfo = await bot.getChat(chat.id);

            if (chatInfo.type === 'channel') {
                let chatPhotoUrl = null;
                if (chatInfo.photo) {
                    const fileId = chatInfo.photo.big_file_id;
                    const file = await bot.getFile(fileId);
                    chatPhotoUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
                }

                const { data, error } = await supabase
                    .from('channels')
                    .upsert({
                        channel_id: chatInfo.id,
                        title: chatInfo.title,
                        image_url: chatPhotoUrl,
                        username: chatInfo.username,
                    });

                if (error) {
                    console.error('Ошибка при добавлении канала в базу данных:', error);
                } else {
                    console.log('Канал успешно добавлен в базу данных:', data);
                }
            }
        } catch (error) {
            console.error('Ошибка при обработке события добавления администратора:', error);
        }
    }
});

export default bot;