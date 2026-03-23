import dotenv from 'dotenv';
import { sequelize } from '../config/database.js';
import {
    GamificationEvent,
    User,
    UserEpisodeProgress,
    UserGamification,
    UserMissionClaim,
    UserRewardRedemption
} from '../models/index.js';

dotenv.config();

function parseArgs() {
    const args = process.argv.slice(2);
    const usernameArg = args.find((arg) => arg.startsWith('--username='));
    const allStudents = args.includes('--all-students');

    return {
        username: usernameArg ? usernameArg.split('=').slice(1).join('=').trim().toLowerCase() : '',
        allStudents
    };
}

function printUsage() {
    console.log('Uso:');
    console.log('  node src/scripts/resetStudentProgress.js --username=nome_do_aluno');
    console.log('  node src/scripts/resetStudentProgress.js --all-students');
}

async function resetUserProgress(userId, transaction) {
    await Promise.all([
        UserEpisodeProgress.destroy({ where: { user_id: userId }, transaction }),
        UserMissionClaim.destroy({ where: { user_id: userId }, transaction }),
        UserRewardRedemption.destroy({ where: { user_id: userId }, transaction }),
        GamificationEvent.destroy({ where: { user_id: userId }, transaction })
    ]);

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
    const { username, allStudents } = parseArgs();

    if (!username && !allStudents) {
        printUsage();
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

    await sequelize.transaction(async (transaction) => {
        for (const user of users) {
            await resetUserProgress(user.id, transaction);
        }
    });

    console.log(`Reset concluido para ${users.length} aluno(s): ${users.map((u) => u.username).join(', ')}`);
    await sequelize.close();
}

run().catch(async (error) => {
    console.error('Falha ao resetar progresso de aluno:', error);
    try {
        await sequelize.close();
    } catch {}
    process.exit(1);
});
