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
);
