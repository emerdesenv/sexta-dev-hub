import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import {
    CommunityReply,
    CommunityReport,
    CommunityTopic,
    CommunityVote,
    EpisodeAttempt,
    GamificationEvent,
    User,
    UserCollectible,
    UserEpisodeAttemptCredit,
    UserEpisodeProgress,
    UserGamification,
    UserLimitedEventClaim,
    UserMissionClaim,
    UserRewardRedemption,
    UserSession
} from '../models/index.js';

dotenv.config();

function parseArgs() {
    const args = process.argv.slice(2);
    const usernameArg = args.find((arg) => arg.startsWith('--username='));
    const allStudents = args.includes('--all-students');
    const withCommunity = args.includes('--with-community');
    const confirm = args.includes('--confirm');

    return {
        username: usernameArg ? usernameArg.split('=').slice(1).join('=').trim().toLowerCase() : '',
        allStudents,
        withCommunity,
        confirm
    };
}

function printUsage() {
    console.log('Reseta progresso, tentativas, eventos de gamificação e (opcional) participação na comunidade.');
    console.log('');
    console.log('Uso:');
    console.log('  node src/scripts/resetStudentProgress.js --username=nome_do_aluno');
    console.log('  node src/scripts/resetStudentProgress.js --all-students --confirm');
    console.log('');
    console.log('Opções:');
    console.log('  --with-community   Remove também votos, respostas, tópicos e denúncias feitas pelo aluno.');
    console.log('  --confirm          Obrigatório junto de --all-students (evita reset acidental).');
}

async function clearStudentCommunity(userId, transaction) {
    await CommunityVote.destroy({ where: { user_id: userId }, transaction });

    const studentReplies = await CommunityReply.findAll({
        where: { author_user_id: userId },
        attributes: ['id'],
        transaction
    });
    const replyIds = studentReplies.map((r) => r.id);
    if (replyIds.length) {
        await CommunityTopic.update(
            { best_reply_id: null },
            { where: { best_reply_id: replyIds }, transaction }
        );
        await CommunityReply.destroy({ where: { id: replyIds }, transaction });
    }

    await CommunityTopic.destroy({ where: { author_user_id: userId }, transaction });
    await CommunityReport.destroy({ where: { reporter_user_id: userId }, transaction });
}

async function resetUserProgress(userId, transaction, { withCommunity }) {
    await Promise.all([
        EpisodeAttempt.destroy({ where: { user_id: userId }, transaction }),
        UserEpisodeAttemptCredit.destroy({ where: { user_id: userId }, transaction }),
        UserEpisodeProgress.destroy({ where: { user_id: userId }, transaction }),
        UserMissionClaim.destroy({ where: { user_id: userId }, transaction }),
        UserRewardRedemption.destroy({ where: { user_id: userId }, transaction }),
        UserCollectible.destroy({ where: { user_id: userId }, transaction }),
        UserLimitedEventClaim.destroy({ where: { user_id: userId }, transaction }),
        GamificationEvent.destroy({ where: { user_id: userId }, transaction }),
        UserSession.destroy({ where: { user_id: userId }, transaction })
    ]);

    if (withCommunity) {
        await clearStudentCommunity(userId, transaction);
    }

    const [profile] = await UserGamification.findOrCreate({
        where: { user_id: userId },
        defaults: { user_id: userId },
        transaction
    });

    await profile.update(
        {
            xp_total: 0,
            level: 1,
            coins: 0,
            streak_days: 0,
            last_activity_date: null,
            active_theme: 'default',
            profile_pro_enabled: false,
            streak_shield_count: 0,
            early_access_enabled: false
        },
        { transaction }
    );
}

async function run() {
    const { username, allStudents, withCommunity, confirm } = parseArgs();

    if (!username && !allStudents) {
        printUsage();
        process.exit(1);
    }

    if (allStudents && !confirm) {
        console.error('Para resetar todos os alunos, execute novamente com --confirm.');
        process.exit(1);
    }

    await sequelize.authenticate();

    const users = allStudents
        ? await User.findAll({ where: { role: 'student' }, attributes: ['id', 'username'] })
        : await User.findAll({ where: { username, role: 'student' }, attributes: ['id', 'username'] });

    if (!users.length) {
        console.log('Nenhum aluno encontrado para reset.');
        await sequelize.close();
        return;
    }

    if (withCommunity) {
        console.log('Modo --with-community: removendo tópicos, respostas, votos e denúncias dos alunos listados.');
    }

    await sequelize.transaction(async (transaction) => {
        for (const user of users) {
            await resetUserProgress(user.id, transaction, { withCommunity });
        }
    });

    console.log(
        `Reset concluído para ${users.length} aluno(s): ${users.map((u) => u.username).join(', ')}`
    );
    await sequelize.close();
}

run().catch(async (error) => {
    console.error('Falha ao resetar progresso de aluno:', error);
    try {
        await sequelize.close();
    } catch {
        /* ignore */
    }
    process.exit(1);
});
