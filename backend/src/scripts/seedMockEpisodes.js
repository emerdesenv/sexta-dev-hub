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
