const { Inventory, User, Tag, InventoryTag, Item, sequelize } = require('../../models');
const { Op, fn, col, literal } = require('sequelize');

//  GET /api/inventories
exports.list = async (req, res, next) => {
  try {
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

    const inventories = await Inventory.findAll({
      where,
      include,
      order: [['createdAt','DESC']],
      limit: 20
    });

    res.json(inventories);
  } catch (err) {
    next(err);
  }
};

// ✅ GET /api/inventories/latest
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

// ✅ GET /api/inventories/top5
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

// ✅ POST /api/inventories
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
