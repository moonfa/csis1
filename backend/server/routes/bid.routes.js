// routes/bid.routes.js
const express = require('express');
const router = express.Router();
const Bid  = require('../models/Bid');
const Item = require('../models/Item');
const auth = require('../middleware/auth');


router.get('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const bids = await Bid.find({ itemId }).sort({ amount: -1, timestamp: 1 }).lean();
    res.json(bids);
  } catch {
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { itemId, amount } = req.body;
    const userId = req.user?.id;

    if (!itemId || !Number.isFinite(Number(amount))) {
      return res.status(400).json({ error: 'Invalid item or amount' });
    }

    const item = await Item.findById(itemId);
    if (!item || item.isClosed) {
      return res.status(400).json({ error: 'Item not found or auction closed' });
    }

    const top = await Bid.findOne({ itemId }).sort({ amount: -1 }).lean();
    if (top && Number(amount) <= top.amount) {
      return res.status(400).json({ error: 'Bid must be higher than current top bid' });
    }

    const bid = await Bid.create({ itemId, userId, amount: Number(amount) });
    res.status(201).json(bid);
  } catch {
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

module.exports = router;
