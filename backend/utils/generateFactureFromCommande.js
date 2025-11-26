const Facture = require("../models/Facture");

async function generateFactureFromCommande(commande) {
  try {
    // Vérifier si une facture existe déjà pour cette commande
    const existing = await Facture.findOne({ commande: commande._id });
    if (existing) return existing; // ne pas créer deux fois

    const numero = "FAC-" + Date.now();

    const facture = await Facture.create({
      numero,
      client: commande.client,
      fournisseur: commande.fournisseur,
      commande: commande._id,
      dateFacture: new Date(),
      dateEcheance: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // +15 jours

      statut: "validee",
      modePaiement: "non_paye",

      lignes: commande.lignes.map(l => ({
        produit: l.produit,
        quantite: l.quantite,
        prixUnitaire: l.prixUnitaire,
        remise: l.remise,
        tva: l.tva
      })),

      totaux: commande.totaux
    });

    return facture;
  } catch (err) {
    console.error("Erreur génération facture :", err.message);
  }
}

module.exports = generateFactureFromCommande;
