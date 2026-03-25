-- Execute no MySQL se o banco já existia antes desta feature.
-- MVP: eventos temporários com itens colecionáveis + claim idempotente por usuário.

CREATE TABLE IF NOT EXISTS collectible_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    type ENUM('badge', 'avatar_item') NOT NULL DEFAULT 'badge',
    rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL DEFAULT 'rare',
    icon VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS limited_event (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(160) NOT NULL,
    description VARCHAR(255) NULL,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    episode_id INT NULL,
    reward_item_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_limited_event_active_window (is_active, start_at, end_at),
    INDEX idx_limited_event_episode (episode_id),
    INDEX idx_limited_event_reward_item (reward_item_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_limited_event_claim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_event_claim (user_id, event_id),
    INDEX idx_user_event_claim_user (user_id),
    INDEX idx_user_event_claim_event (event_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_collectible (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    source_event_id INT NULL,
    acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_collectible_source (user_id, item_id, source_event_id),
    INDEX idx_user_collectible_user (user_id),
    INDEX idx_user_collectible_item (item_id),
    INDEX idx_user_collectible_source_event (source_event_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

