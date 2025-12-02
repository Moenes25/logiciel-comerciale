const mongoose = require('mongoose');

const livraisonSchema = new mongoose.Schema({

  // 🔢 Numéro Livraison
  numero: {
    type: String,
    unique: true
  },

  // 🔗 Commande liée
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },

  // 🔗 Client
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },

  // 📦 Adresse
  adresseLivraison: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: {
      type: String,
      default: 'Tunisie'
    }
  },
  // 👤 Livreur (nom de la personne)
livreur: {
  type: String,
  default: ""
},


  // 📅 Date de livraison (affichage React)
  dateLivraison: {
    type: Date,
    default: Date.now
  },

  // 📦 Statut
  statut: {
    type: String,
    enum: ['en_preparation', 'expediee', 'en_transport', 'livree', 'echec', 'retournee'],
    default: 'en_preparation'
  },

  // ⚙️ Logistique
  modeLivraison: {
    type: String,
    enum: ['standard', 'express', 'retrait_magasin'],
    default: 'standard'
  },

  transporteur: String,
  numeroSuivi: String,

  // 📅 Dates internes
  datePreparation: Date,
  dateExpedition: Date,
  dateLivraisonPrevue: Date,
  dateLivraisonReelle: Date,

  // 💰 Frais
  fraisLivraison: {
    type: Number,
    default: 0
  },

  commentaires: String,

  // Métadonnées
  dateCreation: {
    type: Date,
    default: Date.now
  }
});


// AUTO-GÉNÉRATION DU NUMÉRO LIVRAISON
livraisonSchema.pre("save", function (next) {
  if (!this.numero) {
    this.numero = "LIV-" + Date.now();
  }
  next();
});


module.exports = mongoose.model('Livraison', livraisonSchema);
