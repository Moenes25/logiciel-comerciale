const mongoose = require("mongoose");

// Charger tous les modèles Mongoose AVANT
require("../models/Client");
require("../models/Fournisseur");
require("../models/Produit");
require("../models/Commande");
require("../models/Facture");

// Charger ensuite les modèles
const Commande = mongoose.model("Commande");
const Facture = mongoose.model("Facture");

// Génération d'une facture depuis une commande
async function generateFactureFromCommande(commande) {
  try {
    const existing = await Facture.findOne({ commande: commande._id });
    if (existing) return existing;

    const numero = "FAC-" + Date.now();
    const typeFacture = commande.type === "achat" ? "achat" : "vente";

    const facture = await Facture.create({
      numero,
      type: typeFacture,
      client: typeFacture === "vente" ? commande.client : null,
      fournisseur: typeFacture === "achat" ? commande.fournisseur : null,
      commande: commande._id,

      dateFacture: new Date(),
      dateEcheance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),

      statut: "validee",
      modePaiement: "virement",

      lignes: commande.lignes.map(l => ({
        produit: l.produit,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        remise: l.remise || 0,
        tva: l.tva || 19
      })),

      totaux: {
        totalHT: commande.totaux.totalHT,
        totalTVA: commande.totaux.totalTVA,
        totalTTC: commande.totaux.totalTTC,
        remiseGlobale: commande.totaux.remiseGlobale || 0,
        montantPaye: 0,
        resteAPayer: commande.totaux.totalTTC
      }
    });

    console.log("✅ Facture créée pour", commande.numero);
    return facture;

  } catch (err) {
    console.error("❌ Erreur génération facture :", err.message);
  }
}

async function run() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/gestion_commerciale");

    console.log("MongoDB connecté");

    const commandes = await Commande.find().populate("client fournisseur lignes.produit");

    console.log("Commandes récupérées :", commandes.length);

    let count = 0;
    for (const cmd of commandes) {
      const facture = await generateFactureFromCommande(cmd);
      if (facture) count++;
    }

    console.log(`\n🎉 Terminé : ${count} facture(s) générée(s).`);
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
