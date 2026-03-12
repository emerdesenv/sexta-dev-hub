import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || 'sextadev',
  process.env.DB_USER || 'sextadev',
  process.env.DB_PASSWORD || 'sextadev123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    define: {
      underscored: true,
      freezeTableName: true,
      timestamps: true,
    },
  }
);

export async function connectDatabase() {
  await sequelize.authenticate();
  await sequelize.sync();
}
