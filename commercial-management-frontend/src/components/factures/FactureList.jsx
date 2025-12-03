import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import factureService from "../../services/factureService";


import './Factures1.css';

const FactureList = () => {
  const navigate = useNavigate();
  
 const [factures, setFactures] = useState([]);
useEffect(() => {
  const loadFactures = async () => {
    try {
      const res = await factureService.getAll();
      if (res.success && Array.isArray(res.data.data)) {
        setFactures(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  loadFactures();

  // ⭐ Écouter l’événement venant de commandeService
  const refreshListener = () => loadFactures();
  window.addEventListener("facturesUpdated", refreshListener);

  return () => {
    window.removeEventListener("facturesUpdated", refreshListener);
  };

}, []);






  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('Tous');

  const statuts = ['Tous', 'payee', 'en_attente', 'en_retard', 'brouillon', 'annulee', 'en_cours'];


  const filteredFactures = factures.filter(facture => {
  const search = searchTerm.toLowerCase();

  const clientName =
  facture.client?.nom
    ? `${facture.client.nom} ${facture.client.prenom || ""}`.toLowerCase()
    : facture.fournisseur?.raisonSociale?.toLowerCase() || "";


  const matchesSearch =
    facture.numero.toLowerCase().includes(search) ||
    clientName.includes(search);

  const matchesStatut =
    selectedStatut === "Tous" || facture.statut === selectedStatut;

  return matchesSearch && matchesStatut;
});


  const getStatutLabel = (statut) => {
  const labels = {
  payee: "Payée",
  en_attente: "En attente",
  en_retard: "En retard",
  brouillon: "Brouillon",
  annulee: "Annulée",
  en_cours: "En cours"
};

    return labels[statut] || statut;
  };

  return (
    <div className="factures-container">
      {/* Header */}
      <div className="factures-header5">
        <div className="header-left">
          <h1>Gestion des Factures</h1>
          <p>Suivez et gérez vos factures clients</p>
        </div>
        <br></br>
        <div className="header-right">
          <Link to="/dashboard" className="back-btn">
            ← Tableau de Bord
          </Link>
          <button 
            className="add-btn"
            onClick={() => navigate('/factures/nouveau')}
          >
            + Nouvelle Facture
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-overview">
        <div className="stat-item">
          <div className="stat-icon total">🧾</div>
          <div className="stat-info">
            <span className="stat-value">{factures.length}</span>
            <span className="stat-label">Factures Total</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon payees">✅</div>
          <div className="stat-info">
            <span className="stat-value">{factures.filter(f => f.statut === 'payee').length}</span>
            <span className="stat-label">Factures Payées</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon en-attente">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{factures.filter(f => f.statut === 'en_attente').length}</span>
            <span className="stat-label">En Attente</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon retard">⚠️</div>
          <div className="stat-info">
            <span className="stat-value">{factures.filter(f => f.statut === 'en_retard').length}</span>
            <span className="stat-label">En Retard</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="factures-toolbar">
        <div className="search-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="Rechercher une facture par numéro ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
        
        <div className="filters-section">
          <div className="filter-group">
            <label>Statut</label>
            <select 
              value={selectedStatut} 
              onChange={(e) => setSelectedStatut(e.target.value)}
            >
              {statuts.map(statut => (
                <option key={statut} value={statut}>
                  {statut === 'Tous' ? 'Tous les statuts' : getStatutLabel(statut)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Factures Table */}
      <div className="factures-table-container">
         <div className="factures-table">
        <table className="factures-table">
          <thead>
            <tr>
              <th>Numéro</th>
              <th>Client</th>
              <th>Date</th>
              <th>Échéance</th>
              <th>Montant TTC</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFactures.map(facture => (
              <tr key={facture._id}>
                <td className="col-numero">{facture.numero}</td>
        <td className="col-client">
  {facture.client?.nom 
    ? `${facture.client.nom} ${facture.client.prenom ?? ""}`
    : facture.fournisseur?.raisonSociale
      ? facture.fournisseur.raisonSociale
      : "---"
  }
</td>


         <td className="col-date">
  {new Date(facture.dateFacture).toLocaleDateString()}
</td>

<td className="col-date">
  {new Date(facture.dateEcheance).toLocaleDateString()}
</td>

<td className="col-montant">
  {facture.totaux ? facture.totaux.totalTTC.toFixed(2) : "0.00"} DNT
</td>


                <td>
                  <span className={`statut-badge1 statut-${facture.statut}`}>
                    {getStatutLabel(facture.statut)}
                  </span>
                </td>
                <td className="actions-cell">
                  <button className="action-btn view">
                    👁️ Voir
                  </button>
                  <button className="action-btn pdf">
                    📄 PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredFactures.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🧾</div>
          <h3>Aucune facture trouvée</h3>
          <p>Aucune facture ne correspond à vos critères de recherche</p>
          <div className="empty-actions">
            <button 
              className="action-btn primary"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatut('Tous');
              }}
            >
              🔄 Réinitialiser les filtres
            </button>
            <button 
              className="action-btn secondary"
              onClick={() => navigate('/factures/nouveau')}
            >
              + Créer une facture
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FactureList;