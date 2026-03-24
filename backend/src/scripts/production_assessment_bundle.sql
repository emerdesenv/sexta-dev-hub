-- =========================================================
-- Sexta Dev Hub - Bundle SQL de Produção (Assessment)
-- =========================================================
-- Inclui:
-- 1) Migração de estrutura (episode + episode_attempt)
-- 2) Upsert de 3 atividades avaliativas (quiz/open_text/mini_game)
-- 3) Update avançado para critérios de resposta aberta
-- 4) Bloco opcional de reset para homologação/teste (comentado)
--
-- Observação:
-- - Requer MySQL 8+ (JSON e IF NOT EXISTS em colunas/tabela).
-- - Execute como usuário com permissão de ALTER/CREATE/INSERT/UPDATE.

START TRANSACTION;

-- =========================================================
-- 1) ALTERAÇÕES ESTRUTURAIS
-- =========================================================

ALTER TABLE episode
    ADD COLUMN IF NOT EXISTS episode_type ENUM('study', 'assessment') NOT NULL DEFAULT 'study' AFTER category,
    ADD COLUMN IF NOT EXISTS assessment_mode ENUM('quiz', 'open_text', 'mini_game') NULL AFTER episode_type,
    ADD COLUMN IF NOT EXISTS assessment_config JSON NULL AFTER assessment_mode,
    ADD COLUMN IF NOT EXISTS max_attempts INT NOT NULL DEFAULT 1 AFTER assessment_config,
    ADD COLUMN IF NOT EXISTS passing_score INT NOT NULL DEFAULT 60 AFTER max_attempts,
    ADD COLUMN IF NOT EXISTS time_limit_sec INT NULL AFTER passing_score,
    ADD COLUMN IF NOT EXISTS xp_reward INT NOT NULL DEFAULT 40 AFTER time_limit_sec;

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

-- =========================================================
-- 2) UPSERT DE ATIVIDADES AVALIATIVAS
-- =========================================================

