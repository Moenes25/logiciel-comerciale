// Fonctions utilitaires

// Télécharger un fichier blob
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };
  
  // Formater un nombre avec séparateurs de milliers
  export const formatNumber = (number) => {
    return new Intl.NumberFormat('fr-TN').format(number);
  };
  
  // Formater une devise
  export const formatCurrency = (amount, currency = 'TND') => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  // Formater une date
  export const formatDate = (date, format = 'short') => {
    if (!date) return '';
    
    const options = {
      short: { year: 'numeric', month: '2-digit', day: '2-digit' },
      long: { year: 'numeric', month: 'long', day: 'numeric' },
      time: { hour: '2-digit', minute: '2-digit' },
      full: { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      },
    };
  
    return new Intl.DateTimeFormat('fr-TN', options[format]).format(new Date(date));
  };
  
  // Calculer le nombre de jours entre deux dates
  export const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Vérifier si une date est passée
  export const isPastDate = (date) => {
    return new Date(date) < new Date();
  };
  
  // Générer un numéro unique
  export const generateUniqueNumber = (prefix = '') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}${timestamp}${random}`;
  };
  
  // Capitaliser la première lettre
  export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };
  
  // Tronquer un texte
  export const truncate = (str, length = 50) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  };
  
  // Obtenir les initiales d'un nom
  export const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Générer une couleur aléatoire
  export const getRandomColor = () => {
    const colors = [
      '#007bff', '#6c757d', '#28a745', '#dc3545', 
      '#ffc107', '#17a2b8', '#6f42c1', '#e83e8c'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  // Valider un email
  export const isValidEmail = (email) => {
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return regex.test(email);
  };
  
  // Valider un numéro de téléphone tunisien
  export const isValidPhone = (phone) => {
    const regex = /^(\+216)?[0-9]{8}$/;
    return regex.test(phone);
  };
  
  // Calculer le pourcentage
  export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(2);
  };
  
  // Calculer la TVA
  export const calculateTVA = (amount, rate = 19) => {
    return (amount * rate) / 100;
  };
  
  // Calculer le total TTC
  export const calculateTTC = (amountHT, tvaRate = 19) => {
    return amountHT + calculateTVA(amountHT, tvaRate);
  };
  
  // Calculer le montant HT depuis TTC
  export const calculateHT = (amountTTC, tvaRate = 19) => {
    return amountTTC / (1 + tvaRate / 100);
  };
  
  // Grouper un tableau par clé
  export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) {
        result[group] = [];
      }
      result[group].push(item);
      return result;
    }, {});
  };
  
  // Trier un tableau d'objets
  export const sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      if (order === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });
  };
  
  // Filtrer les doublons d'un tableau
  export const uniqueBy = (array, key) => {
    return [...new Map(array.map(item => [item[key], item])).values()];
  };
  
  // Vérifier si un objet est vide
  export const isEmpty = (obj) => {
    return Object.keys(obj).length === 0;
  };
  
  // Deep clone d'un objet
  export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
  };
  
  // Générer un slug à partir d'un texte
  export const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  };
  
  // Obtenir l'extension d'un fichier
  export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  };
  
  // Formater la taille d'un fichier
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };
  
  // Générer une couleur basée sur un hash de string
  export const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };
  
  // Delay/Sleep function
  export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };