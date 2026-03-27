import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CommunityReply = sequelize.define('community_reply', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    topic_id: { type: DataTypes.INTEGER, allowNull: false },
    author_user_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    is_official: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    is_hidden: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
});
