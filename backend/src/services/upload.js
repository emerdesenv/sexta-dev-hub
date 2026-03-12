import multer from 'multer';
import path from 'path';
import fs from 'fs';

const root = path.resolve('uploads');
for (const dir of ['audio', 'pdf', 'images']) {
  fs.mkdirSync(path.join(root, dir), { recursive: true });
}

function inferFolder(file) {
  const mime = (file.mimetype || '').toLowerCase();
  const originalName = (file.originalname || '').toLowerCase();

  if (mime.includes('pdf') || originalName.endsWith('.pdf')) return 'pdf';
  if (
    mime.startsWith('audio/') ||
    /mp3|mpeg|ogg|wav|mp4|m4a|x-m4a|aac|octet-stream/.test(mime) ||
    /\.(mp3|ogg|wav|m4a|mp4|aac)$/i.test(originalName)
  ) {
    return 'audio';
  }

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

function isAccepted(file) {
  const mime = (file.mimetype || '').toLowerCase();
  const originalName = (file.originalname || '').toLowerCase();

  const acceptedMimes = [
    'application/pdf',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/wav',
    'audio/x-wav',
    'audio/mp4',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'application/octet-stream',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/jpg'
  ];

  const acceptedByExtension = /\.(pdf|mp3|ogg|wav|m4a|mp4|aac|png|jpg|jpeg|webp)$/i.test(originalName);
  return acceptedMimes.includes(mime) || acceptedByExtension;
}

function fileFilter(req, file, cb) {
  if (isAccepted(file)) return cb(null, true);
  cb(new Error(`Tipo de arquivo não aceito: ${file.mimetype || 'desconhecido'}`));
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});
