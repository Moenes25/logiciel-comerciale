import api from './api';

const fournisseurService = {
  // Récupérer tous les fournisseurs
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/fournisseurs', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer un fournisseur par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/fournisseurs/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Créer un nouveau fournisseur
  create: async (fournisseurData) => {
    try {
      const response = await api.post('/fournisseurs', fournisseurData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Mettre à jour un fournisseur
  update: async (id, fournisseurData) => {
    try {
      const response = await api.put(`/fournisseurs/${id}`, fournisseurData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Supprimer un fournisseur
  delete: async (id) => {
    try {
      await api.delete(`/fournisseurs/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Rechercher des fournisseurs
  search: async (query) => {
    try {
      const response = await api.get('/fournisseurs/search', { params: { q: query } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les produits d'un fournisseur
  getProduits: async (id, params = {}) => {
    try {
      const response = await api.get(`/fournisseurs/${id}/produits`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les statistiques d'un fournisseur
  getStats: async (id) => {
    try {
      const response = await api.get(`/fournisseurs/${id}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Évaluer un fournisseur
  rate: async (id, rating, comment) => {
    try {
      const response = await api.post(`/fournisseurs/${id}/rate`, { rating, comment });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Exporter les fournisseurs
  export: async (format = 'csv') => {
    try {
      const response = await api.get(`/fournisseurs/export/${format}`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

export default fournisseurService;