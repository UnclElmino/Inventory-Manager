const { User } = require('../../models');
const { Op } = require('sequelize');

// GET /api/users/search?q=...
exports.search = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } }
        ]
      },
      attributes: ['id','name','email','avatar_url'],
      limit: 10
    });

    res.json(users);
  } catch (err) { next(err); }
};
