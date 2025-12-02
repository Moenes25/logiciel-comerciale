const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit'
  },
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
  },
  unite: {
    type: String,
    default: 'unité'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereEntree: {
    type: Date
  },
  derniereSortie: {
    type: Date
  },
});

module.exports = mongoose.model('Stock', stockSchema);
