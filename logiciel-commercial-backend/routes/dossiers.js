const express = require('express');
const router = express.Router();
const Dossier = require('../models/Dossier');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET all dossiers
router.get('/', async (req, res) => {
  const dossiers = await Dossier.find().populate('client responsable equipe commandes factures');
  res.json(dossiers);
});

// GET dossier by ID
router.get('/:id', async (req, res) => {
  const dossier = await Dossier.findById(req.params.id).populate('client responsable equipe commandes factures');
  if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé' });
  res.json(dossier);
});

// POST create dossier
router.post('/', authorize('admin', 'manager'), async (req, res) => {
  const dossier = await Dossier.create(req.body);
  res.status(201).json(dossier);
});

// PUT update dossier
router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  const dossier = await Dossier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé' });
  res.json(dossier);
});

// DELETE dossier
router.delete('/:id', authorize('admin'), async (req, res) => {
  const dossier = await Dossier.findByIdAndDelete(req.params.id);
  if (!dossier) return res.status(404).json({ message: 'Dossier non trouvé' });
  res.json({ message: 'Dossier supprimé avec succès' });
});

module.exports = router;
