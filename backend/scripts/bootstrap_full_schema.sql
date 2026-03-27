SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'professor',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    locked_until DATETIME NULL,
    deleted_at DATETIME NULL,
    purge_after DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS episode (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ordering INT NOT NULL DEFAULT 0,
    title VARCHAR(160) NOT NULL,
    slug VARCHAR(180) NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    year_target INT NOT NULL,
    category VARCHAR(80) NOT NULL,
    episode_type ENUM('study', 'assessment') NOT NULL DEFAULT 'study',
    assessment_mode ENUM('quiz', 'open_text', 'mini_game') NULL,
    assessment_config JSON NULL,
    max_attempts INT NOT NULL DEFAULT 1,
    passing_score INT NOT NULL DEFAULT 60,
    time_limit_sec INT NULL,
    xp_reward INT NOT NULL DEFAULT 40,
    trophy_tier ENUM('bronze', 'silver', 'gold', 'platinum') NULL DEFAULT NULL,
    is_published TINYINT(1) NOT NULL DEFAULT 0,
    early_access_only TINYINT(1) NOT NULL DEFAULT 0,
    cover_path VARCHAR(255) NULL,
    audio_path VARCHAR(255) NULL,
    pdf_path VARCHAR(255) NULL,
    duration_label VARCHAR(40) NULL,
    tags TEXT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_gamification (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    xp_total INT NOT NULL DEFAULT 0,
    level INT NOT NULL DEFAULT 1,
    coins INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    last_activity_date DATE NULL,
    active_theme VARCHAR(30) NOT NULL DEFAULT 'default',
    profile_pro_enabled TINYINT(1) NOT NULL DEFAULT 0,
    streak_shield_count INT NOT NULL DEFAULT 0,
    early_access_enabled TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_gamification_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_episode_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    episode_id INT NOT NULL,
    completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    trophy_tier_earned ENUM('bronze', 'silver', 'gold', 'platinum') NULL DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_episode_progress UNIQUE (user_id, episode_id),
    CONSTRAINT fk_user_episode_progress_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_episode_progress_episode FOREIGN KEY (episode_id) REFERENCES episode(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_episode_attempt_credit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    episode_id INT NOT NULL,
    extra_attempts INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_episode_attempt_credit UNIQUE (user_id, episode_id),
    CONSTRAINT fk_user_episode_attempt_credit_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_episode_attempt_credit_episode FOREIGN KEY (episode_id) REFERENCES episode(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS episode_attempt (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    episode_id INT NOT NULL,
    attempt_number INT NOT NULL,
    status ENUM('in_progress', 'submitted', 'graded') NOT NULL DEFAULT 'in_progress',
    answers JSON NULL,
    score FLOAT NULL,
    passed TINYINT(1) NULL,
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_episode_attempt_user_episode (user_id, episode_id),
    CONSTRAINT fk_episode_attempt_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_episode_attempt_episode FOREIGN KEY (episode_id) REFERENCES episode(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS gamification_event (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_type VARCHAR(60) NOT NULL,
    mission_key VARCHAR(80) NULL,
    reward_key VARCHAR(80) NULL,
    reference_id VARCHAR(120) NULL,
    xp_delta INT NOT NULL DEFAULT 0,
    coins_delta INT NOT NULL DEFAULT 0,
    metadata JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gamification_event_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_mission_claim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mission_key VARCHAR(80) NOT NULL,
    period_key VARCHAR(30) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_mission_claim UNIQUE (user_id, mission_key, period_key),
    CONSTRAINT fk_user_mission_claim_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_reward_redemption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reward_key VARCHAR(80) NOT NULL,
    cost_coins INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_reward_redemption_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash VARCHAR(128) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    last_used_at DATETIME NULL,
    ip_address VARCHAR(120) NULL,
    user_agent VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_session_user (user_id),
    INDEX idx_user_session_expires (expires_at),
    CONSTRAINT fk_user_session_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS collectible_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    type ENUM('badge', 'avatar_item') NOT NULL DEFAULT 'badge',
    rarity ENUM('common', 'rare', 'epic', 'legendary') NOT NULL DEFAULT 'rare',
    icon VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    CONSTRAINT fk_limited_event_episode FOREIGN KEY (episode_id) REFERENCES episode(id),
    CONSTRAINT fk_limited_event_reward_item FOREIGN KEY (reward_item_id) REFERENCES collectible_item(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_limited_event_claim (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_limited_event_claim UNIQUE (user_id, event_id),
    INDEX idx_user_limited_event_claim_user (user_id),
    INDEX idx_user_limited_event_claim_event (event_id),
    CONSTRAINT fk_user_limited_event_claim_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_limited_event_claim_event FOREIGN KEY (event_id) REFERENCES limited_event(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_collectible (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    source_event_id INT NULL,
    acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_collectible UNIQUE (user_id, item_id, source_event_id),
    INDEX idx_user_collectible_user (user_id),
    INDEX idx_user_collectible_item (item_id),
    CONSTRAINT fk_user_collectible_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_collectible_item FOREIGN KEY (item_id) REFERENCES collectible_item(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_collectible_source_event FOREIGN KEY (source_event_id) REFERENCES limited_event(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_topic (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_user_id INT NOT NULL,
    phase TINYINT NULL,
    class_group VARCHAR(20) NULL,
    category ENUM('duvida', 'solucao', 'discussao', 'showcase') NOT NULL DEFAULT 'duvida',
    title VARCHAR(180) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('open', 'resolved', 'archived', 'hidden') NOT NULL DEFAULT 'open',
    is_anonymous TINYINT(1) NOT NULL DEFAULT 0,
    best_reply_id INT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_topic_author FOREIGN KEY (author_user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_reply (
    id INT AUTO_INCREMENT PRIMARY KEY,
    topic_id INT NOT NULL,
    author_user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_official TINYINT(1) NOT NULL DEFAULT 0,
    is_hidden TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_reply_topic FOREIGN KEY (topic_id) REFERENCES community_topic(id) ON DELETE CASCADE,
    CONSTRAINT fk_community_reply_author FOREIGN KEY (author_user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_vote (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reply_id INT NOT NULL,
    vote_type ENUM('up') NOT NULL DEFAULT 'up',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_community_vote UNIQUE (user_id, reply_id),
    CONSTRAINT fk_community_vote_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_community_vote_reply FOREIGN KEY (reply_id) REFERENCES community_reply(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_report (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_user_id INT NOT NULL,
    target_type ENUM('topic', 'reply') NOT NULL,
    target_id INT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('pending', 'reviewed', 'actioned', 'dismissed') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_report_reporter FOREIGN KEY (reporter_user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_moderation_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    moderator_user_id INT NOT NULL,
    target_type ENUM('topic', 'reply') NOT NULL,
    target_id INT NOT NULL,
    action VARCHAR(60) NOT NULL,
    reason VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_moderation_log_moderator FOREIGN KEY (moderator_user_id) REFERENCES user(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
