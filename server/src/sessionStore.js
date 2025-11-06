const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const db = require('../models'); // this is the Sequelize instance (db.sequelize)

const store = new SequelizeStore({
  db: db.sequelize,
  tableName: 'Sessions'
});

module.exports = store;
