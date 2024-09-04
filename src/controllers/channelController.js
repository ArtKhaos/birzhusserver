import supabase from '../config/supabase.js';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token);

export const addChannel = async (req, res) => {
    const { channel_id, title, image_url, username } = req.body;

    try {
        const { data, error } = await supabase
            .from('channels')
            .upsert({
                channel_id,
                title,
                image_url,
                username,
            });

        if (error) {
            console.error('Ошибка при добавлении канала в базу данных:', error);
            return res.status(500).json({ error: 'Ошибка при добавлении канала' });
        }

        res.json({ message: 'Канал успешно добавлен', data });
    } catch (error) {
        console.error('Ошибка при добавлении канала:', error);
        res.status(500).json({ error: 'Ошибка при добавлении канала' });
    }
};

export const getChannelInfo = async (req, res) => {
    const { username } = req.query;

    try {
        const chat = await bot.getChat(`@${username}`);
        const chatPhoto = chat.photo ? `https://api.telegram.org/file/bot${token}/${chat.photo.big_file_id}` : null;

        res.json({
            title: chat.title,
            imageUrl: chatPhoto,
            subscribers: chat.members_count,
        });
    } catch (error) {
        console.error('Ошибка при получении информации о канале:', error);
        res.status(500).json({ error: 'Ошибка при получении информации о канале' });
    }
};

export const getUserChannels = async (req, res) => {
    const { telegramId } = req.query;

    try {
        const { data: channels, error: channelsError } = await supabase
            .from('channels')
            .select('*');

        if (channelsError) {
            console.error('Ошибка при получении каналов:', channelsError);
            return res.status(500).json({ error: 'Ошибка при получении каналов' });
        }

        const userChannels = [];
        for (const channel of channels) {
            try {
                const chatMember = await bot.getChatMember(channel.channel_id, telegramId);
                if (chatMember.status === 'administrator' || chatMember.status === 'creator') {
                    userChannels.push(channel);
                }
            } catch (error) {
                console.error(`Ошибка при проверке прав пользователя в канале ${channel.channel_id}:`, error);
            }
        }

        res.json(userChannels);
    } catch (error) {
        console.error('Ошибка при получении каналов пользователя:', error);
        res.status(500).json({ error: 'Ошибка при получении каналов пользователя' });
    }
};