-- 2.1) Quiz - Fundamentos ESW
INSERT INTO episode (
    ordering, title, slug, summary, year_target, category,
    episode_type, assessment_mode, assessment_config,
    max_attempts, passing_score, time_limit_sec, xp_reward,
    is_published, early_access_only,
    cover_path, audio_path, pdf_path,
    duration_label, tags, created_at, updated_at
) VALUES (
    999,
    'Missão ESW-01: Fundamentos',
    'missao-esw-01-fundamentos',
    'Quiz avaliativo sobre fundamentos de engenharia de software: requisitos, qualidade, versionamento, testes, Scrum e CI.',
    3,
    'Engenharia de Software',
    'assessment',
    'quiz',
    JSON_OBJECT(
        'questions',
        JSON_ARRAY(
            JSON_OBJECT('id','q1','prompt','Qual é o principal objetivo da Engenharia de Software?','options',JSON_ARRAY('Escrever código o mais rápido possível','Criar software com qualidade, previsibilidade e manutenção ao longo do tempo','Evitar documentação','Substituir testes por revisão manual'),'correctOptionIndex',1,'weight',1),
            JSON_OBJECT('id','q2','prompt','No modelo de requisitos, requisito funcional é aquele que:','options',JSON_ARRAY('Define linguagem de programação','Define hardware mínimo','Descreve o que o sistema deve fazer','Define prazo do projeto'),'correctOptionIndex',2,'weight',1),
            JSON_OBJECT('id','q3','prompt','Qual opção representa um requisito não funcional?','options',JSON_ARRAY('O usuário pode redefinir senha','O sistema deve responder em até 2 segundos','Cadastrar clientes','Emitir relatório mensal'),'correctOptionIndex',1,'weight',1),
            JSON_OBJECT('id','q4','prompt','Sobre versionamento com Git, um bom benefício é:','options',JSON_ARRAY('Impedir trabalho em equipe','Tornar impossível recuperar versões antigas','Permitir histórico, colaboração e rastreabilidade de mudanças','Eliminar necessidade de testes'),'correctOptionIndex',2,'weight',1),
            JSON_OBJECT('id','q5','prompt','Em Scrum, quem é responsável por priorizar o backlog do produto?','options',JSON_ARRAY('Scrum Master','Product Owner','Tech Lead','QA'),'correctOptionIndex',1,'weight',1),
            JSON_OBJECT('id','q6','prompt','Qual prática ajuda a evitar regressões em alterações de código?','options',JSON_ARRAY('Remover todos os testes antigos','Testes automatizados (unitários/integrados)','Commits sem mensagem','Deploy direto em produção sem validação'),'correctOptionIndex',1,'weight',1),
            JSON_OBJECT('id','q7','prompt','O que é dívida técnica?','options',JSON_ARRAY('Falta de pagamento da cloud','Custo futuro causado por atalhos técnicos tomados no presente','Erro exclusivo de banco de dados','Métrica de vendas'),'correctOptionIndex',1,'weight',1),
            JSON_OBJECT('id','q8','prompt','Qual princípio do SOLID incentiva uma classe, uma responsabilidade?','options',JSON_ARRAY('Open/Closed','Liskov Substitution','Interface Segregation','Single Responsibility'),'correctOptionIndex',3,'weight',1),
            JSON_OBJECT('id','q9','prompt','Code review é importante porque:','options',JSON_ARRAY('Substitui toda a estratégia de testes','Aumenta qualidade, compartilhamento de conhecimento e reduz defeitos','Diminui colaboração','Serve apenas para padronizar nome de variável'),'correctOptionIndex',1,'weight',1),
            JSON_OBJECT('id','q10','prompt','Qual cenário descreve integração contínua (CI)?','options',JSON_ARRAY('Integrar código só no final do projeto','Integrar mudanças com frequência e validar por pipeline automatizado','Fazer deploy manual sem build','Trabalhar sem branch'),'correctOptionIndex',1,'weight',1)
        )
    ),
    2, 70, 600, 60,
    1, 0,
    NULL, NULL, NULL,
    '10:00',
    'engenharia de software,quiz,avaliativo',
    NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
    ordering = VALUES(ordering),
    title = VALUES(title),
    summary = VALUES(summary),
    year_target = VALUES(year_target),
    category = VALUES(category),
    episode_type = VALUES(episode_type),
    assessment_mode = VALUES(assessment_mode),
    assessment_config = VALUES(assessment_config),
    max_attempts = VALUES(max_attempts),
    passing_score = VALUES(passing_score),
    time_limit_sec = VALUES(time_limit_sec),
    xp_reward = VALUES(xp_reward),
    is_published = VALUES(is_published),
    early_access_only = VALUES(early_access_only),
    duration_label = VALUES(duration_label),
    tags = VALUES(tags),
    updated_at = NOW();

-- 2.2) Open Text - Análise de Requisitos
INSERT INTO episode (
    ordering, title, slug, summary, year_target, category,
    episode_type, assessment_mode, assessment_config,
    max_attempts, passing_score, time_limit_sec, xp_reward,
    is_published, early_access_only,
    cover_path, audio_path, pdf_path,
    duration_label, tags, created_at, updated_at
) VALUES (
    1000,
    'Missão ESW-02: Análise de Requisitos',
    'missao-esw-02-analise-requisitos-open-text',
    'Atividade avaliativa de resposta aberta sobre levantamento e priorização de requisitos em um cenário real.',
    3,
    'Engenharia de Software',
    'assessment',
    'open_text',
    JSON_OBJECT(
        'prompt',
        'Você foi contratado para melhorar um sistema escolar que está lento e confuso para professores e alunos. Descreva: (1) dois requisitos funcionais, (2) dois requisitos não funcionais, (3) um critério de prioridade para o backlog e (4) como validaria se sua solução resolveu o problema.'
    ),
    2, 70, 900, 80,
    1, 0,
    NULL, NULL, NULL,
    '15:00',
    'engenharia de software,resposta aberta,avaliativo,requisitos',
    NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
    ordering = VALUES(ordering),
    title = VALUES(title),
    summary = VALUES(summary),
    year_target = VALUES(year_target),
    category = VALUES(category),
    episode_type = VALUES(episode_type),
    assessment_mode = VALUES(assessment_mode),
    assessment_config = VALUES(assessment_config),
    max_attempts = VALUES(max_attempts),
    passing_score = VALUES(passing_score),
    time_limit_sec = VALUES(time_limit_sec),
    xp_reward = VALUES(xp_reward),
    is_published = VALUES(is_published),
    early_access_only = VALUES(early_access_only),
    duration_label = VALUES(duration_label),
    tags = VALUES(tags),
    updated_at = NOW();

-- 2.3) Mini Game - Pipeline de Entrega
INSERT INTO episode (
    ordering, title, slug, summary, year_target, category,
    episode_type, assessment_mode, assessment_config,
    max_attempts, passing_score, time_limit_sec, xp_reward,
    is_published, early_access_only,
    cover_path, audio_path, pdf_path,
    duration_label, tags, created_at, updated_at
) VALUES (
    1001,
    'Missão ESW-03: Pipeline de Entrega',
    'missao-esw-03-pipeline-entrega-mini-game',
    'Mini game de ordenação sobre fluxo de entrega de software (planejamento até deploy).',
    3,
    'Engenharia de Software',
    'assessment',
    'mini_game',
    JSON_OBJECT(
        'gameType', 'ordering',
        'prompt', 'Ordene as etapas do fluxo de entrega contínua de software.',
        'items', JSON_ARRAY(
            JSON_OBJECT('id', 'item_1', 'label', 'Refinar requisitos e critérios de aceite', 'correctPosition', 1),
            JSON_OBJECT('id', 'item_2', 'label', 'Implementar em branch de feature', 'correctPosition', 2),
            JSON_OBJECT('id', 'item_3', 'label', 'Abrir Pull Request e revisar código', 'correctPosition', 3),
            JSON_OBJECT('id', 'item_4', 'label', 'Executar testes automatizados no CI', 'correctPosition', 4),
            JSON_OBJECT('id', 'item_5', 'label', 'Aprovar merge para branch principal', 'correctPosition', 5),
            JSON_OBJECT('id', 'item_6', 'label', 'Realizar deploy e monitoramento', 'correctPosition', 6)
        )
    ),
    2, 70, 600, 70,
    1, 0,
    NULL, NULL, NULL,
    '10:00',
    'engenharia de software,mini game,ordenacao,avaliativo',
    NOW(), NOW()
)
ON DUPLICATE KEY UPDATE
    ordering = VALUES(ordering),
    title = VALUES(title),
    summary = VALUES(summary),
    year_target = VALUES(year_target),
    category = VALUES(category),
    episode_type = VALUES(episode_type),
    assessment_mode = VALUES(assessment_mode),
    assessment_config = VALUES(assessment_config),
    max_attempts = VALUES(max_attempts),
    passing_score = VALUES(passing_score),
    time_limit_sec = VALUES(time_limit_sec),
    xp_reward = VALUES(xp_reward),
    is_published = VALUES(is_published),
    early_access_only = VALUES(early_access_only),
    duration_label = VALUES(duration_label),
    tags = VALUES(tags),
    updated_at = NOW();

