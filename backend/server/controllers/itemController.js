const Item = require('../models/Item');

exports.createItem = async (req, res) => {
  try {
    const { title, description, image } = req.body;
    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });

    const total = await Item.countDocuments();
    if (total >= 30) return res.status(400).json({ error: 'Item limit reached (30)' });

    const item = await Item.create({ title: title.trim(), description, image });
    res.status(201).json(item);
  } catch {
    res.status(500).json({ error: 'Failed to create item' });
  }
};

exports.listItems = async (req, res) => {
  try {
    const filter = {};
    if (String(req.query.active || '').toLowerCase() === 'true') filter.isClosed = false;
    const q = (req.query.q || '').trim();
    if (q) filter.title = { $regex: q, $options: 'i' };

    const items = await Item.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

exports.getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};
