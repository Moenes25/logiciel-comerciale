import api from './api';

export const relationService = {
  // Clients
  getClientRelations: (clientId) => 
    api.get(`/clients/${clientId}/relations`),
  
  getClientCommandes: (clientId) =>
    api.get(`/clients/${clientId}/commandes`),
  
  getClientFactures: (clientId) =>
    api.get(`/clients/${clientId}/factures`),
  
  getClientDossiers: (clientId) =>
    api.get(`/clients/${clientId}/dossiers`),

  // Produits
  getProduitRelations: (produitId) =>
    api.get(`/produits/${produitId}/relations`),
  
  getProduitCommandes: (produitId) =>
    api.get(`/produits/${produitId}/commandes`),

  // Commandes
  getCommandeRelations: (commandeId) =>
    api.get(`/commandes/${commandeId}/relations`),

  // Factures
  getFactureRelations: (factureId) =>
    api.get(`/factures/${factureId}/relations`),

  // Dossiers
  getDossierRelations: (dossierId) =>
    api.get(`/dossiers/${dossierId}/relations`)
};