const mongoose = require('mongoose');

const dossierSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  titre: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['projet', 'contrat', 'affaire', 'autre'],
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client'
  },
  priorite: {
  type: String,
  enum: ["haute", "moyenne", "basse"],
  default: "moyenne"
},
  statut: {
    type: String,
    enum: ['ouvert', 'en_cours', 'suspendu', 'cloture', 'archive'],
    default: 'ouvert'
  },
  dateDebut: {
    type: Date,
    default: Date.now
  },
  dateFin: Date,
  responsable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipe: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  description: String,
  montantEstime: Number,
  montantReel: Number,
  documents: [{
    nom: String,
    type: String,
    url: String,
    taille: Number,
    dateAjout: {
      type: Date,
      default: Date.now
    }
  }],
  commandes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande'
  }],
  factures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facture'
  }],
  notes: String,
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateMiseAJour: {
    type: Date,
    default: Date.now
  }
});

// Mettre à jour la date de mise à jour
dossierSchema.pre('save', function(next) {
  this.dateMiseAJour = Date.now();
  next();
});

module.exports = mongoose.model('Dossier', dossierSchema);