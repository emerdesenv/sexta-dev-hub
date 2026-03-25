-- Adiciona controle de ativação de usuário (aluno) no ambiente existente.
ALTER TABLE user
    ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role;

UPDATE user
SET is_active = 1
WHERE is_active IS NULL;
