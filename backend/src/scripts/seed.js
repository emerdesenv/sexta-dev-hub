import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { User } from '../models/index.js';

dotenv.config();

export async function ensureSeedAdmin() {
    const username = process.env.ADMIN_USERNAME || 'professor';
    const password = process.env.ADMIN_PASSWORD || 'prof123';
    const exists = await User.findOne({ where: { username } });
    if (exists) return;
    const password_hash = await bcrypt.hash(password, 10);
    await User.create({ username, password_hash, role: 'professor' });
    console.log(`Usuário admin criado: ${username}`);
}