-- =========================================================
-- 3) AJUSTE AVANÇADO DE CRITÉRIOS (OPEN TEXT)
-- =========================================================

UPDATE episode
SET
    assessment_config = JSON_OBJECT(
        'prompt', 'Você foi contratado para melhorar um sistema escolar que está lento e confuso para professores e alunos. Descreva: (1) dois requisitos funcionais, (2) dois requisitos não funcionais, (3) um critério de prioridade para o backlog e (4) como validaria se sua solução resolveu o problema.',
        'minLength', 200,
        'minWords', 35,
        'requiredKeywords', JSON_ARRAY(
            'requisito funcional',
            'requisito não funcional',
            'prioridade',
            'validação'
        )
    ),
    passing_score = 70,
    max_attempts = 2,
    time_limit_sec = 900,
    xp_reward = 80,
    updated_at = NOW()
WHERE slug = 'missao-esw-02-analise-requisitos-open-text'
  AND assessment_mode = 'open_text'
  AND episode_type = 'assessment';

COMMIT;

-- =========================================================
-- 4) RESET OPCIONAL DE TESTE (NÃO EXECUTA AUTOMATICAMENTE)
-- =========================================================
-- Descomente e ajuste IDs se precisar resetar tentativas:
--
-- DELETE FROM episode_attempt
-- WHERE user_id = 123
--   AND episode_id = 45;
--
-- DELETE FROM user_episode_progress
-- WHERE user_id = 123
--   AND episode_id = 45;
--
-- DELETE FROM gamification_event
-- WHERE user_id = 123
--   AND reference_id = '45'
--   AND event_type IN ('episode_assessment_passed', 'episode_completed');
