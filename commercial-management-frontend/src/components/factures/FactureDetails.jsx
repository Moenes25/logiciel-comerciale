import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Factures1.css';

const FactureDetails = () => {
  const navigate = useNavigate();

  return (
    <div className="factures-container">
      <div className="factures-header">
        <div className="header-left">
          <h1>Détails Facture</h1>
          <p>Consultation d'une facture</p>
        </div>
        <div className="header-right">
          <Link to="/factures" className="back-btn">
            ← Liste Factures
          </Link>
        </div>
      </div>

      <div style={{ padding: '30px', textAlign: 'center' }}>
        <h2>Détails Facture - À développer</h2>
        <p>Ce composant sera développé ultérieurement</p>
      </div>
    </div>
  );
};

export default FactureDetails;