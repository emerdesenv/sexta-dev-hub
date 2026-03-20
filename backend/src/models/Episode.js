import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Episode = sequelize.define('episode', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ordering: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    title: { type: DataTypes.STRING(160), allowNull: false },
    slug: { type: DataTypes.STRING(180), allowNull: false, unique: true },
    summary: { type: DataTypes.TEXT, allowNull: false },
    year_target: { type: DataTypes.INTEGER, allowNull: false },
    category: { type: DataTypes.STRING(80), allowNull: false },
    is_published: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    cover_path: { type: DataTypes.STRING(255) },
    audio_path: { type: DataTypes.STRING(255) },
    pdf_path: { type: DataTypes.STRING(255) },
    duration_label: { type: DataTypes.STRING(40) },
    tags: {
        type: DataTypes.TEXT,
        get() {
            const raw = this.getDataValue('tags');
            return raw ? raw.split(',').filter(Boolean) : [];
        },
        set(value) {
            this.setDataValue('tags', Array.isArray(value) ? value.join(',') : value || '');
        }
    }
});
