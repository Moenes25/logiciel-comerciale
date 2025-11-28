const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  prenom: String,
  type: {
    type: String,
    enum: ['particulier', 'entreprise'],
    default: 'particulier'
  },
  email: {
    type: String,
    required: true
  },
  telephone: String,
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: {
      type: String,
      default: 'Tunisie'
    }
  },
  matriculeFiscale: String,
  ice: String,
  credit: {
    type: Number,
    default: 0
  },
  limitCredit: {
    type: Number,
    default: 0
  },
  actif: {
    type: Boolean,
    default: true
  },
  notes: String,
  dateCreation: {
    type: Date,
    default: Date.now
  },
  derniereTransaction: Date
});

module.exports = mongoose.model('Client', clientSchema);