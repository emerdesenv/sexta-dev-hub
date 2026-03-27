import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROHIBITED_TERMS_PATH = path.resolve(__dirname, '../config/prohibitedTerms.json');

function loadProhibitedTerms() {
    try {
        const raw = fs.readFileSync(PROHIBITED_TERMS_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed
            .map((item) => String(item || '').trim())
            .filter(Boolean);
    } catch (error) {
        console.error('Falha ao carregar termos proibidos:', error.message);
        return [];
    }
}

const PROHIBITED_TERMS = loadProhibitedTerms();

const LEET_MAP = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
    '@': 'a',
    '$': 's'
};

const HIGH_SEVERITY_TERMS = new Set([
    'vai se matar',
    'preto imundo',
    'professor viado'
]);

const CONTEXT_RULES = [
    {
        key: 'self-harm-incitement',
        severity: 'high',
        regex: /\b(vai se matar|se mata|merece morrer)\b/i
    },
    {
        key: 'death-threat',
        severity: 'high',
        regex: /\b(vou te matar|eu vou te matar|quero te matar)\b/i
    },
    {
        key: 'targeted-hate',
        severity: 'high',
        regex: /\b(preto imundo|macaco imundo|viado de merda)\b/i
    },
    {
        key: 'targeted-harassment-school',
        severity: 'medium',
        regex: /\b(odeio o professor|odeio a professora|professor lixo|professora lixo)\b/i
    },
    {
        key: 'insult-targeted',
        severity: 'medium',
        regex: /\b(seu lixo|sua lixo|seu idiota|sua idiota)\b/i
    }
];

const compiledTerms = PROHIBITED_TERMS.map((term) => {
    const normalized = normalizeText(term);
    const tokenPattern = normalized
        .split(' ')
        .map((token) => escapeRegex(token))
        .join('\\s+');
    const compact = toCompactText(normalized);

    return {
        original: term,
        pattern: new RegExp(`\\b${tokenPattern}\\b`, 'i'),
        compact
    };
});

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceLeetChars(text) {
    return text.replace(/[013457@$]/g, (char) => LEET_MAP[char] || char);
}

function collapseRepeatedChars(text) {
    // Converts "viiiaaado" to "viado" to catch common bypasses.
    return text.replace(/([a-z0-9])\1+/g, '$1');
}

function toCompactText(text) {
    return String(text || '').replace(/\s+/g, '');
}

export function normalizeText(value) {
    return replaceLeetChars(
        String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ß/g, 'ss')
    )
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Keep normalization logic explicit for readability and easy tuning.
function normalizedContent(value) {
    return normalizeText(value);
}

export function detectOffensiveContent(text) {
    const normalized = normalizedContent(text);
    if (!normalized) {
        return { blocked: false, matches: [] };
    }
    const compact = toCompactText(normalized);
    const compactCollapsed = toCompactText(collapseRepeatedChars(normalized));

    const matches = [];
    for (const term of compiledTerms) {
        const matchedByBoundaries = term.pattern.test(normalized);
        const allowCompactCheck = term.compact.length >= 4;
        const matchedCompact = allowCompactCheck && (
            compact.includes(term.compact) || compactCollapsed.includes(term.compact)
        );

        if (matchedByBoundaries || matchedCompact) {
            matches.push(term.original);
        }
    }

    return {
        blocked: matches.length > 0,
        matches
    };
}

export function evaluateCommunityText({ title = '', content = '' } = {}) {
    const target = `${title} ${content}`.trim();
    const normalized = normalizedContent(target);
    if (!normalized) {
        return {
            blocked: false,
            severity: 'low',
            score: 0,
            matches: [],
            contextHits: []
        };
    }

    const detected = detectOffensiveContent(normalized);
    const contextHits = [];
    let score = 0;

    for (const matchedTerm of detected.matches) {
        score += HIGH_SEVERITY_TERMS.has(matchedTerm) ? 3 : 2;
    }

    for (const rule of CONTEXT_RULES) {
        if (rule.regex.test(normalized)) {
            contextHits.push(rule.key);
            score += rule.severity === 'high' ? 4 : 2;
        }
    }

    const severity = score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';

    return {
        blocked: severity !== 'low',
        severity,
        score,
        matches: detected.matches,
        contextHits
    };
}

export function validateCommunityText(payload) {
    return evaluateCommunityText(payload);
}
