import api from './api';

const factureService = {
  // Récupérer toutes les factures
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/factures', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer une facture par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/factures/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Créer une nouvelle facture
  create: async (factureData) => {
    try {
      const response = await api.post('/factures', factureData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Mettre à jour une facture
  update: async (id, factureData) => {
    try {
      const response = await api.put(`/factures/${id}`, factureData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Supprimer une facture
  delete: async (id) => {
    try {
      await api.delete(`/factures/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Marquer comme payée
  markAsPaid: async (id, paymentData) => {
    try {
      const response = await api.post(`/factures/${id}/pay`, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Annuler une facture
  cancel: async (id, reason) => {
    try {
      const response = await api.post(`/factures/${id}/cancel`, { reason });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Envoyer une facture par email
  sendByEmail: async (id, email) => {
    try {
      const response = await api.post(`/factures/${id}/send-email`, { email });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Télécharger le PDF d'une facture
  downloadPDF: async (id) => {
    try {
      const response = await api.get(`/factures/${id}/pdf`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Imprimer une facture
  print: async (id) => {
    try {
      const response = await api.get(`/factures/${id}/print`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les statistiques des factures
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/factures/stats', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les factures impayées
  getUnpaid: async (params = {}) => {
    try {
      const response = await api.get('/factures/unpaid', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les factures en retard
  getOverdue: async (params = {}) => {
    try {
      const response = await api.get('/factures/overdue', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Exporter les factures
  export: async (format = 'csv', params = {}) => {
    try {
      const response = await api.get(`/factures/export/${format}`, {
        params,
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

export default factureService;