import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CommunityModerationLog = sequelize.define('community_moderation_log', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    moderator_user_id: { type: DataTypes.INTEGER, allowNull: false },
    target_type: {
        type: DataTypes.ENUM('topic', 'reply'),
        allowNull: false
    },
    target_id: { type: DataTypes.INTEGER, allowNull: false },
    action: { type: DataTypes.STRING(60), allowNull: false },
    reason: { type: DataTypes.STRING(255), allowNull: true }
});
