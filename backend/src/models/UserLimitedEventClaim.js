import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserLimitedEventClaim = sequelize.define('user_limited_event_claim', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    event_id: { type: DataTypes.INTEGER, allowNull: false },
    claimed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    indexes: [
        { unique: true, fields: ['user_id', 'event_id'] },
        { fields: ['user_id'] },
        { fields: ['event_id'] }
    ]
});

