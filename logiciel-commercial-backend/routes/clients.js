const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const { protect, authorize } = require('../middleware/auth');

// middleware désactivé temporairement
router.use(protect);

// ✅ GET tous les clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
});

// ✅ GET client par ID
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ POST - Créer un client
router.post('/', async (req, res) => {
  try {
    const client = await Client.create(req.body);
    res.status(201).json({ message: '✅ Client ajouté avec succès', client });
  } catch (err) {
    res.status(400).json({ message: 'Erreur création client', error: err.message });
  }
});

// ✅ PUT - Modifier un client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: '✅ Client mis à jour', client });
  } catch (err) {
    res.status(400).json({ message: 'Erreur mise à jour', error: err.message });
  }
});

// ✅ DELETE - Supprimer un client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: '🗑️ Client supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur suppression', error: err.message });
  }
});

module.exports = router;
