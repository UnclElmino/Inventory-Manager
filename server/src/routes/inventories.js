const router = require('express').Router();
const c = require('../controllers/inventoriesController');

router.get('/', c.list);
router.get('/latest', c.latest);
router.get('/top5', c.top5);
router.post('/', c.create);

module.exports = router;
