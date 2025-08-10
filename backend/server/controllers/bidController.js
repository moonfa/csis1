const Bid = require('../models/Bid');
const Item = require('../models/Item');

exports.listByItem = async (req, res) => {
  try {
    const bids = await Bid.find({ itemId: req.params.itemId }).sort({ amount: -1, timestamp: 1 }).lean();
    res.json(bids);
  } catch {
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
};

exports.place = async (req, res) => {
  try {
    const { itemId, amount } = req.body;
    const userId = req.user?.id;
    if (!itemId || !Number.isFinite(Number(amount))) return res.status(400).json({ error: 'Invalid item or amount' });

    const item = await Item.findById(itemId);
    if (!item || item.isClosed) return res.status(400).json({ error: 'Item not found or auction closed' });

    const top = await Bid.findOne({ itemId }).sort({ amount: -1 }).lean();
    const minNext = top ? top.amount + 1 : 1;
    if (Number(amount) < minNext) return res.status(400).json({ error: `Bid must be at least $${minNext}` });

    const bid = await Bid.create({ itemId, userId, amount: Number(amount) });

    req.app.locals.broadcast?.('bid', { itemId, userId, amount: Number(amount) });
    res.status(201).json(bid);
  } catch {
    res.status(500).json({ error: 'Failed to place bid' });
  }
};
