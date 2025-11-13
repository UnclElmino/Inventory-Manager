const router = require('express').Router();
const c = require('../controllers/itemsController');
const { requireWriteAccess } = require('../middlewares/inventoryAuth');


// inventory-scoped
router.get('/inventory/:inventoryId', c.listByInventory);
router.post('/inventory/:inventoryId', requireWriteAccess, c.create);

// item-scoped
router.get('/:id', c.getOne);
router.patch('/:id', c.update);
router.delete('/:id', c.destroy);

// likes
router.post('/:id/like', c.like);
router.delete('/:id/like', c.unlike);

router.patch('/:id/quantity', c.removeQuantity);
router.patch('/:id/increase', c.increaseQuantity);

// set/get item field values
router.get('/:id/fields', c.getItemFields);
router.patch('/:id/fields', requireWriteAccess, c.setItemFields);


module.exports = router;
