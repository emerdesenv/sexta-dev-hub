import dotenv from 'dotenv';
import slugify from 'slugify';
import { connectDatabase, sequelize } from '../config/database.js';
import { Episode } from '../models/index.js';

dotenv.config();

const MOCK_EPISODES = [
    {
        ordering: 101,
        title: 'Mock EP 01 - Setup de Projeto Profissional',
        summary: 'Episódio mock para testar missão, ranking e ganho de selos.',
        year_target: 1,
        category: 'Fundamentos',
        duration_label: '5min',
        tags: ['mock', 'setup', 'gamificação']
    },
    {
        ordering: 102,
        title: 'Mock EP 02 - Git para Fluxo de Equipe',
        summary: 'Episódio mock focado em versionamento e colaboração em equipe.',
        year_target: 1,
        category: 'Git e Versionamento',
        duration_label: '6min',
        tags: ['mock', 'git', 'colaboração']
    },
    {
        ordering: 103,
        title: 'Mock EP 03 - Boas Práticas de Commit',
        summary: 'Episódio mock com padrão de commit e revisão de histórico.',
        year_target: 2,
        category: 'Controle de Versão',
        duration_label: '5min',
        tags: ['mock', 'commit', 'práticas']
    },
    {
        ordering: 104,
        title: 'Mock EP 04 - Revisão de Pull Request',
        summary: 'Episódio mock para testar progresso mensal de episódios.',
        year_target: 2,
        category: 'Code Review',
        duration_label: '7min',
        tags: ['mock', 'pull-request', 'review']
    },
    {
        ordering: 105,
        title: 'Mock EP 05 - Testes Básicos de API',
        summary: 'Episódio mock com foco em validação de API e qualidade.',
        year_target: 3,
        category: 'Qualidade de Código',
        duration_label: '8min',
        tags: ['mock', 'testes', 'api']
    },
    {
        ordering: 106,
        title: 'Mock EP 06 - Documentação Técnica Curta',
        summary: 'Episódio mock para reforçar hábitos de documentação técnica.',
        year_target: 3,
        category: 'Soft Skills Técnicas',
        duration_label: '5min',
        tags: ['mock', 'documentação', 'comunicação']
    },
    {
        ordering: 107,
        title: 'Mock EP 07 - Planejamento de Sprint',
        summary: 'Episódio mock para organizar sprint com foco em entrega incremental.',
        year_target: 2,
        category: 'Gestão Ágil',
        duration_label: '6min',
        tags: ['mock', 'sprint', 'ágil']
    },
    {
        ordering: 108,
        title: 'Mock EP 08 - Refatoração Segura',
        summary: 'Episódio mock sobre refatoração com baixo risco em bases existentes.',
        year_target: 3,
        category: 'Qualidade de Código',
        duration_label: '7min',
        tags: ['mock', 'refatoração', 'qualidade']
    },
    {
        ordering: 109,
        title: 'Mock EP 09 - API REST Consistente',
        summary: 'Episódio mock com padrões de contratos, status code e versionamento.',
        year_target: 2,
        category: 'Backend',
        duration_label: '8min',
        tags: ['mock', 'api', 'rest']
    },
    {
        ordering: 110,
        title: 'Mock EP 10 - Observabilidade Básica',
        summary: 'Episódio mock para logs, métricas e rastreabilidade em produção.',
        year_target: 3,
        category: 'DevOps',
        duration_label: '6min',
        tags: ['mock', 'logs', 'monitoramento']
    },
    {
        ordering: 111,
        title: 'Mock EP 11 - Testes de Integracao',
        summary: 'Episódio mock de testes de integração no fluxo de APIs.',
        year_target: 3,
        category: 'Testes',
        duration_label: '9min',
        tags: ['mock', 'testes', 'integração']
    },
    {
        ordering: 112,
        title: 'Mock EP 12 - Segurança em Autenticação',
        summary: 'Episódio mock com boas práticas de auth, token e proteção de rotas.',
        year_target: 3,
        category: 'Segurança',
        duration_label: '7min',
        tags: ['mock', 'segurança', 'auth']
    },
    {
        ordering: 113,
        title: 'Mock EP 13 - SemVer na Prática',
        summary: 'Desafio avaliativo de versionamento semântico para preencher MAJOR.MINOR.PATCH.',
        year_target: 2,
        category: 'Git e Versionamento',
        duration_label: '4min',
        tags: ['mock', 'semver', 'versionamento'],
        episode_type: 'assessment',
        assessment_mode: 'semver',
        assessment_config: {
            prompt: 'Você lançou uma nova funcionalidade compatível com versões anteriores e corrigiu um bug sem quebrar API. A versão atual era 2.3.4. Qual deve ser a nova versão?',
            expected: {
                major: 2,
                minor: 4,
                patch: 0
            }
        },
        max_attempts: 2,
        passing_score: 100,
        xp_reward: 65
    },
    {
        ordering: 114,
        title: 'Mock EP 14 - Debug por Logs',
        summary: 'Atividade avaliativa de diagnóstico com base em logs de erro e causa raiz.',
        year_target: 2,
        category: 'Debugging',
        duration_label: '6min',
        tags: ['mock', 'debug', 'logs'],
        episode_type: 'assessment',
        assessment_mode: 'quiz',
        assessment_config: {
            questions: [
                {
                    id: 'dbg_q1',
                    prompt: 'Log: "SequelizeHostNotFoundError: getaddrinfo ENOTFOUND mysql". Qual é a causa mais provável?',
                    options: [
                        'Senha do banco inválida',
                        'Host do banco não resolvido/rede entre containers inconsistente',
                        'Tabela episode sem coluna',
                        'Token JWT expirado'
                    ],
                    correctOptionIndex: 1,
                    weight: 1
                },
                {
                    id: 'dbg_q2',
                    prompt: 'Com MySQL healthy e backend caindo por ENOTFOUND mysql, qual ação é mais assertiva primeiro?',
                    options: [
                        'Executar npm audit fix',
                        'Trocar porta da API para 3001',
                        'Verificar rede/aliases do Docker e recriar containers se necessário',
                        'Resetar todo o banco'
                    ],
                    correctOptionIndex: 2,
                    weight: 1
                },
                {
                    id: 'dbg_q3',
                    prompt: 'Após corrigir rede, qual validação rápida confirma o cenário saudável?',
                    options: [
                        'Rodar seed de eventos limitados',
                        'Subir frontend sem backend',
                        'Conferir backend conectado ao DB e /health respondendo 200',
                        'Apenas limpar cache do navegador'
                    ],
                    correctOptionIndex: 2,
                    weight: 1
                }
            ]
        },
        max_attempts: 2,
        passing_score: 70,
        xp_reward: 70
    },
    {
        ordering: 115,
        title: 'Mock EP 15 - Code Review de Diff',
        summary: 'Atividade avaliativa para identificar riscos e melhorias em um diff de código.',
        year_target: 3,
        category: 'Code Review',
        duration_label: '7min',
        tags: ['mock', 'code-review', 'diff'],
        episode_type: 'assessment',
        assessment_mode: 'quiz',
        assessment_config: {
            questions: [
                {
                    id: 'cr_q1',
                    prompt: 'No diff, um endpoint expõe stack trace completo em produção. Qual o principal risco?',
                    options: [
                        'Apenas ruído visual no log',
                        'Vazamento de detalhes internos e aumento da superfície de ataque',
                        'Redução de performance no front',
                        'Incompatibilidade com SemVer'
                    ],
                    correctOptionIndex: 1,
                    weight: 1
                },
                {
                    id: 'cr_q2',
                    prompt: 'No diff, um campo booleano usa coerção genérica e "false" vira true. Melhor ajuste?',
                    options: [
                        'Manter coerção e documentar no README',
                        'Converter todos os booleans para string',
                        'Implementar parse explícito de boolean (true/false/1/0) antes de validar',
                        'Remover o campo do payload'
                    ],
                    correctOptionIndex: 2,
                    weight: 1
                },
                {
                    id: 'cr_q3',
                    prompt: 'No diff, foi adicionada nova feature sem teste de regressão. O que priorizar no review?',
                    options: [
                        'Apenas ajustes de nomenclatura',
                        'Solicitar teste cobrindo comportamento novo e caso de borda',
                        'Aumentar limite de timeout global',
                        'Subir direto em produção para validar'
                    ],
                    correctOptionIndex: 1,
                    weight: 1
                }
            ]
        },
        max_attempts: 2,
        passing_score: 70,
        xp_reward: 75
    },
    {
        ordering: 116,
        title: 'Mock EP 16 - Classificação de Mudanças',
        summary: 'Classifique mudanças de release em MAJOR, MINOR ou PATCH.',
        year_target: 2,
        category: 'Git e Versionamento',
        duration_label: '6min',
        tags: ['mock', 'classification', 'semver'],
        episode_type: 'assessment',
        assessment_mode: 'classification',
        assessment_config: {
            prompt: 'Classifique cada mudança no grupo correto.',
            groups: [
                { id: 'g_major', label: 'MAJOR' },
                { id: 'g_minor', label: 'MINOR' },
                { id: 'g_patch', label: 'PATCH' }
            ],
            items: [
                { id: 'i_1', label: 'Quebra de contrato da API pública', correctGroupId: 'g_major' },
                { id: 'i_2', label: 'Nova funcionalidade compatível', correctGroupId: 'g_minor' },
                { id: 'i_3', label: 'Correção de bug sem quebrar compatibilidade', correctGroupId: 'g_patch' }
            ]
        },
        max_attempts: 2,
        passing_score: 70,
        xp_reward: 70
    },
    {
        ordering: 117,
        title: 'Mock EP 17 - Complete as Lacunas (Git)',
        summary: 'Preencha lacunas com comandos e termos corretos do fluxo Git.',
        year_target: 2,
        category: 'Git e Versionamento',
        duration_label: '6min',
        tags: ['mock', 'fill-blanks', 'git'],
        episode_type: 'assessment',
        assessment_mode: 'fill_blanks',
        assessment_config: {
            prompt: 'Complete: Para enviar uma branch local para o remoto usamos {{b1}}. Para atualizar com mudanças do remoto usamos {{b2}}.',
            blanks: [
                { id: 'b1', answers: ['git push', 'push'], caseSensitive: false },
                { id: 'b2', answers: ['git pull', 'pull'], caseSensitive: false }
            ]
        },
        max_attempts: 2,
        passing_score: 70,
        xp_reward: 70
    },
    {
        ordering: 118,
        title: 'Mock EP 18 - Correspondência de Debug',
        summary: 'Relacione cada erro técnico com sua causa mais provável.',
        year_target: 3,
        category: 'Debugging',
        duration_label: '7min',
        tags: ['mock', 'matching', 'debug'],
        episode_type: 'assessment',
        assessment_mode: 'matching',
        assessment_config: {
            prompt: 'Associe cada erro à causa principal.',
            leftItems: [
                { id: 'l1', label: 'ENOTFOUND mysql' },
                { id: 'l2', label: '401 Unauthorized' },
                { id: 'l3', label: '404 Endpoint não encontrado' }
            ],
            rightItems: [
                { id: 'r1', label: 'Host/alias de banco não resolvido' },
                { id: 'r2', label: 'Credenciais inválidas ou token expirado' },
                { id: 'r3', label: 'Rota incorreta ou recurso inexistente' }
            ],
            pairs: [
                { leftId: 'l1', rightId: 'r1' },
                { leftId: 'l2', rightId: 'r2' },
                { leftId: 'l3', rightId: 'r3' }
            ]
        },
        max_attempts: 2,
        passing_score: 70,
        xp_reward: 75
    }
];

