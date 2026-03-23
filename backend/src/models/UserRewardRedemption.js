import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const UserRewardRedemption = sequelize.define('user_reward_redemption', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    reward_key: { type: DataTypes.STRING(80), allowNull: false },
    cost_coins: { type: DataTypes.INTEGER, allowNull: false }
});
