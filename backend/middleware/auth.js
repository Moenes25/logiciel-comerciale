/*const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Non autorisé, token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Non autorisé, token invalide' });
  }
};

// Middleware pour vérifier le rôle
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Accès refusé pour le rôle ${req.user.role}` });
    }
    next();
  };
};*/

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ✅ Middleware pour protéger les routes (désactivé temporairement)
exports.protect = async (req, res, next) => {
  try {
    // 🚧 Mode développement : on saute la vérification du token
    console.log('⚠️ Auth désactivée temporairement (mode dev)');
    
    // Tu peux même définir un utilisateur par défaut pour les tests
    req.user = { id: 'dev-user', role: 'admin' };

    next();
  } catch (error) {
    res.status(500).json({ message: 'Erreur interne du middleware' });
  }
};

// ✅ Middleware pour vérifier le rôle (ne bloque pas pour l’instant)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // En mode dev, on laisse tout passer
    console.log('⚠️ Vérification des rôles désactivée (mode dev)');
    next();
  };
};

