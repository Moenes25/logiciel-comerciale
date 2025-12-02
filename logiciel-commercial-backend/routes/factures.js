const express = require('express');
const router = express.Router();
const Facture = require('../models/Facture');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET all factures
router.get('/', async (req, res) => {
  const factures = await Facture.find()
    .populate('client fournisseur commande lignes.produit utilisateur');

  res.json({
    success: true,
    data: factures
  });
});

// GET facture by ID
router.get('/:id', async (req, res) => {
  const facture = await Facture.findById(req.params.id)
    .populate('client fournisseur commande lignes.produit utilisateur');

  if (!facture) {
    return res.status(404).json({ success: false, message: 'Facture non trouvée' });
  }

  res.json({ success: true, data: facture });
});


// POST create facture
router.post('/', authorize('admin', 'manager'), async (req, res) => {
  const facture = await Facture.create(req.body);
  res.status(201).json(facture);
});

// PUT update facture
router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  const facture = await Facture.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!facture) return res.status(404).json({ message: 'Facture non trouvée' });
  res.json(facture);
});

// DELETE facture
router.delete('/:id', authorize('admin'), async (req, res) => {
  const facture = await Facture.findByIdAndDelete(req.params.id);
  if (!facture) return res.status(404).json({ message: 'Facture non trouvée' });
  res.json({ message: 'Facture supprimée avec succès' });
});

module.exports = router;
