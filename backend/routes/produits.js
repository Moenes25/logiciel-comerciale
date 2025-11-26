const express = require('express');
const router = express.Router();
const Produit = require('../models/Produit');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET all produits
router.get('/', async (req, res) => {
  const produits = await Produit.find().populate('fournisseur');
  res.json(produits);
});

// GET produit by ID
router.get('/:id', async (req, res) => {
  const produit = await Produit.findById(req.params.id).populate('fournisseur');
  if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
  res.json(produit);
});

// POST create produit
/*router.post('/', authorize('admin', 'manager'), async (req, res) => {
  const produit = await Produit.create(req.body);
  res.status(201).json(produit);
});*/

router.post('/', async (req, res) => {
  try {
    const produit = await Produit.create(req.body);
    res.status(201).json(produit);
  } catch (error) {
    console.error("Erreur création produit:", error.message);
    res.status(400).json({ message: error.message });
  }
});


// PUT update produit
router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  const produit = await Produit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
  res.json(produit);
});

// DELETE produit
router.delete('/:id', authorize('admin'), async (req, res) => {
  const produit = await Produit.findByIdAndDelete(req.params.id);
  if (!produit) return res.status(404).json({ message: 'Produit non trouvé' });
  res.json({ message: 'Produit supprimé avec succès' });
});

module.exports = router;
 