import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileTypeFromFile } from 'file-type';

const root = path.resolve('uploads');

for (const dir of ['audio', 'pdf', 'images']) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function inferFolder(file) {
    if (file.fieldname === 'pdf') return 'pdf';
    if (file.fieldname === 'audio') return 'audio';
    return 'images';
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(root, inferFolder(file)));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || '').toLowerCase() || '.bin';
        const safeBase = path
        .basename(file.originalname || 'arquivo', ext)
        .replace(/[^a-zA-Z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();

        cb(null, `${Date.now()}-${safeBase}${ext}`);
    }
});

const BLOCKED_EXTENSIONS = new Set([
    '.html', '.htm', '.svg', '.js', '.mjs', '.cjs', '.ts',
    '.php', '.asp', '.aspx', '.jsp', '.sh', '.bat', '.cmd'
]);

const FIELD_RULES = {
    cover: {
        mimes: new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
        exts: new Set(['.png', '.jpg', '.jpeg', '.webp'])
    },
    image: {
        mimes: new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp']),
        exts: new Set(['.png', '.jpg', '.jpeg', '.webp'])
    },
    audio: {
        mimes: new Set([
            'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav',
            'audio/x-wav', 'audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac'
        ]),
        exts: new Set(['.mp3', '.ogg', '.wav', '.m4a', '.mp4', '.aac'])
    },
    pdf: {
        mimes: new Set(['application/pdf']),
        exts: new Set(['.pdf'])
    }
};

export function isAccepted(file) {
    const mime = String(file.mimetype || '').toLowerCase();
    const originalName = String(file.originalname || '').toLowerCase();
    const ext = path.extname(originalName);
    const rule = FIELD_RULES[file.fieldname];

    if (!rule) return false;
    if (!ext || BLOCKED_EXTENSIONS.has(ext)) return false;

    return rule.mimes.has(mime) && rule.exts.has(ext);
}

const SIGNATURE_RULES = {
    cover: {
        mimes: new Set(['image/png', 'image/jpeg', 'image/webp']),
        exts: new Set(['png', 'jpg', 'jpeg', 'webp'])
    },
    image: {
        mimes: new Set(['image/png', 'image/jpeg', 'image/webp']),
        exts: new Set(['png', 'jpg', 'jpeg', 'webp'])
    },
    audio: {
        mimes: new Set(['audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac']),
        exts: new Set(['mp3', 'ogg', 'wav', 'mp4', 'aac'])
    },
    pdf: {
        mimes: new Set(['application/pdf']),
        exts: new Set(['pdf'])
    }
};

async function assertFileSignature(file, rule) {
    const detected = await fileTypeFromFile(file.path);
    if (!detected) return false;
    return rule.mimes.has(detected.mime) && rule.exts.has(detected.ext);
}

export async function validateUploadedFilesSignature(files = {}) {
    for (const [field, entries] of Object.entries(files)) {
        const rule = SIGNATURE_RULES[field];
        if (!rule || !Array.isArray(entries)) continue;

        for (const file of entries) {
            const ok = await assertFileSignature(file, rule);
            if (!ok) {
                if (file?.path && fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                const error = new Error(`Arquivo inválido para o campo ${field}.`);
                error.status = 400;
                throw error;
            }
        }
    }
}

function fileFilter(req, file, cb) {
    if (isAccepted(file)) return cb(null, true);
    const error = new Error(`Tipo de arquivo não aceito: ${file.mimetype || 'desconhecido'}`);
    error.status = 400;
    cb(error);
}

export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }
});
