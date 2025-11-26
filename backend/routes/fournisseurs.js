const express = require('express');
const router = express.Router();
const Fournisseur = require('../models/Fournisseur');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// GET all fournisseurs
router.get('/', async (req, res) => {
  const fournisseurs = await Fournisseur.find(); // récupère tout
  res.json(fournisseurs);
});


// GET fournisseur by ID
router.get('/:id', async (req, res) => {
  const fournisseur = await Fournisseur.findById(req.params.id);
  if (!fournisseur) return res.status(404).json({ message: 'Fournisseur non trouvé' });
  res.json(fournisseur);
});

// POST create fournisseur
router.post('/', authorize('admin', 'manager'), async (req, res) => {
  const fournisseur = await Fournisseur.create(req.body);
  res.status(201).json(fournisseur);
});

// PUT update fournisseur
router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!fournisseur) return res.status(404).json({ message: 'Fournisseur non trouvé' });
  res.json(fournisseur);
});

// DELETE fournisseur
router.delete('/:id', authorize('admin'), async (req, res) => {
  const fournisseur = await Fournisseur.findByIdAndDelete(req.params.id);
  if (!fournisseur) return res.status(404).json({ message: 'Fournisseur non trouvé' });
  res.json({ message: 'Fournisseur supprimé avec succès' });
});

router.put("/:id/increment-commandes", async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    fournisseur.commandesEnCours = (fournisseur.commandesEnCours || 0) + 1;
    await fournisseur.save();

    res.json({ success: true, message: "Commande ajoutée !" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


module.exports = router;

