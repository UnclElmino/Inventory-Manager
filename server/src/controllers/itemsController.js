const { Op } = require('sequelize');
const {
  Item,
  Inventory,
  Like,
  sequelize,
  ItemFieldValue,
  CustomField
} = require('../../models');


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
      include: [
        {
          model: ItemFieldValue,
          as: 'field_values',
          include: [
            {
              model: CustomField,
              as: 'field',
              attributes: ['id', 'name', 'type'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
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
    const { custom_id, created_by, quantity, field_values } = req.body;

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

    await upsertItemFieldValues(item.id, inventoryId, field_values, t);
    await t.commit();
    res.status(201).json(item);
  } catch (err) {
    await t.rollback();

    console.error('Create item failed:', err); // <-- add this

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res
        .status(409)
        .json({ error: 'custom_id must be unique within this inventory' });
    }
    return next(err);
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

// safer version of upsertItemFieldValues
async function upsertItemFieldValues(itemId, inventoryId, values = [], txn = null) {
  if (!Array.isArray(values) || !values.length) return;

  // only fields belonging to this inventory
  const fields = await CustomField.findAll({
    where: { inventory_id: inventoryId },
    transaction: txn,
  });
  const fieldMap = new Map(fields.map(f => [Number(f.id), f]));

  for (const v of values) {
    try {
      const fieldId = Number(v.field_id);
      const field = fieldMap.get(fieldId);
      if (!field) continue; // ignore fields from other inventories / bad ids

      const payload = {
        item_id: itemId,
        field_id: fieldId,
        value_text: null,
        value_number: null,
        value_bool: null,
        value_link: null,
      };

      const raw = v.value;

      switch (field.type) {
        case 'text':
        case 'multiline':
          payload.value_text = String(raw ?? '');
          break;
        case 'number':
          if (
            raw !== '' &&
            raw !== null &&
            raw !== undefined &&
            !isNaN(Number(raw))
          ) {
            payload.value_number = Number(raw);
          }
          break;
        case 'link':
          if (raw) payload.value_link = String(raw);
          break;
        case 'boolean':
          payload.value_bool = !!raw;
          break;
        default:
          // unknown type – just skip to avoid crashing
          break;
      }

      // upsert manually: find existing, otherwise create
      const [row, created] = await ItemFieldValue.findOrCreate({
        where: { item_id: itemId, field_id: fieldId },
        defaults: payload,
        transaction: txn,
      });

      if (!created) {
        Object.assign(row, payload);
        await row.save({ transaction: txn });
      }
    } catch (e) {
      console.error('Error in upsertItemFieldValues for item', itemId, e);
      throw e; // rethrow so the transaction rolls back cleanly
    }
  }
}



// GET /api/items/:id/fields
exports.getItemFields = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const rows = await ItemFieldValue.findAll({
      where: { item_id: id },
      include: [{ model: CustomField, attributes: ['id', 'name', 'key', 'type'] }]
    });
    res.json(rows);
  } catch (e) { next(e); }
};

// PATCH /api/items/:id/fields  body: { values:[{field_id, value}] }
exports.setItemFields = async (req, res, next) => {
  try {
    const itemId = Number(req.params.id);
    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    await upsertItemFieldValues(itemId, item.inventory_id, req.body.values || []);
    const refreshed = await ItemFieldValue.findAll({
      where: { item_id: itemId },
      include: [{ model: CustomField, attributes: ['id', 'name', 'key', 'type'] }]
    });
    res.json(refreshed);
  } catch (e) { next(e); }
};