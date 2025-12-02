const mongoose = require('mongoose');

const factureSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['vente', 'achat'],
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: function() { return this.type === 'vente'; }
  },
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fournisseur',
    required: function() { return this.type === 'achat'; }
  },
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande'
  },
  dateFacture: {
    type: Date,
    default: Date.now
  },
  dateEcheance: {
    type: Date,
    required: true
  },
  statut: {
    type: String,
    enum: ['brouillon', 'validee', 'payee', 'partiellement_payee', 'annulee'],
    default: 'brouillon'
  },
  lignes: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true
    },
    designation: String,
    quantite: {
      type: Number,
      required: true
    },
    prixUnitaire: {
      type: Number,
      required: true
    },
    remise: {
      type: Number,
      default: 0
    },
    tva: {
      type: Number,
      default: 19
    },
    montantHT: Number,
    montantTVA: Number,
    montantTTC: Number
  }],
  totaux: {
    totalHT: {
      type: Number,
      default: 0
    },
    totalTVA: {
      type: Number,
      default: 0
    },
    totalTTC: {
      type: Number,
      default: 0
    },
    remiseGlobale: {
      type: Number,
      default: 0
    },
    montantPaye: {
      type: Number,
      default: 0
    },
    resteAPayer: {
      type: Number,
      default: 0
    }
  },
  paiements: [{
    date: {
      type: Date,
      default: Date.now
    },
    montant: Number,
    modePaiement: {
      type: String,
      enum: ['espece', 'cheque', 'virement', 'traite', 'carte'],
      required: true
    },
    reference: String,
    notes: String
  }],
  modePaiement: {
    type: String,
    enum: ['espece', 'cheque', 'virement', 'traite', 'carte'],
    default: 'virement'
  },
  conditions: String,
  notes: String,
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

// Calculer les totaux avant sauvegarde
factureSchema.pre('save', function(next) {
  let totalHT = 0;
  let totalTVA = 0;

  this.lignes.forEach(ligne => {
    const montantHT = ligne.quantite * ligne.prixUnitaire * (1 - ligne.remise / 100);
    const montantTVA = montantHT * (ligne.tva / 100);
    const montantTTC = montantHT + montantTVA;

    ligne.montantHT = montantHT;
    ligne.montantTVA = montantTVA;
    ligne.montantTTC = montantTTC;

    totalHT += montantHT;
    totalTVA += montantTVA;
  });

  totalHT = totalHT * (1 - this.totaux.remiseGlobale / 100);
  const totalTTC = totalHT + totalTVA;

  this.totaux.totalHT = totalHT;
  this.totaux.totalTVA = totalTVA;
  this.totaux.totalTTC = totalTTC;

  // Calculer le reste à payer
  const montantPaye = this.paiements.reduce((sum, p) => sum + p.montant, 0);
  this.totaux.montantPaye = montantPaye;
  this.totaux.resteAPayer = totalTTC - montantPaye;

  // Mettre à jour le statut
  if (montantPaye === 0) {
    this.statut = this.statut === 'annulee' ? 'annulee' : 'validee';
  } else if (montantPaye >= totalTTC) {
    this.statut = 'payee';
  } else {
    this.statut = 'partiellement_payee';
  }

  next();
});

module.exports = mongoose.model('Facture', factureSchema);