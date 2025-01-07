export const getUserData = async (req, res) => {
    const { token } = req.query;
    console.log('Received token:', token);

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('token', token)
        .maybeSingle();

    console.log('Raw data from Supabase:', data);

    if (error) {
        console.error('Ошибка при получении данных пользователя:', error);
        return res.status(500).json({ error: 'Ошибка при получении данных пользователя' });
    }

    if (!data) {
        return res.status(404).json({ error: 'Пользователь не найден' });
    }

    console.log('Data being sent to client:', data);
    res.json(data);
};