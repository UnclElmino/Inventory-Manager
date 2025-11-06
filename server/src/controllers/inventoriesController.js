const { Inventory, User, Tag, InventoryTag, Item, Like, sequelize, DiscussionPost, InventoryWriter } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

// GET /api/inventories
exports.list = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '10', 10), 1), 50);
    const q = (req.query.q || '').trim();
    const tag = (req.query.tag || '').trim();

    const where = {};
    if (q) {
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { description_md: { [Op.like]: `%${q}%` } }
      ];
    }

    const include = [
      { model: User, as: 'owner', attributes: ['id','name','email'] },
      { model: Tag, attributes: ['id','name'], through: { attributes: [] } }
    ];
    if (tag) include[1].where = { name: tag };

    const { rows, count } = await Inventory.findAndCountAll({
      where,
      include,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
      distinct: true // ensures count isn’t inflated by JOINs
    });

    res.json({ data: rows, page, pageSize, total: count });
  } catch (err) { next(err); }
};

// GET /api/inventories/latest
exports.latest = async (req, res, next) => {
  try {
    const rows = await Inventory.findAll({
      include: [{ model: User, as: 'owner', attributes: ['id','name'] }],
      order: [['createdAt','DESC']],
      limit: 10
    });
    res.json(rows);
  } catch (err) { next(err); }
};

// GET /api/inventories/top5
exports.top5 = async (req, res, next) => {
  try {
    const rows = await Inventory.findAll({
      attributes: [
        'id','title',
        [fn('COUNT', col('Items->Likes.id')), 'likeCount']
      ],
      include: [{
        model: Item,
        attributes: [],
        include: [{ association: Item.associations.Likes, attributes: [] }]
      }],
      group: ['Inventory.id'],
      order: [[literal('likeCount'), 'DESC']],
      limit: 5,
      subQuery: false
    });
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/inventories
exports.create = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { owner_id, title, description_md, category, image_url, is_public, tags = [] } = req.body;
    if (!owner_id || !title) return res.status(400).json({ error: 'owner_id and title are required' });

    const inv = await Inventory.create({
      owner_id, title, description_md, category, image_url, is_public: !!is_public, version: 1
    }, { transaction: t });

    // Optional tag linking
    if (tags.length) {
      const tagObjs = [];
      for (const name of tags) {
        const [tag] = await Tag.findOrCreate({ where: { name }, defaults: { name }, transaction: t });
        tagObjs.push(tag);
      }
      const linkRows = tagObjs.map(tag => ({ inventory_id: inv.id, tag_id: tag.id }));
      await InventoryTag.bulkCreate(linkRows, { transaction: t, ignoreDuplicates: true });
    }

    await t.commit();
    const created = await Inventory.findByPk(inv.id, {
      include: [{ model: User, as: 'owner', attributes: ['id','name'] }, { model: Tag, through: { attributes: [] } }]
    });
    res.status(201).json(created);
  } catch (err) {
    await t.rollback();
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const inv = await Inventory.findByPk(req.params.id, {
      include: [{ model: User, as: 'owner', attributes: ['id','name'] }, { model: Tag, through: { attributes: [] } }]
    });
    if (!inv) return res.status(404).json({ error: 'Not found' });
    res.set('ETag', String(inv.version || 1));
    res.json(inv);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const id = req.params.id;
    const ifMatch = req.get('If-Match');
    const inv = await Inventory.findByPk(id);
    if (!inv) return res.status(404).json({ error: 'Not found' });

    // optimistic lock
    if (ifMatch && String(inv.version) !== String(ifMatch)) {
      return res.status(409).json({ error: 'Version conflict', currentVersion: inv.version });
    }

    inv.title = req.body.title ?? inv.title;
    inv.category = req.body.category ?? inv.category;
    inv.description_md = req.body.description_md ?? inv.description_md;
    inv.is_public = typeof req.body.is_public === 'boolean' ? req.body.is_public : inv.is_public;
    inv.version = (inv.version || 1) + 1;
    await inv.save();

    res.set('ETag', String(inv.version));
    res.json(inv);
  } catch (err) { next(err); }
};

