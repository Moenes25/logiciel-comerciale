const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  designation: {
    type: String,
    required: true
  },
  description: String,
  categorie: {
    type: String,
    required: true
  },
  unite: {
    type: String,
    default: 'unité'
  },
  prixAchat: {
    type: Number,
    required: true
  },
  prixVente: {
    type: Number,
    required: true
  },
  tva: {
    type: Number,
    default: 19
  },
  stock: {
    quantite: {
      type: Number,
      default: 0
    },
    stockMin: {
      type: Number,
      default: 0
    },
    stockMax: {
      type: Number,
      default: 1000
    }
  },
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fournisseur'
  },
  codeBarre: String,
  image: String,
  actif: {
    type: Boolean,
    default: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Produit', produitSchema);