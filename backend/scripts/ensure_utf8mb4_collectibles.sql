-- Rode no MySQL para permitir emojis no campo `icon`.
-- Necessário quando o schema/tabelas estão em utf8 (3 bytes) e você quer salvar 🧢🎁 etc.

ALTER TABLE collectible_item CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE limited_event CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_limited_event_claim CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_collectible CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

