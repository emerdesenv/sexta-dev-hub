import { ZodError } from 'zod';
import multer from 'multer';
import { ValidationError, UniqueConstraintError } from 'sequelize';

export function errorHandler(err, req, res, next) {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            message: 'Dados inválidos enviados para a API.',
            errors: err.issues.map((issue) => ({
                path: issue.path.join('.'),
                message: issue.message,
            })),
        });
    }

    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            message: `Falha no upload: ${err.message}`,
        });
    }

    if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
        return res.status(400).json({
            message: err.message,
        });
    }

    return res.status(err.status || 500).json({
        message: err.message || 'Erro interno do servidor.',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
}
