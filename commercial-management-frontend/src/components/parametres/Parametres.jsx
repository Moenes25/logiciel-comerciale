import React from 'react';
import { Link } from 'react-router-dom';
import './Parametres.css';

const Parametres = () => {
  return (
    <div className="parametres-container">
      <div className="parametres-header">
        <div className="header-left">
          <h1>Paramètres</h1>
          <p>Gérez les paramètres de votre application</p>
        </div>
        <div className="header-right">
          <Link to="/dashboard" className="back-btn">
            ← Tableau de Bord
          </Link>
        </div>
      </div>

      <div className="parametres-content">
        <div className="parametres-grid">
          {/* Section Général */}
          <div className="parametres-section">
            <h3>⚙️ Général</h3>
            <div className="parametres-list">
              <div className="parametre-item">
                <span className="parametre-label">Nom de l'entreprise</span>
                <span className="parametre-value">SARL Technologie</span>
                <button className="action-btn edit">Modifier</button>
              </div>
              <div className="parametre-item">
                <span className="parametre-label">Email de contact</span>
                <span className="parametre-value">contact@entreprise.com</span>
                <button className="action-btn edit">Modifier</button>
              </div>
              <div className="parametre-item">
                <span className="parametre-label">Téléphone</span>
                <span className="parametre-value">+33 1 23 45 67 89</span>
                <button className="action-btn edit">Modifier</button>
              </div>
            </div>
          </div>

          {/* Section Sécurité */}
          <div className="parametres-section">
            <h3>🔒 Sécurité</h3>
            <div className="parametres-list">
              <div className="parametre-item">
                <span className="parametre-label">Mot de passe</span>
                <span className="parametre-value">••••••••</span>
                <button className="action-btn edit">Changer</button>
              </div>
              <div className="parametre-item">
                <span className="parametre-label">Authentification à deux facteurs</span>
                <span className="parametre-value">Désactivé</span>
                <button className="action-btn edit">Activer</button>
              </div>
            </div>
          </div>

          {/* Section Préférences */}
          <div className="parametres-section">
            <h3>🎨 Préférences</h3>
            <div className="parametres-list">
              <div className="parametre-item">
                <span className="parametre-label">Langue</span>
                <span className="parametre-value">Français</span>
                <button className="action-btn edit">Changer</button>
              </div>
              <div className="parametre-item">
                <span className="parametre-label">Fuseau horaire</span>
                <span className="parametre-value">Europe/Paris</span>
                <button className="action-btn edit">Changer</button>
              </div>
              <div className="parametre-item">
                <span className="parametre-label">Format de date</span>
                <span className="parametre-value">DD/MM/YYYY</span>
                <button className="action-btn edit">Changer</button>
              </div>
            </div>
          </div>

          {/* Section Notifications */}
          <div className="parametres-section">
            <h3>🔔 Notifications</h3>
            <div className="parametres-list">
              <div className="parametre-item">
                <span className="parametre-label">Notifications email</span>
                <span className="parametre-value">Activé</span>
                <button className="action-btn edit">Configurer</button>
              </div>
              <div className="parametre-item">
                <span className="parametre-label">Notifications push</span>
                <span className="parametre-value">Désactivé</span>
                <button className="action-btn edit">Activer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;