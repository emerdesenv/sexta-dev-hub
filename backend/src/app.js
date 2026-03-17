import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import episodeRoutes from './routes/episodeRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = process.env.FRONTEND_URL
? process.env.FRONTEND_URL.split(',').map((url) => url.trim()).filter(Boolean)
: [];

console.log('🌐 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
        return callback(null, true);
        }

        console.error(`❌ Origem não permitida pelo CORS: ${origin}`);
        return callback(new Error(`Origem não permitida pelo CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(
helmet({
    crossOriginResourcePolicy: false
})
);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use(
rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
})
);

app.use('/uploads', express.static(path.resolve('uploads')));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/episodes', episodeRoutes);

app.use(errorHandler);

export default app;