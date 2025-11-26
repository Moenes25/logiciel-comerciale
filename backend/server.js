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
app.use(cors());
app.use(express.json());

// ✅ Route de test simple pour vérifier que le serveur tourne
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Test OK depuis le serveur' });
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
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
