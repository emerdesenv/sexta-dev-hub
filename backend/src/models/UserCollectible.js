import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserCollectible = sequelize.define('user_collectible', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    item_id: { type: DataTypes.INTEGER, allowNull: false },
    source_event_id: { type: DataTypes.INTEGER, allowNull: true },
    acquired_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    indexes: [
        { unique: true, fields: ['user_id', 'item_id', 'source_event_id'] },
        { fields: ['user_id'] },
        { fields: ['item_id'] }
    ]
});

