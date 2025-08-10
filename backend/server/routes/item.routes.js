// routes/item.routes.js
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');


router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, image } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    const newItem = await Item.create({ title: title.trim(), description, image });
    res.status(201).json(newItem);
  } catch {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (String(req.query.active || '').toLowerCase() === 'true') filter.isClosed = false;
    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});


module.exports = router;
