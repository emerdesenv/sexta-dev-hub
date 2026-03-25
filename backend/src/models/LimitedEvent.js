import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const LimitedEvent = sequelize.define('limited_event', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(160), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true },
    start_at: { type: DataTypes.DATE, allowNull: false },
    end_at: { type: DataTypes.DATE, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    episode_id: { type: DataTypes.INTEGER, allowNull: true },
    reward_item_id: { type: DataTypes.INTEGER, allowNull: false }
});

