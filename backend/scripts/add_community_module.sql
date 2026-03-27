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
);

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
);

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
);

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
);

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
);

SET @has_is_anonymous := (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'community_topic'
      AND COLUMN_NAME = 'is_anonymous'
);
SET @sql := IF(
    @has_is_anonymous = 0,
    'ALTER TABLE community_topic ADD COLUMN is_anonymous TINYINT(1) NOT NULL DEFAULT 0',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
