import { describe, expect, it } from 'vitest';
import { isAccepted } from '../upload.js';

describe('upload service validation', () => {
    it('aceita cover jpg com mime valido', () => {
        expect(isAccepted({
            fieldname: 'cover',
            mimetype: 'image/jpeg',
            originalname: 'capa.jpg'
        })).toBe(true);
    });

    it('rejeita upload com application/octet-stream', () => {
        expect(isAccepted({
            fieldname: 'audio',
            mimetype: 'application/octet-stream',
            originalname: 'audio.mp3'
        })).toBe(false);
    });

    it('rejeita extensao ativa perigosa', () => {
        expect(isAccepted({
            fieldname: 'cover',
            mimetype: 'image/svg+xml',
            originalname: 'malicioso.svg'
        })).toBe(false);
    });

    it('rejeita mismatch entre campo e tipo de arquivo', () => {
        expect(isAccepted({
            fieldname: 'pdf',
            mimetype: 'image/png',
            originalname: 'arquivo.png'
        })).toBe(false);
    });
});
