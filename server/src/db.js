require('dotenv').config();
const { Sequelize } = require('sequelize');

const ssl = String(process.env.DB_SSL || '').toLowerCase() === 'true';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: ssl
      ? { ssl: { require: true, rejectUnauthorized: false } }
      : {}
  }
);

module.exports = sequelize;
