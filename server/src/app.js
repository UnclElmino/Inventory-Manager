const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const passport = require('../config/passport.js');
const sessionStore = require('./sessionStore');

const app = express();

const usersRouter = require('./routes/users');



// CORS
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use('/api/users', usersRouter);
app.use(express.json());
app.use(cookieParser());

// Sessions (must come before passport)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  proxy: true, // trust reverse proxies (Render)
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false // set to true in production if using https
  },
  store: sessionStore
}));
sessionStore.sync(); // ensure Sessions table exists

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Auth routes
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// (your existing routers)
const inventoriesRouter = require('./routes/inventories');
app.use('/api/inventories', inventoriesRouter);

const itemsRouter = require('./routes/items');
app.use('/api/items', itemsRouter);

// Error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', detail: err.message });
});

module.exports = app;
