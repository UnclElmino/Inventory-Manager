const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const sequelize = require('./db');

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'https://inventory-manager-1-of6b.onrender.com',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => res.json({ ok: true }));

// TODO: import your routers later

module.exports = app;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err);
  }
})();