import api from './api';

const livraisonService = {

  // 🟦 Récupérer toutes les livraisons
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/livraisons', { params });

      // backend = { success: true, data: [...] }
      return {
        success: response.data.success,
        data: response.data.data
      };

    } catch (error) {
      console.error("Erreur getAll:", error);
      return { success: false, data: [] };
    }
  },

  // 🟦 Récupérer une livraison par ID
  getById: async (id) => {
  try {
    const response = await api.get(`/livraisons/${id}`);
    return response.data.data;   // <-- retourne uniquement l’objet livraison !
  } catch (error) {
    return null;
  }
},


  // 🟩 Créer une livraison
  create: async (livraisonData) => {
    try {
      const response = await api.post('/livraisons', livraisonData);

      return {
        success: response.data.success,
        data: response.data.data
      };

    } catch (error) {
      console.error("Erreur create:", error);
      return { success: false, data: null };
    }
  },

  update: async (id, livraisonData) => {
    try {
      const response = await api.put(`/livraisons/${id}`, livraisonData);

      return {
        success: response.data.success,
        data: response.data.data
      };

    } catch (error) {
      console.error("Erreur update:", error);
      return { success: false, data: null };
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/livraisons/${id}`);
      return { success: true };

    } catch (error) {
      console.error("Erreur delete:", error);
      return { success: false };
    }
  }
};

export default livraisonService;
