import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const EpisodeAttempt = sequelize.define('episode_attempt', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    episode_id: { type: DataTypes.INTEGER, allowNull: false },
    attempt_number: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('in_progress', 'submitted', 'graded'), allowNull: false, defaultValue: 'in_progress' },
    answers: { type: DataTypes.JSON, allowNull: true },
    score: { type: DataTypes.FLOAT, allowNull: true },
    passed: { type: DataTypes.BOOLEAN, allowNull: true },
    started_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    submitted_at: { type: DataTypes.DATE, allowNull: true }
}, {
    indexes: [
        {
            fields: ['user_id', 'episode_id']
        }
    ]
});
