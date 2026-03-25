import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

export const User = sequelize.define('user', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'professor' },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    failed_login_attempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    locked_until: { type: DataTypes.DATE, allowNull: true }
});

User.prototype.checkPassword = function(password) {
    return bcrypt.compare(password, this.password_hash);
};
