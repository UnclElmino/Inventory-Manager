// server/src/middleware/inventoryAuth.js
const { Inventory, InventoryWriter } = require('../../models');

// helper to load inventory once
async function loadInventory(inventoryId) {
  return Inventory.findByPk(inventoryId);
}

// ✅ 1) only owner or admin can manage writers, change inventory meta, etc.
exports.requireOwnerOrAdmin = async (req, res, next) => {
  try {
    const inventoryId = Number(req.params.id);
    const userId = req.user?.id || req.body.user_id; // fallback for now

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const inv = await loadInventory(inventoryId);
    if (!inv) return res.status(404).json({ error: 'Inventory not found' });

    if (req.user?.is_admin || inv.created_by === userId) {
      req.inventory = inv;
      return next();
    }

    return res.status(403).json({ error: 'Not authorized' });
  } catch (err) {
    next(err);
  }
};

// ✅ 2) owner, admin, OR writer can edit inventory content (like items)
exports.requireWriteAccess = async (req, res, next) => {
  try {
    // some routes use :id, some use :inventoryId
    const inventoryId = Number(req.params.id || req.params.inventoryId);
    const userId = req.user?.id || req.body.user_id;

    if (!userId) return res.status(401).json({ error: 'Not authenticated' });

    const inv = await loadInventory(inventoryId);
    if (!inv) return res.status(404).json({ error: 'Inventory not found' });

    // owner / admin ok
    if (req.user?.is_admin || inv.created_by === userId) {
      req.inventory = inv;
      return next();
    }

    // check writers
    const writer = await InventoryWriter.findOne({
      where: { inventory_id: inventoryId, user_id: userId }
    });
    if (writer) {
      req.inventory = inv;
      return next();
    }

    return res.status(403).json({ error: 'Not allowed to edit this inventory' });
  } catch (err) {
    next(err);
  }
};
