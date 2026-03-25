import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserEpisodeAttemptCredit = sequelize.define('user_episode_attempt_credit', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    episode_id: { type: DataTypes.INTEGER, allowNull: false },
    extra_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'episode_id']
        }
    ]
});
