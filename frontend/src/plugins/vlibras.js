const VLIBRAS_SCRIPT_ID = 'vlibras-plugin-script';
const VLIBRAS_ROOT_ID = 'vlibras-plugin-root';

function isEnabledByEnv() {
    const raw = import.meta.env.VITE_ENABLE_VLIBRAS;
    if (raw === undefined || raw === null) return true;
    const s = String(raw).trim().toLowerCase();
    if (s === '' || s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off') return false;
    return true;
}

function ensureWidgetRoot() {
    if (document.getElementById(VLIBRAS_ROOT_ID)) return;

    const root = document.createElement('div');
    root.id = VLIBRAS_ROOT_ID;
    root.setAttribute('vw', '');
    root.className = 'enabled';
    root.innerHTML = '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(root);
}

function tryMountWidget() {
    if (window.__vlibrasInitialized) return true;
    if (!window.VLibras || !window.VLibras.Widget) return false;
    try {
        // Sem args → rootPath padrão do pacote (https://www.vlibras.gov.br/app/).
        new window.VLibras.Widget();
        window.__vlibrasInitialized = true;
        // O plugin agenda a UI em `window.onload`. Em SPA, init costuma correr *depois* do load —
        // o handler novo nunca dispara; é preciso invocá-lo à mão.
        if (document.readyState === 'complete') {
            const scheduled = window.onload;
            if (typeof scheduled === 'function') {
                scheduled();
            }
        }
        return true;
    } catch (e) {
        if (import.meta.env.DEV) console.warn('[VLibras] falha ao instanciar Widget', e);
        return false;
    }
}

/** O onload do script pode disparar antes de window.VLibras.Widget existir (execução assíncrona do bundle). */
function scheduleMountWidget() {
    const maxAttempts = 60;
    const intervalMs = 50;
    let attempts = 0;
    const tick = () => {
        if (tryMountWidget()) return;
        attempts += 1;
        if (attempts < maxAttempts) {
            setTimeout(tick, intervalMs);
        } else if (import.meta.env.DEV) {
            console.warn('[VLibras] VLibras.Widget não ficou disponível após carregar o script.');
        }
    };
    tick();
}

export function initVLibras() {
    if (typeof window === 'undefined' || !isEnabledByEnv()) return;

    ensureWidgetRoot();

    if (window.VLibras && window.VLibras.Widget) {
        scheduleMountWidget();
        return;
    }

    const existingScript = document.getElementById(VLIBRAS_SCRIPT_ID);
    if (existingScript) return;

    const script = document.createElement('script');
    script.id = VLIBRAS_SCRIPT_ID;
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => scheduleMountWidget();
    script.onerror = () => {
        if (import.meta.env.DEV) {
            console.warn('[VLibras] Falha ao carregar vlibras-plugin.js (rede/CORS/bloqueio).');
        }
    };
    document.body.appendChild(script);
}
