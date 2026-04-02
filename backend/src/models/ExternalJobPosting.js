import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ExternalJobPosting = sequelize.define('external_job_posting', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    source: { type: DataTypes.STRING(80), allowNull: false },
    external_id: { type: DataTypes.STRING(190), allowNull: false },
    title: { type: DataTypes.STRING(220), allowNull: false },
    company_name: { type: DataTypes.STRING(160), allowNull: true },
    location: { type: DataTypes.STRING(160), allowNull: true },
    work_model: {
        type: DataTypes.ENUM('remote', 'hybrid', 'onsite', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
    },
    seniority: {
        type: DataTypes.ENUM('intern', 'junior', 'mid', 'senior', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
    },
    contract_type: {
        type: DataTypes.ENUM('clt', 'pj', 'internship', 'freelance', 'other', 'unknown'),
        allowNull: false,
        defaultValue: 'unknown'
    },
    stacks: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    target_audience: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    description: { type: DataTypes.TEXT, allowNull: true },
    apply_url: { type: DataTypes.STRING(2048), allowNull: false },
    source_url: { type: DataTypes.STRING(2048), allowNull: true },
    published_at: { type: DataTypes.DATE, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    last_seen_at: { type: DataTypes.DATE, allowNull: false },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    raw_payload: { type: DataTypes.JSON, allowNull: true }
}, {
    indexes: [
        { unique: true, fields: ['source', 'external_id'] },
        { fields: ['is_active', 'published_at'] },
        { fields: ['seniority'] },
        { fields: ['work_model'] }
    ]
});
