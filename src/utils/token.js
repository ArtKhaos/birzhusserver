import { createHash } from 'crypto';

export const generateUniqueToken = (chatId) => {
    return createHash('sha256').update(String(chatId)).digest('hex');
};