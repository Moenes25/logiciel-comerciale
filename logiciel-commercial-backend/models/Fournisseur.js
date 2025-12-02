const mongoose = require('mongoose');

const fournisseurSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  raisonSociale: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  telephone: String,
  fax: String,
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: {
      type: String,
      default: 'Tunisie'
    }
  },
  type: {
  type: String,
  default: 'Équipement IT'
},


  matriculeFiscale: String,
  ice: String,
  conditions: {
    delaiPaiement: {
      type: Number,
      default: 30
    },
    modePaiement: {
      type: String,
      enum: ['espece', 'cheque', 'virement', 'traite'],
      default: 'virement'
    }
  },
  contactPrincipal: {
    nom: String,
    prenom: String,
    telephone: String,
    email: String
  },
  actif: {
    type: Boolean,
    default: true
  },
  notes: String,
rate: {
  type: Number,
  default: 4,
  min: 1,
  max: 5
},
commandesEnCours: {
  type: Number,
  default: 0
},


  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Fournisseur', fournisseurSchema);