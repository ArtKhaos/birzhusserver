import supabase from '../config/supabase.js';
import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_API_KEY;
const bot = new TelegramBot(token);

export const addChannel = async (req, res) => {
    const { username } = req.body;

    try {
        // Получаем информацию о чате
        const chat = await bot.getChat(`@${username}`);

        // Определяем тип ссылки
        let channelLink;
        if (chat.username) {
            // Публичный канал
            channelLink = `https://t.me/${chat.username}`;
        } else {
            // Приватный канал - создаем пригласительную ссылку
            const inviteLink = await bot.exportChatInviteLink(chat.id);
            channelLink = inviteLink;
        }

        // Сохраняем информацию о канале в базе данных
        const { data, error } = await supabase
            .from('channels')
            .upsert({
                channel_id: chat.id,
                title: chat.title,
                image_url: chat.photo ? await bot.getFileLink(chat.photo.big_file_id) : null,
                username: chat.username || null,
                link: channelLink // Сохраняем ссылку
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
    const { channel_id } = req.query; // Используем channel_id вместо username

    try {
        const chat = await bot.getChat(channel_id); // Используем channel_id напрямую
        const chatPhoto = chat.photo ? await bot.getFileLink(chat.photo.big_file_id) : null;

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

        const botInfo = await bot.getMe();
        const userChannels = [];

        for (const channel of channels) {
            try {
                const [userChatMember, botChatMember] = await Promise.all([
                    bot.getChatMember(channel.channel_id, telegramId),
                    bot.getChatMember(channel.channel_id, botInfo.id)
                ]);

                const userIsAdmin = userChatMember.status === 'administrator' || userChatMember.status === 'creator';
                const botIsAdmin = botChatMember.status === 'administrator' || botChatMember.status === 'creator';

                if (userIsAdmin && botIsAdmin) {
                    const updatedChannelInfo = await getUpdatedChannelInfo(channel.channel_id);

                    await supabase
                        .from('channels')
                        .update({
                            title: updatedChannelInfo.title,
                            image_url: updatedChannelInfo.imageUrl,
                        })
                        .eq('channel_id', channel.channel_id);

                    userChannels.push({
                        ...channel,
                        title: updatedChannelInfo.title,
                        image_url: updatedChannelInfo.imageUrl,
                    });
                } else {
                    // Если пользователь или бот больше не администраторы, удаляем канал из базы данных
                    await supabase
                        .from('channels')
                        .delete()
                        .eq('channel_id', channel.channel_id);
                    console.log(`Канал ${channel.channel_id} удален из базы данных, так как пользователь или бот больше не администраторы.`);
                }
            } catch (error) {
                // Пропускаем каналы, где возникла ошибка, без вывода в консоль
                if (error.code !== 'ETELEGRAM' || error.response.body.error_code !== 400) {
                    console.error(`Неожиданная ошибка при проверке канала ${channel.channel_id}:`, error);
                }
            }
        }

        res.json(userChannels);
    } catch (error) {
        console.error('Ошибка при получении каналов пользователя:', error);
        res.status(500).json({ error: 'Ошибка при получении каналов пользователя' });
    }
};

// Вспомогательная функция для получения актуальной информации о канале
async function getUpdatedChannelInfo(channel_id) {
    const chat = await bot.getChat(channel_id); // Используем channel_id напрямую
    const chatPhoto = chat.photo ? await bot.getFileLink(chat.photo.big_file_id) : null;

    return {
        title: chat.title,
        imageUrl: chatPhoto,
        subscribers: chat.members_count,
    };
}
