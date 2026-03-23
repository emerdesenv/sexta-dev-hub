import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserMissionClaim = sequelize.define('user_mission_claim', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    mission_key: { type: DataTypes.STRING(80), allowNull: false },
    period_key: { type: DataTypes.STRING(30), allowNull: false }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'mission_key', 'period_key']
        }
    ]
});