// GET /api/inventories/:id/posts
exports.listPosts = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.id);
    const posts = await DiscussionPost.findAll({
      where: { inventory_id: inventoryId },
      include: [{ model: User, attributes: ['id','name','email','avatar_url'] }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

// POST /api/inventories/:id/posts
exports.createPost = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.id);
    // until auth is fully wired, accept user_id in body
    const userId = req.user ? req.user.id : req.body.user_id;
    const body_md = (req.body.body_md || '').trim();

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });
    if (!body_md) return res.status(400).json({ error: 'Message is required' });

    const post = await DiscussionPost.create({
      inventory_id: inventoryId,
      user_id: userId,
      body_md
    });

    const full = await DiscussionPost.findByPk(post.id, {
      include: [{ model: User, attributes: ['id','name','email','avatar_url'] }]
    });

    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
};

// GET /api/inventories/:id/stats
exports.stats = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.id);

    // 1) basic counts
    const items = await Item.findAll({
      where: { inventory_id: inventoryId },
      attributes: ['id', 'custom_id', 'quantity']
    });

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, it) => sum + (it.quantity || 0), 0);

    // 2) likes per item (for this inventory)
    // grab all item ids in this inventory
    const itemIds = items.map(it => it.id);
    let totalLikes = 0;
    let topItems = [];

    if (itemIds.length) {
      // count likes grouped by item_id
      const likeRows = await Like.findAll({
        where: { item_id: itemIds },
        attributes: [
          'item_id',
          [sequelize.fn('COUNT', sequelize.col('item_id')), 'likeCount']
        ],
        group: ['item_id']
      });

      // turn into map
      const likeMap = {};
      likeRows.forEach(r => {
        const itemId = r.item_id;
        const count = Number(r.get('likeCount'));
        likeMap[itemId] = count;
        totalLikes += count;
      });

      // build top list by merging items + likeMap
      topItems = items
        .map(it => ({
          id: it.id,
          custom_id: it.custom_id,
          likeCount: likeMap[it.id] || 0
        }))
        .sort((a, b) => b.likeCount - a.likeCount)
        .slice(0, 5);
    }

    res.json({
      totalItems,
      totalQuantity,
      totalLikes,
      topItems
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/inventories/:id/writers
exports.getWriters = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.id);
    const inv = await Inventory.findByPk(inventoryId, {
      include: [{
        model: User,
        as: 'writers',
        attributes: ['id', 'name', 'email', 'avatar_url'],
        through: { attributes: [] }
      }]
    });
    if (!inv) return res.status(404).json({ error: 'Inventory not found' });
    res.json(inv.writers);
  } catch (err) { next(err); }
};

// POST /api/inventories/:id/writers  body: { user_id }
exports.addWriter = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.id);
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id required' });

    // ensure inventory exists
    const inv = await Inventory.findByPk(inventoryId);
    if (!inv) return res.status(404).json({ error: 'Inventory not found' });

    await InventoryWriter.findOrCreate({
      where: { inventory_id: inventoryId, user_id }
    });

    // return updated list
    const writers = await User.findAll({
      include: [{
        model: Inventory,
        as: 'writableInventories',
        where: { id: inventoryId },
        attributes: [],
        through: { attributes: [] }
      }],
      attributes: ['id','name','email','avatar_url']
    });

    res.status(201).json(writers);
  } catch (err) { next(err); }
};

// DELETE /api/inventories/:id/writers/:userId
exports.removeWriter = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.id);
    const userId = Number(req.params.userId);
    await InventoryWriter.destroy({
      where: { inventory_id: inventoryId, user_id: userId }
    });
    res.status(204).end();
  } catch (err) { next(err); }
};