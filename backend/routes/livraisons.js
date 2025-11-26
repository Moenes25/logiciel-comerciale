const express = require("express");
const router = express.Router();
const Livraison = require("../models/Livraison");
const Commande = require("../models/Commande");
const { protect, authorize } = require("../middleware/auth");

router.use(protect);

// -------------------------
// 🔵 GET ALL LIVRAISONS
// -------------------------
router.get("/", async (req, res) => {
  try {
    const livraisons = await Livraison.find()
      .populate("client")
      .populate({
        path: "commande",
        populate: [
          { path: "client" },
          { path: "lignes.produit" }
        ]
      })
      .lean();

    // Ajouter champs manquants pour éviter undefined dans le front
  const formatted = livraisons.map(liv => ({
  ...liv,
  livreur: liv.livreur || "",
  adresseLivraison: liv.adresseLivraison || {
    rue: "",
    ville: "",
    codePostal: "",
    pays: "Tunisie"
  },
  modeLivraison: liv.modeLivraison || "standard",
  transporteur: liv.transporteur || "",
  numeroSuivi: liv.numeroSuivi || "",
  dateLivraison: liv.dateLivraison || liv.dateCreation || null
}));


    res.json({ success: true, data: formatted });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



// -------------------------
// 🔵 GET ONE LIVRAISON
// -------------------------
router.get("/:id", async (req, res) => {
  try {
    const livraison = await Livraison.findById(req.params.id)
      .populate({
        path: "commande",
        populate: [
          { path: "client" },
          { path: "lignes.produit" }
        ]
      })
      .populate("client")
      .lean(); // renvoie un vrai objet JavaScript

    if (!livraison) {
      return res.status(404).json({
        success: false,
        message: "Livraison non trouvée"
      });
    }

    // S'assurer que l'adresse existe toujours
    livraison.adresseLivraison = livraison.adresseLivraison || {
      rue: "",
      ville: "",
      codePostal: "",
      pays: "Tunisie"
    };

    // Remplir les champs manquants
    livraison.modeLivraison = livraison.modeLivraison || "standard";
    livraison.transporteur = livraison.transporteur || "";
    livraison.numeroSuivi = livraison.numeroSuivi || "";
    livraison.livreur = livraison.livreur || "";
    livraison.dateLivraison = livraison.dateLivraison || livraison.dateCreation || null;
    livraison.datePreparation = livraison.datePreparation || null;
    livraison.dateExpedition = livraison.dateExpedition || null;
    livraison.dateLivraisonPrevue = livraison.dateLivraisonPrevue || null;
    livraison.dateLivraisonReelle = livraison.dateLivraisonReelle || null;

    return res.json({
      success: true,
      data: livraison
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});



// -------------------------
// 🟢 CREATE LIVRAISON
// -------------------------
router.post("/", authorize("admin", "manager"), async (req, res) => {
  try {
   const livraison = await Livraison.create({
  commande: req.body.commande,
  client: req.body.client,

  livreur: req.body.livreur || "",   // <--- AJOUT ICI

  adresseLivraison: {
    rue: req.body.adresseLivraison?.rue || "",
    ville: req.body.adresseLivraison?.ville || "",
    codePostal: req.body.adresseLivraison?.codePostal || "",
    pays: req.body.adresseLivraison?.pays || "Tunisie"
  },

  statut: req.body.statut || "en_preparation",
  modeLivraison: req.body.modeLivraison || "standard",
  transporteur: req.body.transporteur || "",
  numeroSuivi: req.body.numeroSuivi || "",

  dateLivraison: req.body.dateLivraison || Date.now(),
  datePreparation: Date.now(),

  fraisLivraison: req.body.fraisLivraison || 0,
  commentaires: req.body.commentaires || ""
});


    // Liaison commande -> livraison
    await Commande.findByIdAndUpdate(livraison.commande, {
      livraison: livraison._id
    });

    return res.status(201).json({ success: true, data: livraison });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});


// -------------------------
// 🟠 UPDATE STATUT
// -------------------------
router.patch("/:id/statut", authorize("admin", "manager"), async (req, res) => {
  try {
    const { statut } = req.body;

    const updates = { statut };
    if (statut === "expediee") updates.dateExpedition = new Date();
    if (statut === "livree") updates.dateLivraisonReelle = new Date();

    const livraison = await Livraison.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    if (!livraison) {
      return res.status(404).json({ success: false, message: "Livraison non trouvée" });
    }

    return res.json({ success: true, data: livraison });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
 const updated = await Livraison.findByIdAndUpdate(
  req.params.id,
  req.body,
  { new: true }
);


    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Livraison introuvable"
      });
    }

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {
    console.error("Erreur PUT livraison:", err);
    res.status(500).json({
      success: false,
      message: "Erreur interne du serveur"
    });
  }
});


module.exports = router;
