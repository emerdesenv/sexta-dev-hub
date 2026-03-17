import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { User } from '../models/index.js';

const schema = z.object({
    username: z.string().min(3),
    password: z.string().min(4)
});

export async function login(req, res) {
    const data = schema.parse(req.body);

    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não definido no ambiente.');
    }

    const user = await User.findOne({ where: { username: data.username } });
    if (!user) return res.status(401).json({ message: 'Usuário ou senha inválidos.' });

    const valid = await user.checkPassword(data.password);
    if (!valid) return res.status(401).json({ message: 'Usuário ou senha inválidos.' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    return res.json({ token, user: { username: user.username, role: user.role } });
}
