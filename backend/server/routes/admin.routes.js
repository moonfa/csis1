const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Bid  = require('../models/Bid');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');


async function topBid(itemId) {
  return Bid.findOne({ itemId }).sort({ amount: -1, timestamp: 1 }).lean();
}

router.patch('/close/:itemId', auth, isAdmin, async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (!item.isClosed) {
      item.isClosed = true;
      await item.save();
    }

    const top = await topBid(item._id);
    const winner = top ? { userId: top.userId, amount: top.amount } : null;

    res.json({ itemId: String(item._id), item, winner });
  } catch {
    res.status(500).json({ error: 'Error closing auction' });
  }
});

router.get('/winner/:itemId', auth, isAdmin, async (req, res) => {
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
});

router.post('/notify/:itemId', auth, isAdmin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId).lean();
    if (!item || !item.isClosed) return res.status(400).json({ error: 'Item not found or not closed' });
    const top = await Bid.findOne({ itemId: item._id }).sort({ amount: -1, timestamp: 1 }).lean();
    if (!top) return res.status(404).json({ error: 'No winner' });
    console.log(`[EMAIL] To ${top.userId}: You won "${item.title}" for $${top.amount}`);
    res.json({ sent: true });
  } catch {
    res.status(500).json({ error: 'Failed to notify winner' });
  }
});

module.exports = router;
