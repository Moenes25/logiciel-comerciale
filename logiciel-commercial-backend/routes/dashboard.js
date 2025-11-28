const express = require('express');
const router = express.Router();

const Client = require('../models/Client');
const Produit = require('../models/Produit');
const Commande = require('../models/Commande');
const Facture = require('../models/Facture');
const Dossier = require('../models/Dossier');
const Fournisseur = require('../models/Fournisseur');

router.get('/stats', async (req, res) => {
  try {
    const stats = {
      clients: await Client.countDocuments(),
      commandes: await Commande.countDocuments(),
      produits: await Produit.countDocuments(),
      factures: await Facture.countDocuments(),
      dossiers: await Dossier.countDocuments(),
      fournisseurs: await Fournisseur.countDocuments()
    };

    res.json(stats);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
