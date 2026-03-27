import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CommunityVote = sequelize.define('community_vote', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    reply_id: { type: DataTypes.INTEGER, allowNull: false },
    vote_type: {
        type: DataTypes.ENUM('up'),
        allowNull: false,
        defaultValue: 'up'
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'reply_id']
        }
    ]
});
