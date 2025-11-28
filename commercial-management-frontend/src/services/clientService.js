import api from './api';

const clientService = {
  // Récupérer tous les clients
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/clients', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer un client par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/clients/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Créer un nouveau client
  create: async (clientData) => {
    try {
      const response = await api.post('/clients', clientData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Mettre à jour un client
  update: async (id, clientData) => {
    try {
      const response = await api.put(`/clients/${id}`, clientData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Supprimer un client
  delete: async (id) => {
    try {
      await api.delete(`/clients/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Rechercher des clients
  search: async (query) => {
    try {
      const response = await api.get('/clients/search', { params: { q: query } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les commandes d'un client
  getCommandes: async (id, params = {}) => {
    try {
      const response = await api.get(`/clients/${id}/commandes`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les factures d'un client
  getFactures: async (id, params = {}) => {
    try {
      const response = await api.get(`/clients/${id}/factures`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les statistiques d'un client
  getStats: async (id) => {
    try {
      const response = await api.get(`/clients/${id}/stats`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Exporter les clients (CSV, Excel, PDF)
  export: async (format = 'csv') => {
    try {
      const response = await api.get(`/clients/export/${format}`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

export default clientService;