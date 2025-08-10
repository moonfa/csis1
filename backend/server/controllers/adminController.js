const Item = require('../models/Item');
const Bid = require('../models/Bid');

async function topBid(itemId) {
  return Bid.findOne({ itemId }).sort({ amount: -1, timestamp: 1 }).lean();
}

exports.closeAuction = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const activeCount = await Item.countDocuments({ isClosed: false });
    if (!item.isClosed && activeCount <= 5) {
      return res.status(400).json({ error: 'Cannot close: at least 5 items must remain open' });
    }

    if (!item.isClosed) {
      item.isClosed = true;
      await item.save();
      req.app.locals.broadcast?.('closed', { itemId: String(item._id) });
    }

    const top = await topBid(item._id);
    const winner = top ? { userId: top.userId, amount: top.amount } : null;

    res.json({ itemId: String(item._id), item, winner });
  } catch {
    res.status(500).json({ error: 'Error closing auction' });
  }
};

exports.getWinner = async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId).lean();
    if (!item) return res.status(404).json({ error: 'Item not found' });

    const top = await topBid(itemId);
    if (!top) return res.status(404).json({ error: 'No bids found' });

    res.json({ winner: top.userId, amount: top.amount });
  } catch {
    res.status(500).json({ error: 'Error fetching winner' });
  }
};
