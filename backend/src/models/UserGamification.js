import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserGamification = sequelize.define('user_gamification', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    xp_total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    coins: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    streak_days: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    last_activity_date: { type: DataTypes.DATEONLY, allowNull: true },
    active_theme: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'default' },
    profile_pro_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    streak_shield_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    early_access_enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});
