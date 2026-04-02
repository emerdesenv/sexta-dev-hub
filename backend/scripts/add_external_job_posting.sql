-- Radar de Vagas Tech: cache de vagas agregadas de APIs externas.
-- Rode no MySQL de produção se o banco já existia antes desta feature.
-- Requer MySQL 8.0.13+ (defaults JSON). Alinha com backend/src/models/ExternalJobPosting.js

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS external_job_posting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source VARCHAR(80) NOT NULL,
    external_id VARCHAR(190) NOT NULL,
    title VARCHAR(220) NOT NULL,
    company_name VARCHAR(160) NULL,
    location VARCHAR(160) NULL,
    work_model ENUM('remote', 'hybrid', 'onsite', 'unknown') NOT NULL DEFAULT 'unknown',
    seniority ENUM('intern', 'junior', 'mid', 'senior', 'unknown') NOT NULL DEFAULT 'unknown',
    contract_type ENUM('clt', 'pj', 'internship', 'freelance', 'other', 'unknown') NOT NULL DEFAULT 'unknown',
    stacks JSON NOT NULL DEFAULT (JSON_ARRAY()),
    target_audience JSON NOT NULL DEFAULT (JSON_ARRAY()),
    description TEXT NULL,
    apply_url VARCHAR(2048) NOT NULL,
    source_url VARCHAR(2048) NULL,
    published_at DATETIME NULL,
    expires_at DATETIME NULL,
    last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    raw_payload JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_external_job_posting_source_external_id (source, external_id),
    KEY idx_external_job_posting_active_published (is_active, published_at),
    KEY idx_external_job_posting_seniority (seniority),
    KEY idx_external_job_posting_work_model (work_model)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
