import React, { useState, useEffect } from 'react';
import './RelationPanel.css';

const RelationPanel = ({ entityType, entityId }) => {
  const [relations, setRelations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadRelations();
  }, [entityType, entityId]);

  const loadRelations = async () => {
    try {
      // Simulation de données de relations
      const mockRelations = getMockRelations(entityType, entityId);
      setRelations(mockRelations);
    } catch (error) {
      console.error('Erreur chargement relations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMockRelations = (type, id) => {
    // Données mockées pour démonstration
    const mockData = {
      clients: {
        overview: {
          commandes: 12,
          factures: 8,
          dossiers: 3,
          paiements: 8,
          caTotal: 45800
        },
        commandes: [
          { id: 1, reference: 'CMD-2024-001', date: '2024-01-15', statut: 'Livré', total: 1200 },
          { id: 2, reference: 'CMD-2024-005', date: '2024-01-18', statut: 'En cours', total: 850 }
        ],
        factures: [
          { id: 1, reference: 'FAC-2024-001', date: '2024-01-16', echeance: '2024-02-16', statut: 'Payée', total: 1440 },
          { id: 2, reference: 'FAC-2024-002', date: '2024-01-20', echeance: '2024-02-20', statut: 'En attente', total: 1020 }
        ],
        dossiers: [
          { id: 1, titre: 'Projet Digital', type: 'Projet', statut: 'En cours' },
          { id: 2, titre: 'Contrat Maintenance', type: 'Maintenance', statut: 'Actif' }
        ]
      },
      produits: {
        overview: {
          commandes: 25,
          factures: 18,
          stock: 15,
          stockMin: 5,
          ventesMois: 12
        },
        commandes: [
          { id: 1, reference: 'CMD-2024-001', client: 'Dupont Industries', date: '2024-01-15', quantite: 2 },
          { id: 2, reference: 'CMD-2024-003', client: 'Martin Corp', date: '2024-01-16', quantite: 1 }
        ]
      }
    };

    return mockData[type] || {};
  };

  if (loading) {
    return <div className="relation-panel loading">Chargement des relations...</div>;
  }

  return (
    <div className="relation-panel">
      <div className="relation-header">
        <h3>📊 Relations & Activités</h3>
        <div className="relation-tabs">
          {['overview', 'commandes', 'factures', 'dossiers'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {getTabLabel(tab)}
            </button>
          ))}
        </div>
      </div>

      <div className="relation-content">
        {renderTabContent(activeTab, relations)}
      </div>
    </div>
  );
};

const getTabLabel = (tab) => {
  const labels = {
    overview: '📈 Vue d\'ensemble',
    commandes: '🛒 Commandes',
    factures: '🧾 Factures', 
    dossiers: '📁 Dossiers'
  };
  return labels[tab] || tab;
};

const renderTabContent = (tab, relations) => {
  if (!relations || !relations[tab]) {
    return <div className="no-data">Aucune donnée disponible</div>;
  }

  switch (tab) {
    case 'overview':
      return <OverviewTab data={relations.overview} />;
    case 'commandes':
      return <CommandesTab data={relations.commandes} />;
    case 'factures':
      return <FacturesTab data={relations.factures} />;
    case 'dossiers':
      return <DossiersTab data={relations.dossiers} />;
    default:
      return null;
  }
};

// Composants pour chaque onglet
const OverviewTab = ({ data }) => (
  <div className="overview-grid">
    <div className="stat-card">
      <span className="stat-value">{data.commandes}</span>
      <span className="stat-label">Commandes</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{data.factures}</span>
      <span className="stat-label">Factures</span>
    </div>
    <div className="stat-card">
      <span className="stat-value">{data.dossiers}</span>
      <span className="stat-label">Dossiers</span>
    </div>
    {data.caTotal && (
      <div className="stat-card highlight">
        <span className="stat-value">{data.caTotal.toLocaleString()} €</span>
        <span className="stat-label">CA Total</span>
      </div>
    )}
    {data.stock && (
      <div className="stat-card">
        <span className="stat-value">{data.stock}</span>
        <span className="stat-label">Stock actuel</span>
      </div>
    )}
  </div>
);

const CommandesTab = ({ data }) => (
  <div className="relation-list">
    {data.map(commande => (
      <div key={commande.id} className="relation-item">
        <div className="item-main">
          <strong>{commande.reference}</strong>
          <span className="date">{commande.date}</span>
        </div>
        <div className="item-details">
          <span className={`statut ${commande.statut?.toLowerCase()}`}>
            {commande.statut}
          </span>
          <span className="total">{commande.total} €</span>
        </div>
        {commande.client && (
          <div className="item-client">{commande.client}</div>
        )}
      </div>
    ))}
  </div>
);

const FacturesTab = ({ data }) => (
  <div className="relation-list">
    {data.map(facture => (
      <div key={facture.id} className="relation-item">
        <div className="item-main">
          <strong>{facture.reference}</strong>
          <span className="date">Échéance: {facture.echeance}</span>
        </div>
        <div className="item-details">
          <span className={`statut ${facture.statut?.toLowerCase()}`}>
            {facture.statut}
          </span>
          <span className="total">{facture.total} €</span>
        </div>
      </div>
    ))}
  </div>
);

const DossiersTab = ({ data }) => (
  <div className="relation-list">
    {data.map(dossier => (
      <div key={dossier.id} className="relation-item">
        <div className="item-main">
          <strong>{dossier.titre}</strong>
          <span className="type">{dossier.type}</span>
        </div>
        <div className="item-details">
          <span className={`statut ${dossier.statut?.toLowerCase()}`}>
            {dossier.statut}
          </span>
        </div>
      </div>
    ))}
  </div>
);

export default RelationPanel;