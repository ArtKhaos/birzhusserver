import supabase from '../config/supabase.js';

export const getUserData = async (req, res) => {
    const { token } = req.query;

    const { data, error } = await supabase
        .from('users')
        .select('username, image_url, telegram_id')
        .eq('token', token)
        .maybeSingle(); // Используйте maybeSingle вместо single

    if (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        return res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }

    if (!data) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(data);
};

