import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const GamificationEvent = sequelize.define('gamification_event', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    event_type: { type: DataTypes.STRING(60), allowNull: false },
    mission_key: { type: DataTypes.STRING(80), allowNull: true },
    reward_key: { type: DataTypes.STRING(80), allowNull: true },
    reference_id: { type: DataTypes.STRING(120), allowNull: true },
    xp_delta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    coins_delta: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    metadata: { type: DataTypes.JSON, allowNull: true }
});
