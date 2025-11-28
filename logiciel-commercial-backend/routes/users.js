const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET all users
router.get('/', protect, authorize('admin'), async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// GET user by ID
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});


// POST create user
router.post('/', protect, authorize('admin'), async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

// PUT update user
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  res.json(user);
});

// DELETE user
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
  res.json({ message: 'Utilisateur supprimé avec succès' });
});

module.exports = router;
