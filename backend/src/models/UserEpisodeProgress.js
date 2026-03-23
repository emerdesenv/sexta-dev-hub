import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserEpisodeProgress = sequelize.define('user_episode_progress', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    episode_id: { type: DataTypes.INTEGER, allowNull: false },
    completed_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'episode_id']
        }
    ]
});
