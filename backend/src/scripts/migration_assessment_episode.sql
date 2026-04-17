-- Migration manual para habilitar episódios avaliativos.
-- Execute no banco alvo antes de usar os novos campos.

ALTER TABLE episode
    ADD COLUMN episode_type ENUM('study', 'assessment') NOT NULL DEFAULT 'study' AFTER category,
    ADD COLUMN assessment_mode ENUM('quiz', 'open_text', 'mini_game', 'semver') NULL AFTER episode_type,
    ADD COLUMN assessment_config JSON NULL AFTER assessment_mode,
    ADD COLUMN max_attempts INT NOT NULL DEFAULT 1 AFTER assessment_config,
    ADD COLUMN passing_score INT NOT NULL DEFAULT 60 AFTER max_attempts,
    ADD COLUMN time_limit_sec INT NULL AFTER passing_score,
    ADD COLUMN xp_reward INT NOT NULL DEFAULT 40 AFTER time_limit_sec;

ALTER TABLE episode
    ADD COLUMN image_path VARCHAR(255) NULL AFTER cover_path;

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
    CONSTRAINT fk_episode_attempt_user FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT fk_episode_attempt_episode FOREIGN KEY (episode_id) REFERENCES episode (id) ON DELETE CASCADE
);
