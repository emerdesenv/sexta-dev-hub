import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const CollectibleItem = sequelize.define('collectible_item', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(120), allowNull: false },
    type: { type: DataTypes.ENUM('badge', 'avatar_item'), allowNull: false, defaultValue: 'badge' },
    rarity: { type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'), allowNull: false, defaultValue: 'rare' },
    icon: { type: DataTypes.STRING(255), allowNull: true }
});

