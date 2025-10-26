// server/config/config.js
require('dotenv').config();

const sslOn = String(process.env.DB_SSL || '').toLowerCase() === 'true';
const host  = process.env.DB_HOST;                // e.g. interchange.proxy.rlwy.net
const port  = Number(process.env.DB_PORT || 3306);// e.g. 49882
const user  = process.env.DB_USER;
const pass  = process.env.DB_PASS;
const name  = process.env.DB_NAME;

const base = {
  username: user,
  password: pass,
  database: name,
  host,
  port,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    // Railway TCP proxy usually expects SSL
    ssl: sslOn ? { require: true, rejectUnauthorized: false } : undefined,
    connectTimeout: 20000
  },
  pool: { max: 10, min: 0, idle: 10000, acquire: 30000 }
};

module.exports = {
  development: base,
  test: base,
  production: base
};
