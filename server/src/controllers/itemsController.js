const { Sequelize } = require('sequelize');
const {
  Item,
  Inventory,
  Like,
  User,
  sequelize
} = require('../../models');

const { Op } = Sequelize;

// GET /api/inventories/:inventoryId/items?search=&page=&pageSize=
exports.listByInventory = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.inventoryId);
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100);
    const search = (req.query.search || '').trim();

    const where = { inventory_id: inventoryId };
    if (search) where.custom_id = { [Op.like]: `%${search}%` };

    const { rows, count } = await Item.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize
    });

    res.json({ data: rows, page, pageSize, total: count });
  } catch (err) { next(err); }
};

// GET /api/items/:id
exports.getOne = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await Item.findByPk(id, {
      include: [
        { model: Inventory, attributes: ['id', 'title'] }
      ]
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // ETag with numeric version
    res.set('ETag', String(item.version));
    res.json(item);
  } catch (err) { next(err); }
};

// POST /api/inventories/:inventoryId/items
// Body: { custom_id, created_by }
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const inventoryId = Number(req.params.inventoryId);
    const { custom_id, created_by, quantity } = req.body;

    if (!custom_id || !created_by) {
      return res.status(400).json({ error: 'custom_id and created_by are required' });
    }

    // ensure inventory exists
    const inv = await Inventory.findByPk(inventoryId, { transaction: t });
    if (!inv) {
      await t.rollback();
      return res.status(404).json({ error: 'Inventory not found' });
    }

    // create item (version=1)
    const item = await Item.create({
      inventory_id: inventoryId,
      custom_id,
      version: 1,
      created_by,
      quantity: quantity ? Number(quantity) : 1
    }, { transaction: t });

    await t.commit();
    res.status(201).json(item);
  } catch (err) {
    await t.rollback();
    // Handle composite unique (inventory_id, custom_id)
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'custom_id must be unique within this inventory' });
    }
    next(err);
  }
};

// PATCH /api/items/:id
// Headers: If-Match: <version>
// Body: { custom_id?, ...future fields }
exports.update = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const id = Number(req.params.id);
    const incomingVersionHdr = req.get('If-Match');
    const incomingVersionBody = req.body.version; // fallback
    const incomingVersion = incomingVersionHdr ?? incomingVersionBody;

    if (incomingVersion === undefined) {
      await t.rollback();
      return res.status(428).json({ error: 'Missing version. Provide If-Match header or body.version' });
    }

    const item = await Item.findByPk(id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!item) {
      await t.rollback();
      return res.status(404).json({ error: 'Item not found' });
    }

    // optimistic lock check
    if (String(item.version) !== String(incomingVersion)) {
      await t.rollback();
      return res.status(409).json({
        error: 'Version conflict',
        currentVersion: item.version
      });
    }

    // Allow custom_id change (still must be unique within inventory)
    if (req.body.custom_id !== undefined) {
      item.custom_id = req.body.custom_id;
    }

    // bump version
    item.version = item.version + 1;
    await item.save({ transaction: t });

    await t.commit();
    res.set('ETag', String(item.version));
    res.json(item);
  } catch (err) {
    await t.rollback();
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'custom_id must be unique within this inventory' });
    }
    next(err);
  }
};

// DELETE /api/items/:id
exports.destroy = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const count = await Item.destroy({ where: { id } });
    if (!count) return res.status(404).json({ error: 'Item not found' });
    res.status(204).end();
  } catch (err) { next(err); }
};

// POST /api/items/:id/like  (body: { user_id })
exports.like = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // ensure item exists
    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    // unique (item_id, user_id) enforced by DB; catch duplicates
    try {
      await Like.create({ item_id: id, user_id });
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        return res.status(200).json({ ok: true, alreadyLiked: true });
      }
      throw e;
    }

    res.status(201).json({ ok: true });
  } catch (err) { next(err); }
};

// DELETE /api/items/:id/like  (body: { user_id })
exports.unlike = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    await Like.destroy({ where: { item_id: id, user_id } });
    res.status(204).end();
  } catch (err) { next(err); }
};

// PATCH /api/items/:id/quantity
// body: { remove: number }
exports.removeQuantity = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const remove = Number(req.body.remove || 0);
    if (!remove || remove < 1) {
      return res.status(400).json({ error: 'remove must be >= 1' });
    }

    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const newQty = item.quantity - remove;

    if (newQty > 0) {
      item.quantity = newQty;
      // bump version, to stay consistent
      item.version = (item.version || 1) + 1;
      await item.save();
      return res.json(item);
    } else {
      // if 0 or below → delete item
      await Item.destroy({ where: { id } });
      return res.status(204).end();
    }
  } catch (err) {
    next(err);
  }
};


exports.increaseQuantity = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const amount = Number(req.body.amount || 1);
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'amount must be >= 1' });
    }

    const item = await Item.findByPk(id);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    item.quantity = (item.quantity || 0) + amount;
    item.version = (item.version || 1) + 1;
    await item.save();

    return res.json(item);
  } catch (err) {
    next(err);
  }
};
