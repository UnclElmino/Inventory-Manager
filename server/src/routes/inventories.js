const router = require('express').Router();
const c = require('../controllers/inventoriesController');

router.get('/', c.list);
router.get('/latest', c.latest);
router.get('/top5', c.top5);
router.post('/', c.create);

// existing single-inventory routes
router.get('/:id', c.getOne);
router.patch('/:id', c.update);

// discussion routes
router.get('/:id/posts', c.listPosts);
router.post('/:id/posts', c.createPost);

router.get('/:id/stats', c.stats);
router.get('/:id/writers', c.getWriters);
router.post('/:id/writers', c.addWriter);
router.delete('/:id/writers/:userId', c.removeWriter);


module.exports = router;
