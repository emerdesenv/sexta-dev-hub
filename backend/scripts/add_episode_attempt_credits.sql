-- Execute no MySQL se o banco já existia antes desta feature.
-- Essa tabela guarda créditos de tentativas extras por usuário e episódio (opção A).

CREATE TABLE IF NOT EXISTS user_episode_attempt_credit (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    episode_id INT NOT NULL,
    extra_attempts INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_episode_attempt_credit (user_id, episode_id),
    INDEX idx_user_episode_attempt_credit_user (user_id),
    INDEX idx_user_episode_attempt_credit_episode (episode_id)
);

