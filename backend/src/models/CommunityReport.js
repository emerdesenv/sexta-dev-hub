import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CommunityReport = sequelize.define('community_report', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    reporter_user_id: { type: DataTypes.INTEGER, allowNull: false },
    target_type: {
        type: DataTypes.ENUM('topic', 'reply'),
        allowNull: false
    },
    target_id: { type: DataTypes.INTEGER, allowNull: false },
    reason: { type: DataTypes.STRING(255), allowNull: false },
    status: {
        type: DataTypes.ENUM('pending', 'reviewed', 'actioned', 'dismissed'),
        allowNull: false,
        defaultValue: 'pending'
    }
});
