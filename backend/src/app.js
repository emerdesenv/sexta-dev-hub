import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import episodeRoutes from './routes/episodeRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import swaggerUi from 'swagger-ui-express';
import openApiDocument from './docs/openapi.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createCsrfProtection } from './middleware/csrf.js';

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = process.env.FRONTEND_URL
? process.env.FRONTEND_URL
    .split(',')
    .map((url) => url.trim().replace(/\/+$/, ''))
    .filter(Boolean)
: [];

console.log('🌐 Allowed CORS origins:', allowedOrigins);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.error(`❌ Origem não permitida pelo CORS: ${origin}`);
        const corsError = new Error(`Origem não permitida pelo CORS: ${origin}`);
        corsError.status = 403;
        return callback(corsError);
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

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(createCsrfProtection({ allowedOrigins }));

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
app.get('/api/openapi.json', (req, res) => {
    res.status(200).json(openApiDocument);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/auth', authRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/jobs', jobRoutes);

app.use(errorHandler);

export default app;