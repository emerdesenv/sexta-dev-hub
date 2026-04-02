import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { sequelize } from '../config/database.js';
import {
    User,
    CommunityTopic,
    CommunityReply,
    CommunityVote,
    CommunityReport,
    CommunityModerationLog,
    GamificationEvent
} from '../models/index.js';

dotenv.config();

const { Op } = Sequelize;

function parseArgs() {
    const args = process.argv.slice(2);
    const usernameArg = args.find((arg) => arg.startsWith('--username='));
    const confirm = args.includes('--confirm');
    return {
        username: usernameArg ? usernameArg.split('=').slice(1).join('=').trim() : '',
        confirm
    };
}

async function run() {
    const { username, confirm } = parseArgs();
    if (!username) {
        console.error('Uso: node src/scripts/deleteTopicsByUsername.js --username=nome --confirm');
        process.exit(1);
    }
    if (!confirm) {
        console.error('Adicione --confirm para executar a exclusao.');
        process.exit(1);
    }

    await sequelize.authenticate();

    const user = await User.findOne({
        where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), username.toLowerCase()),
        attributes: ['id', 'username', 'role']
    });

    if (!user) {
        console.log('Usuario nao encontrado:', username);
        await sequelize.close();
        process.exit(1);
    }

    console.log('Usuario:', user.id, user.username, `(${user.role})`);

    const topics = await CommunityTopic.findAll({
        where: { author_user_id: user.id },
        attributes: ['id'],
        raw: true
    });
    const topicIds = topics.map((t) => Number(t.id)).filter((id) => Number.isInteger(id) && id > 0);
    console.log('Topicos encontrados:', topicIds.length);

    if (!topicIds.length) {
        await sequelize.close();
        return;
    }

    const replyRows = await CommunityReply.findAll({
        where: { topic_id: topicIds },
        attributes: ['id'],
        raw: true
    });
    const replyIds = replyRows.map((r) => Number(r.id)).filter((id) => Number.isInteger(id) && id > 0);

    await sequelize.transaction(async (transaction) => {
        if (replyIds.length) {
            await CommunityTopic.update(
                { best_reply_id: null },
                { where: { best_reply_id: replyIds }, transaction }
            );
        }
        await CommunityReport.destroy({
            where: {
                [Op.or]: [
                    { target_type: 'topic', target_id: { [Op.in]: topicIds } },
                    ...(replyIds.length ? [{ target_type: 'reply', target_id: { [Op.in]: replyIds } }] : [])
                ]
            },
            transaction
        });
        await CommunityModerationLog.destroy({
            where: {
                [Op.or]: [
                    { target_type: 'topic', target_id: { [Op.in]: topicIds } },
                    ...(replyIds.length ? [{ target_type: 'reply', target_id: { [Op.in]: replyIds } }] : [])
                ]
            },
            transaction
        });
        if (replyIds.length) {
            await CommunityVote.destroy({ where: { reply_id: replyIds }, transaction });
        }
        await CommunityReply.destroy({ where: { topic_id: topicIds }, transaction });
        await CommunityTopic.destroy({ where: { id: topicIds }, transaction });
        const refStrings = topicIds.map(String);
        await GamificationEvent.destroy({
            where: {
                user_id: user.id,
                event_type: 'community_topic_created',
                reference_id: { [Op.in]: refStrings }
            },
            transaction
        });
    });

    console.log('Removidos', topicIds.length, 'topico(s), respostas, votos, denuncias e logs de moderacao vinculados.');
    await sequelize.close();
}

run().catch(async (err) => {
    console.error(err);
    try {
        await sequelize.close();
    } catch {
        /* ignore */
    }
    process.exit(1);
});
