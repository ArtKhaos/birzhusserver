import supabase from '../config/supabase.js';
import crypto from 'crypto';
import { generateUniqueToken } from '../utils/token.js';

// Функция для верификации данных от Telegram
const verifyTelegramAuth = (initData, botToken) => {
    const secret = crypto.createHash('sha256').update(botToken).digest();
    const checkString = initData.split('&').map(part => part.split('=')).sort().map(pair => pair.join('=')).join('\n');
    const hash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
    return hash === new URLSearchParams(initData).get('hash');
};

// Функция для обработки авторизации через Telegram
export const telegramAuth = async (req, res) => {
    const { initData } = req.body;
    const botToken = 'your_bot_token'; // Замените на токен вашего бота

    if (!verifyTelegramAuth(initData, botToken)) {
        return res.status(403).json({ error: 'Неверные данные авторизации' });
    }

    const userData = new URLSearchParams(initData);
    const telegramId = userData.get('id');
    const username = userData.get('username');
    const photoUrl = userData.get('photo_url'); // Убедитесь, что вы получаете photo_url

    // Сохранение или обновление данных пользователя в Supabase
    const { data, error } = await supabase
        .from('users')
        .upsert({ id: telegramId, username, image_url: photoUrl });

    if (error) {
        console.error('Ошибка при сохранении данных пользователя:', error);
        return res.status(500).json({ error: 'Ошибка при сохранении данных пользователя' });
    }

    res.json({ message: 'Пользователь успешно авторизован', data });
};

// Функция для генерации токена

export const generateToken = async (req, res) => {
    const chatId = Date.now(); // Используем временную метку как временный идентификатор
    const token = generateUniqueToken(chatId).slice(0,32);

    // Используйте фиксированное значение для username для тестирования
    const username = 'test_user';

    // Сохранение токена в базе данных
    const { data, error } = await supabase
        .from('users')
        .insert({ id: chatId, username, token }) // Убедитесь, что вы вставляете значение для username

    if (error) {
        console.error('Ошибка при сохранении токена:', error);
        return res.status(500).json({ error: 'Ошибка при генерации токена' });
    }

    res.json({ token });
};

// Функция для получения данных пользователя по токену
export const getUserDataByToken = async (req, res) => {
    const { token } = req.query;

    const { data, error } = await supabase
        .from('users')
        .select('username, image_url')
        .eq('token', token)
        .single();

    if (error || !data) {
        console.error('Ошибка при получении данных пользователя:', error);
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(data);
};
