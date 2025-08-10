const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const clean = (email || '').toLowerCase().trim();
    if (!clean || !password) return res.status(400).json({ error: 'Email and password required' });

    const exists = await User.findOne({ email: clean });
    if (exists) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email: clean, password: hashed, role });
    res.status(201).json({ message: 'User registered' });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const clean = (req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email: clean });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(req.body.password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
};
