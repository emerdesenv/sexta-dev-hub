export const collectibleIconCatalog = [
    { value: '/assets/collectibles/crown.svg', label: 'Coroa (badge)' },
    { value: '/assets/collectibles/shield.svg', label: 'Escudo (badge)' },
    { value: '/assets/collectibles/star.svg', label: 'Estrela (badge)' },
    { value: '/assets/collectibles/cap.svg', label: 'Boné (avatar)' },
    { value: '/assets/collectibles/glasses.svg', label: 'Óculos (avatar)' },
    { value: '/assets/collectibles/rocket.svg', label: 'Foguete (especial)' }
];

export function isImageIcon(value) {
    const icon = String(value || '').trim().toLowerCase();
    return icon.startsWith('/') || icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('data:image/');
}
