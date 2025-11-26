import api from './api';


const commandeService = {
  // Récupérer toutes les commandes
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/commandes', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer une commande par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/commandes/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Créer une nouvelle commande
  create: async (commandeData) => {
    try {
      const response = await api.post('/commandes', commandeData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Mettre à jour une commande
  update: async (id, commandeData) => {
    try {
      const response = await api.put(`/commandes/${id}`, commandeData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Supprimer une commande
  delete: async (id) => {
    try {
      await api.delete(`/commandes/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Changer le statut d'une commande
  changeStatus: async (id, status) => {
    try {
      const response = await api.patch(`/commandes/${id}/status`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Valider une commande
  validate: async (id) => {
    try {
      const response = await api.post(`/commandes/${id}/validate`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Annuler une commande
  cancel: async (id, reason) => {
    try {
      const response = await api.post(`/commandes/${id}/cancel`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Marquer comme livrée
  markAsDelivered: async (id) => {
    try {
      const response = await api.post(`/commandes/${id}/delivered`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les statistiques des commandes
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/commandes/stats', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Générer une facture depuis une commande
  generateFacture: async (id) => {
    try {
      const response = await api.post(`/commandes/${id}/generate-facture`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Exporter les commandes
  export: async (format = 'csv', params = {}) => {
    try {
      const response = await api.get(`/commandes/export/${format}`, {
        params,
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

export default commandeService;