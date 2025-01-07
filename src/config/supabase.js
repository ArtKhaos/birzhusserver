import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Отсутствуют ключи Supabase в переменных окружения');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});

export default supabase;