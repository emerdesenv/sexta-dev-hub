const VLIBRAS_SCRIPT_ID = 'vlibras-plugin-script';
const VLIBRAS_ROOT_ID = 'vlibras-plugin-root';

function isEnabledByEnv() {
  const raw = import.meta.env.VITE_ENABLE_VLIBRAS;
  if (raw === undefined) return true;
  return String(raw).toLowerCase() === 'true';
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

function createWidget() {
  if (!window.VLibras || !window.VLibras.Widget || window.__vlibrasInitialized) return;
  new window.VLibras.Widget('https://vlibras.gov.br/app');
  window.__vlibrasInitialized = true;
}

export function initVLibras() {
  if (typeof window === 'undefined' || !isEnabledByEnv()) return;

  ensureWidgetRoot();

  if (window.VLibras && window.VLibras.Widget) {
    createWidget();
    return;
  }

  const existingScript = document.getElementById(VLIBRAS_SCRIPT_ID);
  if (existingScript) return;

  const script = document.createElement('script');
  script.id = VLIBRAS_SCRIPT_ID;
  script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  script.async = true;
  script.onload = createWidget;
  document.body.appendChild(script);
}
