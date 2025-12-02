import api from './api';

const dossierService = {
  // Récupérer tous les dossiers
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/dossiers', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer un dossier par ID
  getById: async (id) => {
    try {
      const response = await api.get(`/dossiers/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Créer un nouveau dossier
  create: async (dossierData) => {
    try {
      const response = await api.post('/dossiers', dossierData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Mettre à jour un dossier
  update: async (id, dossierData) => {
    try {
      const response = await api.put(`/dossiers/${id}`, dossierData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Supprimer un dossier
  delete: async (id) => {
    try {
      await api.delete(`/dossiers/${id}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Changer le statut d'un dossier
  changeStatus: async (id, status) => {
    try {
      const response = await api.patch(`/dossiers/${id}/status`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Ajouter un document à un dossier
  addDocument: async (id, documentFile, documentData) => {
    try {
      const formData = new FormData();
      formData.append('document', documentFile);
      Object.keys(documentData).forEach(key => {
        formData.append(key, documentData[key]);
      });

      const response = await api.post(`/dossiers/${id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les documents d'un dossier
  getDocuments: async (id) => {
    try {
      const response = await api.get(`/dossiers/${id}/documents`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Supprimer un document
  deleteDocument: async (dossierId, documentId) => {
    try {
      await api.delete(`/dossiers/${dossierId}/documents/${documentId}`);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Télécharger un document
  downloadDocument: async (dossierId, documentId) => {
    try {
      const response = await api.get(`/dossiers/${dossierId}/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer la timeline d'un dossier
  getTimeline: async (id) => {
    try {
      const response = await api.get(`/dossiers/${id}/timeline`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Ajouter une note à un dossier
  addNote: async (id, noteData) => {
    try {
      const response = await api.post(`/dossiers/${id}/notes`, noteData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Récupérer les statistiques des dossiers
  getStats: async (params = {}) => {
    try {
      const response = await api.get('/dossiers/stats', { params });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Archiver un dossier
  archive: async (id) => {
    try {
      const response = await api.post(`/dossiers/${id}/archive`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Restaurer un dossier archivé
  restore: async (id) => {
    try {
      const response = await api.post(`/dossiers/${id}/restore`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Exporter les dossiers
  export: async (format = 'csv', params = {}) => {
    try {
      const response = await api.get(`/dossiers/export/${format}`, {
        params,
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

export default dossierService;