async function run() {
    await connectDatabase();

    let created = 0;
    let skipped = 0;

    for (const item of MOCK_EPISODES) {
        const slug = slugify(item.title, { lower: true, strict: true, locale: 'pt' });
        const [episode, isCreated] = await Episode.findOrCreate({
            where: { slug },
            defaults: {
                ...item,
                slug,
                is_published: true,
                episode_type: item.episode_type || 'study',
                assessment_mode: item.assessment_mode || null,
                assessment_config: item.assessment_config || null,
                max_attempts: item.max_attempts || 1,
                passing_score: item.passing_score || 60,
                xp_reward: item.xp_reward || 40
            }
        });

        if (!isCreated) {
            skipped += 1;
            // Mantém o episódio publicado e sincroniza campos importantes para facilitar testes.
            await episode.update({
                is_published: true,
                episode_type: item.episode_type || 'study',
                assessment_mode: item.assessment_mode || null,
                assessment_config: item.assessment_config || null,
                max_attempts: item.max_attempts || 1,
                passing_score: item.passing_score || 60,
                xp_reward: item.xp_reward || 40
            });
            continue;
        }

        created += 1;
    }

    console.log(`Seed de mocks concluído. Criados: ${created}, existentes: ${skipped}`);
    await sequelize.close();
}

run().catch(async (error) => {
    console.error('Falha ao inserir episódios mock:', error);
    try {
        await sequelize.close();
    } catch {}
    process.exit(1);
});
