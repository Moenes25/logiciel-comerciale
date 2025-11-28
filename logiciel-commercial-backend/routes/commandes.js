const express = require('express');
const router = express.Router();
const Commande = require('../models/Commande');
const Facture = require("../models/Facture");
const generateFactureFromCommande = require("../utils/generateFactureFromCommande");
const { protect, authorize } = require('../middleware/auth');
const Livraison = require("../models/Livraison");


router.use(protect);

// 🟦 GET all commandes
router.get('/', async (req, res) => {
  const commandes = await Commande.find()
    .populate('client fournisseur lignes.produit utilisateur');
  res.json(commandes);
});

// 🟦 GET commande by ID
router.get('/:id', async (req, res) => {
  const commande = await Commande.findById(req.params.id)
    .populate('client fournisseur lignes.produit utilisateur');

  if (!commande) return res.status(404).json({ message: 'Commande non trouvée' });
  res.json(commande);
});

// 🟩 STATUTS qui doivent générer une facture automatiquement
const autoStatus = ["confirmee", "expediee", "livree"];

// 🟦 CREATE commande + FACTURE AUTO
router.post('/', authorize('admin', 'manager'), async (req, res) => {
  try {
    // 1️⃣ Créer commande
    const commande = await Commande.create(req.body);
       // 2️⃣ Créer une livraison automatiquement (peu importe le statut)
    await Livraison.create({
      commande: commande._id,
      client: commande.client,
      statut: "en_preparation",
      adresseLivraison: commande.adresseLivraison || {},
      datePrevueLivraison: commande.dateLivraison || null
    });


    // 2️⃣ Recharger avec populate
    const populatedCommande = await Commande.findById(commande._id)
      .populate("client fournisseur lignes.produit");

    // 3️⃣ Si statut = confirmee / expediee / livree → génération facture
    await generateFactureFromCommande(populatedCommande);

    return res.status(201).json({
      success: true,
      data: populatedCommande
    });

  } catch (error) {
    console.error("Erreur création commande :", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🟧 UPDATE commande + MAJ FACTURE
router.put('/:id', authorize('admin', 'manager'), async (req, res) => {
  try {

    // 1️⃣ Mettre à jour commande
    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate("client fournisseur lignes.produit");

    if (!commande) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }

    // 2️⃣ Synchroniser livraison liée
    await Livraison.findOneAndUpdate(
      { commande: commande._id },
      {
        statut: req.body.statut,
        dateExpedition: req.body.statut === "expediee" ? Date.now() : undefined,
        dateLivraisonReelle: req.body.statut === "livree" ? Date.now() : undefined
      },
      { new: true }
    );

    // 3️⃣ Mettre à jour facture
    await generateFactureFromCommande(commande);

    res.json({ success: true, data: commande });

  } catch (error) {
    console.error("Erreur update commande:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});



// 🟪 PATCH statut + FACTURE AUTO
router.patch('/:id/status', authorize('admin', 'manager'), async (req, res) => {
  try {
    const { status } = req.body;

    const commande = await Commande.findByIdAndUpdate(
      req.params.id,
      { statut: status },
      { new: true }
    ).populate('client fournisseur lignes.produit utilisateur');

    if (!commande) {
      return res.status(404).json({ success: false, message: "Commande non trouvée" });
    }
    // ⭐ Synchroniser livraison
    await Livraison.findOneAndUpdate(
      { commande: commande._id },
      {
        statut: status,
        dateExpedition: status === "expediee" ? Date.now() : undefined,
        dateLivraisonReelle: status === "livree" ? Date.now() : undefined
      }
    );


    // Génère une facture SI le statut appartient à la liste
    await generateFactureFromCommande(commande);

    res.json({ success: true, data: commande });


  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🟥 DELETE commande + DELETE facture associée
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);

    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Supprime facture liée
    await Facture.findOneAndDelete({ commande: req.params.id });

    res.json({ success: true, message: 'Commande et facture associée supprimées' });
       // Supprimer livraison
    await Livraison.findOneAndDelete({ commande: req.params.id });


  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
