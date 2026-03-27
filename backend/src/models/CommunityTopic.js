import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CommunityTopic = sequelize.define('community_topic', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    author_user_id: { type: DataTypes.INTEGER, allowNull: false },
    phase: { type: DataTypes.TINYINT, allowNull: true },
    class_group: { type: DataTypes.STRING(20), allowNull: true },
    category: {
        type: DataTypes.ENUM('duvida', 'solucao', 'discussao', 'showcase'),
        allowNull: false,
        defaultValue: 'duvida'
    },
    title: { type: DataTypes.STRING(180), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    status: {
        type: DataTypes.ENUM('open', 'resolved', 'archived', 'hidden'),
        allowNull: false,
        defaultValue: 'open'
    },
    is_anonymous: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    best_reply_id: { type: DataTypes.INTEGER, allowNull: true }
});
