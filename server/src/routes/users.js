const router = require('express').Router();
const c = require('../controllers/usersController');

router.get('/search', c.search);

module.exports = router;
