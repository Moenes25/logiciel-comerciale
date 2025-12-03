import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Factures1.css';

const FactureForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // États du formulaire
  const [formData, setFormData] = useState({
    client_id: '',
    date_facture: new Date().toISOString().split('T')[0],
    date_echeance: '',
    statut: 'brouillon',
    conditions_paiement: '30 jours',
    notes: '',
    lignes: []
  });

  const [selectedProduit, setSelectedProduit] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);

  // Données mockées
  const [clients, setClients] = useState([
    { id: 1, nom: 'Dupont Industries', adresse: '123 Rue de Paris, 75001 Paris' },
    { id: 2, nom: 'Martin Corp', adresse: '456 Avenue des Champs, 69002 Lyon' },
    { id: 3, nom: 'Services Plus', adresse: '789 Boulevard Central, 13001 Marseille' }
  ]);

  const [produits, setProduits] = useState([
    { id: 1, nom: 'Ordinateur Portable Pro', prix: 1200, tva: 20 },
    { id: 2, nom: 'Smartphone Elite', prix: 899.99, tva: 20 },
    { id: 3, nom: 'Casque Audio Premium', prix: 249.50, tva: 20 },
    { id: 4, nom: 'Écran 24" Professionnel', prix: 350, tva: 20 },
    { id: 5, nom: 'Clavier Mécanique', prix: 150, tva: 20 }
  ]);

  // Calcul des totaux
  const calculerTotaux = () => {
    const totalHT = formData.lignes.reduce((sum, ligne) => sum + (ligne.prix_unitaire * ligne.quantite), 0);
    const totalTVA = formData.lignes.reduce((sum, ligne) => sum + (ligne.prix_unitaire * ligne.quantite * ligne.taux_tva / 100), 0);
    const totalTTC = totalHT + totalTVA;

    return { totalHT, totalTVA, totalTTC };
  };

  const totaux = calculerTotaux();

  // Ajouter une ligne
  const ajouterLigne = () => {
    if (!selectedProduit || quantite < 1) return;

    const produit = produits.find(p => p.id === parseInt(selectedProduit));
    if (!produit) return;

    const nouvelleLigne = {
      id: Date.now(),
      produit_id: produit.id,
      nom: produit.nom,
      quantite: quantite,
      prix_unitaire: prixUnitaire || produit.prix,
      taux_tva: produit.tva,
      total_ligne: (prixUnitaire || produit.prix) * quantite
    };

    setFormData(prev => ({
      ...prev,
      lignes: [...prev.lignes, nouvelleLigne]
    }));

    setSelectedProduit('');
    setQuantite(1);
    setPrixUnitaire(0);
  };

  // Supprimer une ligne
  const supprimerLigne = (ligneId) => {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.filter(l => l.id !== ligneId)
    }));
  };

  // Modifier une ligne
  const modifierLigne = (ligneId, champ, valeur) => {
    setFormData(prev => ({
      ...prev,
      lignes: prev.lignes.map(l => {
        if (l.id === ligneId) {
          const ligneModifiee = { ...l, [champ]: valeur };
          ligneModifiee.total_ligne = ligneModifiee.prix_unitaire * ligneModifiee.quantite;
          return ligneModifiee;
        }
        return l;
      })
    }));
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const factureData = {
      ...formData,
      ...totaux,
      numero: `FAC-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    console.log('Données facture:', factureData);
    alert(isEdit ? 'Facture modifiée!' : 'Facture créée!');
    navigate('/factures');
  };

  // Effet pour mettre à jour le prix unitaire
  useEffect(() => {
    if (selectedProduit) {
      const produit = produits.find(p => p.id === parseInt(selectedProduit));
      if (produit) {
        setPrixUnitaire(produit.prix);
      }
    }
  }, [selectedProduit, produits]);

  return (
    <div className="factures-container">
      <div className="factures-header">
        <div className="header-left">
          <h1>{isEdit ? 'Modifier la Facture' : 'Nouvelle Facture'}</h1>
          <p>{isEdit ? 'Modifiez les détails de la facture' : 'Créez une nouvelle facture client'}</p>
        </div>
        <div className="header-right">
          <button 
            className="back-btn"
            onClick={() => navigate('/factures')}
          >
            ← Retour
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="facture-form">
        {/* Section Informations Générales */}
        <div className="form-section">
          <h3>Informations Générales</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Client *</label>
              <select 
                value={formData.client_id} 
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value }))}
                required
              >
                <option value="">Sélectionnez un client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Date de Facture</label>
              <input 
                type="date" 
                value={formData.date_facture}
                onChange={(e) => setFormData(prev => ({ ...prev, date_facture: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Date d'Échéance *</label>
              <input 
                type="date" 
                value={formData.date_echeance}
                onChange={(e) => setFormData(prev => ({ ...prev, date_echeance: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Statut</label>
              <select 
                value={formData.statut} 
                onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
              >
                <option value="brouillon">Brouillon</option>
                <option value="en_attente">En attente</option>
                <option value="payee">Payée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>

            <div className="form-group">
              <label>Conditions de Paiement</label>
              <select 
                value={formData.conditions_paiement}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions_paiement: e.target.value }))}
              >
                <option value="30 jours">30 jours</option>
                <option value="45 jours">45 jours</option>
                <option value="60 jours">60 jours</option>
                <option value="Comptant">Comptant</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Ajout de Lignes */}
        <div className="form-section">
          <h3>Ajouter des Produits/Services</h3>
          <div className="add-ligne-section">
            <div className="form-grid">
              <div className="form-group">
                <label>Produit/Service</label>
                <select 
                  value={selectedProduit} 
                  onChange={(e) => setSelectedProduit(e.target.value)}
                >
                  <option value="">Sélectionnez un produit</option>
                  {produits.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.nom} - {prod.prix} DNT
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Quantité</label>
                <input 
                  type="number" 
                  min="1" 
                  value={quantite}
                  onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                />
              </div>

              <div className="form-group">
                <label>Prix Unitaire (DNT)</label>
                <input 
                  type="number" 
                  min="0" 
                  step="0.01"
                  value={prixUnitaire}
                  onChange={(e) => setPrixUnitaire(parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>&nbsp;</label>
                <button 
                  type="button" 
                  className="add-btn"
                  onClick={ajouterLigne}
                  disabled={!selectedProduit}
                >
                  + Ajouter la Ligne
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section Lignes de Facture */}
        {formData.lignes.length > 0 && (
          <div className="form-section">
            <h3>Lignes de Facture</h3>
            <div className="lignes-facture">
              <table className="lignes-table">
                <thead>
                  <tr>
                    <th>Produit/Service</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>TVA</th>
                    <th>Total Ligne</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lignes.map(ligne => (
                    <tr key={ligne.id}>
                      <td>{ligne.nom}</td>
                      <td>
                        <input 
                          type="number" 
                          min="1"
                          value={ligne.quantite}
                          onChange={(e) => modifierLigne(ligne.id, 'quantite', parseInt(e.target.value) || 1)}
                          className="quantite-input"
                        />
                      </td>
                      <td>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={ligne.prix_unitaire}
                          onChange={(e) => modifierLigne(ligne.id, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                          className="prix-input"
                        /> DNT
                      </td>
                      <td>{ligne.taux_tva}%</td>
                      <td className="col-total">{ligne.total_ligne.toFixed(2)} DNT</td>
                      <td>
                        <button 
                          type="button"
                          className="action-btn delete"
                          onClick={() => supprimerLigne(ligne.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section Totaux */}
        {formData.lignes.length > 0 && (
          <div className="form-section">
            <h3>Totaux</h3>
            <div className="totaux-section">
              <div className="total-item">
                <span>Total HT:</span>
                <span>{totaux.totalHT.toFixed(2)} DNT</span>
              </div>
              <div className="total-item">
                <span>Total TVA:</span>
                <span>{totaux.totalTVA.toFixed(2)} DNT</span>
              </div>
              <div className="total-item grand-total">
                <span>Total TTC:</span>
                <span>{totaux.totalTTC.toFixed(2)} DNT</span>
              </div>
            </div>
          </div>
        )}

        {/* Section Notes */}
        <div className="form-section">
          <h3>Notes & Conditions</h3>
          <div className="form-group full-width">
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes internes, conditions particulières, informations de paiement..."
              rows="4"
            />
          </div>
        </div>

        {/* Actions du formulaire */}
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/factures')}
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={formData.lignes.length === 0 || !formData.client_id}
          >
            {isEdit ? 'Modifier la Facture' : 'Créer la Facture'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FactureForm;