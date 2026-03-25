-- Execute no MySQL se o banco já existia antes desta feature (sequelize.sync() sem alter não cria colunas novas).
-- Ajuste o nome do schema se necessário.

ALTER TABLE episode
    ADD COLUMN trophy_tier ENUM('bronze', 'silver', 'gold', 'platinum') NULL DEFAULT NULL
    AFTER xp_reward;

ALTER TABLE user_episode_progress
    ADD COLUMN trophy_tier_earned ENUM('bronze', 'silver', 'gold', 'platinum') NULL DEFAULT NULL
    AFTER completed_at;
