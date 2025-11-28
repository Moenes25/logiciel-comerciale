const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

// Importation des routes
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const commandeRoutes = require('./routes/commandes');
const dossierRoutes = require('./routes/dossiers');
const factureRoutes = require('./routes/factures');
const livraisonRoutes = require('./routes/livraisons');
const fournisseurRoutes = require('./routes/fournisseurs');
const produitRoutes = require('./routes/produits');
const userRoutes = require('./routes/users');

// Charger les variables d'environnement
dotenv.config();

const app = express();

// ✅ Connexion à la base de données
connectDB();

// ✅ Middlewares globaux
app.use(cors({
  origin: [
    'https://logiciel-commercial-riul.vercel.app'
    
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']}));
app.use(express.json());

app.options('*', cors());

// ✅ Route de test simple pour vérifier que le serveur tourne
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Test OK depuis le serveur' });
});




 app.get('/api/db-status', (req, res) => {
  const mongoose = require('mongoose');
  
  const statusCodes = {
    0: 'Déconnecté',
    1: 'Connecté',
    2: 'En cours de connexion', 
    3: 'En cours de déconnexion'
  };
  
  const dbStatus = {
    état: statusCodes[mongoose.connection.readyState] || 'Inconnu',
    readyState: mongoose.connection.readyState,
    nomBaseDeDonnées: mongoose.connection.name || 'Non connecté',
    hôte: mongoose.connection.host || 'Non connecté',
    port: mongoose.connection.port || 'Non connecté'
  };
  
  res.json(dbStatus);
});


// ✅ Route de test ULTRA simple
app.get('/api/super-test', (req, res) => {
  res.json({ 
    message: '✅ Route super test - sans MongoDB',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ✅ Routes principales
app.use('/api/auth', authRoutes);           // /api/auth/login & /api/auth/register
app.use('/api/clients', clientRoutes);      // /api/clients
app.use('/api/commandes', commandeRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/livraisons', livraisonRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', require('./routes/dashboard'));


// ✅ Route 404 si aucune autre route ne correspond
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route non trouvée' });
});

// ✅ Démarrage du serveur
const PORT = process.env.PORT || 8000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
module.exports = app;