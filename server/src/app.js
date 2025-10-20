const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

const cors = require('cors');
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://inventory-manager-1-of6b.onrender.com',
  credentials: true
}));

app.get('/api/health', (req, res) => res.json({ ok: true }));

module.exports = app;
