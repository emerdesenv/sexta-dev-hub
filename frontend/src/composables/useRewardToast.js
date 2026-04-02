import { ref } from 'vue';

const DEFAULT_DURATION_MS = 8000;
const rewardToast = ref({
    open: false,
    title: '',
    message: '',
    kind: 'study',
    icon: '✅'
});

let rewardToastTimer = null;

function dismissRewardToast() {
    rewardToast.value = { ...rewardToast.value, open: false };
    if (rewardToastTimer) {
        window.clearTimeout(rewardToastTimer);
        rewardToastTimer = null;
    }
}

function showRewardToast(payload, durationMs = DEFAULT_DURATION_MS) {
    if (!payload?.message) return;
    if (rewardToastTimer) {
        window.clearTimeout(rewardToastTimer);
    }
    const kind = payload.kind === 'collectible'
        ? 'collectible'
        : (payload.kind === 'badge' ? 'badge' : (payload.kind === 'trophy' ? 'trophy' : 'study'));
    rewardToast.value = {
        open: true,
        title: String(payload.title || 'Nova conquista'),
        message: String(payload.message),
        kind,
        icon: String(payload.icon || (kind === 'collectible' ? '🎁' : (kind === 'badge' || kind === 'trophy' ? '🏆' : '✅')))
    };
    rewardToastTimer = window.setTimeout(() => {
        rewardToast.value = { ...rewardToast.value, open: false };
        rewardToastTimer = null;
    }, Number(durationMs) > 0 ? Number(durationMs) : DEFAULT_DURATION_MS);
}

export function useRewardToast() {
    return {
        rewardToast,
        showRewardToast,
        dismissRewardToast
    };
}
