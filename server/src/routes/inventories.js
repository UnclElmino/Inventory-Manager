const router = require('express').Router();
const c = require('../controllers/inventoriesController');
const { requireOwnerOrAdmin } = require('../middlewares/inventoryAuth');


router.get('/', c.list);
router.get('/latest', c.latest);
router.get('/top5', c.top5);
router.post('/', c.create);

// existing single-inventory routes
router.get('/:id', c.getOne);
router.patch('/:id', requireOwnerOrAdmin, c.update);

// discussion routes
router.get('/:id/posts', c.listPosts);
router.post('/:id/posts', c.createPost);

router.get('/:id/stats', c.stats);
router.get('/:id/writers', requireOwnerOrAdmin, c.getWriters);
router.post('/:id/writers', requireOwnerOrAdmin, c.addWriter);
router.delete('/:id/writers/:userId', requireOwnerOrAdmin, c.removeWriter);

// fields CRUD
router.get('/:id/fields', c.listFields);
router.post('/:id/fields', requireOwnerOrAdmin, c.createField);
router.patch('/:id/fields/:fieldId', requireOwnerOrAdmin, c.updateField);
router.delete('/:id/fields/:fieldId', requireOwnerOrAdmin, c.deleteField);


module.exports = router;
