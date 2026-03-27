import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserSession = sequelize.define('user_session', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    token_hash: { type: DataTypes.STRING(128), allowNull: false, unique: true },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    revoked_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    last_used_at: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
    ip_address: { type: DataTypes.STRING(120), allowNull: true, defaultValue: null },
    user_agent: { type: DataTypes.STRING(255), allowNull: true, defaultValue: null }
});
