import { describe, expect, it } from 'vitest';
import {
    detectOffensiveContent,
    evaluateCommunityText,
    normalizeText
} from '../contentModerationService.js';

describe('contentModerationService', () => {
    it('normaliza texto com acentos e leetspeak', () => {
        expect(normalizeText('Ód10 @o PR0FESSOR')).toBe('odio ao professor');
    });

    it('detecta termo ofensivo com letras repetidas', () => {
        const result = detectOffensiveContent('Você é um viiiaaado');
        expect(result.blocked).toBe(true);
        expect(result.matches).toContain('viado');
    });

    it('detecta abreviação colada com outras palavras', () => {
        const result = detectOffensiveContent('vtncprofessor');
        expect(result.blocked).toBe(true);
        expect(result.matches).toContain('vtnc');
    });

    it('classifica contexto de autoagressão como high', () => {
        const result = evaluateCommunityText({ content: 'se mata logo' });
        expect(result.blocked).toBe(true);
        expect(result.severity).toBe('high');
        expect(result.contextHits).toContain('self-harm-incitement');
    });

    it('nao bloqueia mensagem neutra', () => {
        const result = evaluateCommunityText({
            title: 'Duvida de SQL',
            content: 'Alguem pode explicar join com exemplo simples?'
        });
        expect(result.blocked).toBe(false);
        expect(result.severity).toBe('low');
        expect(result.score).toBe(0);
    });
});
