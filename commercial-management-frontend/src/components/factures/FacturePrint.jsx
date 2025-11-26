import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Factures1.css';

const FacturePrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [facture, setFacture] = useState(null);
  const [loading, setLoading] = useState(true);

  // Données mockées pour la démonstration
  useEffect(() => {
    const mockFacture = {
      id: parseInt(id),
      numero: 'FAC-2024-001',
      date_facture: '2024-01-15',
      date_echeance: '2024-01-30',
      statut: 'en_attente',
      conditions_paiement: '30 jours fin de mois',
      notes: 'Merci pour votre confiance. Paiement à effectuer par virement bancaire.',
      
      client: {
        nom: 'Dupont Industries',
        adresse: '123 Rue de Paris',
        code_postal: '75001',
        ville: 'Paris',
        pays: 'France',
        email: 'contact@dupont.com',
        telephone: '+33 1 23 45 67 89',
        siret: '123 456 789 00012'
      },
      
      entreprise: {
        nom: 'VOTRE ENTREPRISE SARL',
        adresse: '456 Avenue des Entreprises',
        code_postal: '75002',
        ville: 'Paris',
        pays: 'France',
        siret: '987 654 321 00034',
        tva: 'FR12345678901',
        telephone: '+33 1 98 76 54 32',
        email: 'contact@votre-entreprise.com',
        site_web: 'www.votre-entreprise.com'
      },
      
      lignes: [
        {
          id: 1,
          nom: 'Ordinateur Portable Pro',
          description: 'Intel i7, 16GB RAM, 512GB SSD',
          quantite: 1,
          prix_unitaire: 1200.00,
          taux_tva: 20,
          total_ligne: 1200.00
        },
        {
          id: 2,
          nom: 'Support Technique Premium',
          description: 'Assistance 24/7 pendant 1 an',
          quantite: 1,
          prix_unitaire: 299.99,
          taux_tva: 20,
          total_ligne: 299.99
        },
        {
          id: 3,
          nom: 'Installation et Configuration',
          description: 'Sur site',
          quantite: 2,
          prix_unitaire: 150.00,
          taux_tva: 20,
          total_ligne: 300.00
        }
      ],
      
      totaux: {
        total_ht: 1799.99,
        total_tva: 360.00,
        total_ttc: 2159.99
      }
    };

    setFacture(mockFacture);
    setLoading(false);
  }, [id]);

  const imprimerFacture = () => {
    window.print();
  };

  const getStatutLabel = (statut) => {
    const labels = {
      brouillon: 'Brouillon',
      en_attente: 'En attente de paiement',
      payee: 'Payée',
      annulee: 'Annulée'
    };
    return labels[statut] || statut;
  };

  const getStatutColor = (statut) => {
    const colors = {
      brouillon: '#6b7280',
      en_attente: '#f59e0b',
      payee: '#10b981',
      annulee: '#ef4444'
    };
    return colors[statut] || '#6b7280';
  };

  if (loading) {
    return <div className="loading">Chargement de la facture...</div>;
  }

  if (!facture) {
    return <div className="error">Facture non trouvée</div>;
  }

  return (
    <div className="factures-container">
      {/* Header avec actions */}
      <div className="factures-header no-print">
        <div className="header-left">
          <h1>Facture {facture.numero}</h1>
          <p>Visualisation et impression</p>
        </div>
        <div className="header-right">
          <button 
            className="back-btn"
            onClick={() => navigate('/factures')}
          >
            ← Retour
          </button>
          <button 
            className="action-btn primary"
            onClick={imprimerFacture}
          >
            🖨️ Imprimer
          </button>
          <button className="action-btn pdf">
            📄 Télécharger PDF
          </button>
        </div>
      </div>

      {/* Contenu de la facture */}
      <div className="facture-print-container">
        {/* En-tête de la facture */}
        <div className="facture-entete">
          <div className="entete-grid">
            <div className="entreprise-info">
              <h1>{facture.entreprise.nom}</h1>
              <p>{facture.entreprise.adresse}</p>
              <p>{facture.entreprise.code_postal} {facture.entreprise.ville}</p>
              <p>{facture.entreprise.pays}</p>
              <p>Tél: {facture.entreprise.telephone}</p>
              <p>Email: {facture.entreprise.email}</p>
              <p>SIRET: {facture.entreprise.siret}</p>
              <p>TVA: {facture.entreprise.tva}</p>
            </div>

            <div className="facture-info">
              <div className="facture-titre">
                <h2>FACTURE</h2>
                <div 
                  className="statut-badge"
                  style={{ backgroundColor: getStatutColor(facture.statut) }}
                >
                  {getStatutLabel(facture.statut)}
                </div>
              </div>
              <div className="facture-details">
                <p><strong>N°:</strong> {facture.numero}</p>
                <p><strong>Date:</strong> {facture.date_facture}</p>
                <p><strong>Échéance:</strong> {facture.date_echeance}</p>
                <p><strong>Conditions:</strong> {facture.conditions_paiement}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations client */}
        <div className="client-section">
          <h3>CLIENT</h3>
          <div className="client-info">
            <p><strong>{facture.client.nom}</strong></p>
            <p>{facture.client.adresse}</p>
            <p>{facture.client.code_postal} {facture.client.ville}</p>
            <p>{facture.client.pays}</p>
            <p>Tél: {facture.client.telephone}</p>
            <p>Email: {facture.client.email}</p>
            {facture.client.siret && <p>SIRET: {facture.client.siret}</p>}
          </div>
        </div>

        {/* Lignes de facture */}
        <div className="lignes-facture">
          <table className="lignes-table">
            <thead>
              <tr>
                <th className="col-description">Description</th>
                <th className="col-quantite">Qté</th>
                <th className="col-pu">Prix Unitaire</th>
                <th className="col-tva">TVA</th>
                <th className="col-total">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {facture.lignes.map(ligne => (
                <tr key={ligne.id}>
                  <td className="col-description">
                    <div className="produit-nom">{ligne.nom}</div>
                    {ligne.description && (
                      <div className="produit-description">{ligne.description}</div>
                    )}
                  </td>
                  <td className="col-quantite">{ligne.quantite}</td>
                  <td className="col-pu">{ligne.prix_unitaire.toFixed(2)} €</td>
                  <td className="col-tva">{ligne.taux_tva}%</td>
                  <td className="col-total">{ligne.total_ligne.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="totaux-section">
          <div className="totaux-grid">
            <div className="totaux-labels">
              <p>Total HT:</p>
              <p>TVA (20%):</p>
              <p className="total-ttc">Total TTC:</p>
            </div>
            <div className="totaux-montants">
              <p>{facture.totaux.total_ht.toFixed(2)} €</p>
              <p>{facture.totaux.total_tva.toFixed(2)} €</p>
              <p className="total-ttc">{facture.totaux.total_ttc.toFixed(2)} €</p>
            </div>
          </div>
        </div>

        {/* Notes et conditions */}
        {facture.notes && (
          <div className="notes-section">
            <h3>NOTES</h3>
            <div className="notes-content">
              {facture.notes}
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="pied-page">
          <div className="mentions-legales">
            <p><strong>Mentions légales:</strong> TVA non applicable, article 293 B du CGI</p>
            <p><strong>Escompte:</strong> Aucun escompte pour paiement anticipé</p>
            <p><strong>Pénalités de retard:</strong> Conformément à l'article L. 441-10 du code de commerce, 
            toute somme non payée à la date d'exigibilité produira de plein droit des intérêts de retard 
            au taux égal à celui appliqué par la Banque Centrale Européenne à son opération de refinancement 
            la plus récente majoré de 10 points de pourcentage.</p>
          </div>
          <div className="signature">
            <p>Fait à {facture.entreprise.ville}, le {facture.date_facture}</p>
            <div className="signature-ligne"></div>
            <p>Signature</p>
          </div>
        </div>
      </div>

      {/* Actions en bas (non imprimables) */}
      <div className="facture-actions-panel no-print">
        <div className="actions-grid">
          <button className="action-btn primary" onClick={imprimerFacture}>
            🖨️ Imprimer la Facture
          </button>
          <button className="action-btn pdf">
            📄 Générer PDF
          </button>
          <button className="action-btn email">
            📧 Envoyer par Email
          </button>
          <button className="action-btn edit" onClick={() => navigate(`/factures/${id}/modifier`)}>
            ✏️ Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacturePrint;