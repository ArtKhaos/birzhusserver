import supabase from '../config/supabase.js';

export const getUserDataByTelegramId = async (req, res) => {
    const { telegram_id } = req.query;

    if (!telegram_id) {
        return res.status(400).json({ error: 'Telegram ID не предоставлен' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .select('username, image_url, telegram_id')
            .eq('telegram_id', telegram_id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Пользователь не найден' });
            }
            throw error;
        }

        if (!data) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(data);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
};
