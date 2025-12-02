const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
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
  dateCommande: {
    type: Date,
    default: Date.now
  },
  dateLivraison: Date,
  statut: {
     type: String,
     enum: ['brouillon', 'confirmee', 'en_cours', 'expediee', 'livree', 'annulee'],
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
    }
  },
  notes: String,
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // 🔗 Livraison associée (optionnelle)
  livraison: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Livraison'
  },

  dateCreation: {
    type: Date,
    default: Date.now
  }
});


// Calculer les totaux avant sauvegarde
commandeSchema.pre('save', function(next) {
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
  this.totaux.totalHT = totalHT;
  this.totaux.totalTVA = totalTVA;
  this.totaux.totalTTC = totalHT + totalTVA;

  next();
});

module.exports = mongoose.model('Commande', commandeSchema);