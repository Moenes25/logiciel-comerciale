// authService.js
import api from './api';

const authService = {
  login: async (credentials) => {
    try {
      // credentials لازم تكون object عادي { email: '...', password: '...' }
      const response = await api.post('/auth/login', credentials);
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: { user } };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur de connexion' 
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { user } = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, data: { user } };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erreur lors de l\'inscription' 
      };
    }
  }
};

export default authService;
