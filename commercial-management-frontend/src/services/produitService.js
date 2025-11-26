import api from './api';

const produitService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/produits', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/produits/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },


  create: async (produitData) => {
    try {
      const response = await api.post('/produits', produitData); 
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || error.message };
    }
  },

 
  update: async (id, produitData) => {
    try {
      const response = await api.put(`/produits/${id}`, produitData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data || error.message };
    }
  },

  delete: async (id) => {
    try {
      await api.delete(`/produits/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  search: async (query) => {
    try {
      const response = await api.get('/produits/search', { params: { q: query } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getCategories: async () => {
    try {
      const response = await api.get('/produits/categories');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get(`/produits/category/${categoryId}`, { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOutOfStock: async () => {
    try {
      const response = await api.get('/produits/out-of-stock');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getLowStock: async (threshold = 10) => {
    try {
      const response = await api.get('/produits/low-stock', { params: { threshold } });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateStock: async (id, quantity, operation = 'add') => {
    try {
      const response = await api.patch(`/produits/${id}/stock`, { quantity, operation });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // ⚠️ Upload image = multipart OK
  uploadImage: async (id, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await api.post(`/produits/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default produitService;
