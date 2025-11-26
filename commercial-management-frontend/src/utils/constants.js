// Statuts des commandes
export const COMMANDE_STATUS = {
    EN_ATTENTE: 'en_attente',
    VALIDEE: 'validee',
    EN_PREPARATION: 'en_preparation',
    EXPEDIEE: 'expediee',
    LIVREE: 'livree',
    ANNULEE: 'annulee',
  };
  
  export const COMMANDE_STATUS_LABELS = {
    [COMMANDE_STATUS.EN_ATTENTE]: 'En attente',
    [COMMANDE_STATUS.VALIDEE]: 'Validée',
    [COMMANDE_STATUS.EN_PREPARATION]: 'En préparation',
    [COMMANDE_STATUS.EXPEDIEE]: 'Expédiée',
    [COMMANDE_STATUS.LIVREE]: 'Livrée',
    [COMMANDE_STATUS.ANNULEE]: 'Annulée',
  };
  
  export const COMMANDE_STATUS_COLORS = {
    [COMMANDE_STATUS.EN_ATTENTE]: 'warning',
    [COMMANDE_STATUS.VALIDEE]: 'info',
    [COMMANDE_STATUS.EN_PREPARATION]: 'primary',
    [COMMANDE_STATUS.EXPEDIEE]: 'secondary',
    [COMMANDE_STATUS.LIVREE]: 'success',
    [COMMANDE_STATUS.ANNULEE]: 'danger',
  };
  
  // Statuts des factures
  export const FACTURE_STATUS = {
    BROUILLON: 'brouillon',
    ENVOYEE: 'envoyee',
    PAYEE: 'payee',
    EN_RETARD: 'en_retard',
    ANNULEE: 'annulee',
  };
  
  export const FACTURE_STATUS_LABELS = {
    [FACTURE_STATUS.BROUILLON]: 'Brouillon',
    [FACTURE_STATUS.ENVOYEE]: 'Envoyée',
    [FACTURE_STATUS.PAYEE]: 'Payée',
    [FACTURE_STATUS.EN_RETARD]: 'En retard',
    [FACTURE_STATUS.ANNULEE]: 'Annulée',
  };
  
  export const FACTURE_STATUS_COLORS = {
    [FACTURE_STATUS.BROUILLON]: 'secondary',
    [FACTURE_STATUS.ENVOYEE]: 'info',
    [FACTURE_STATUS.PAYEE]: 'success',
    [FACTURE_STATUS.EN_RETARD]: 'danger',
    [FACTURE_STATUS.ANNULEE]: 'dark',
  };
  
  // Statuts des dossiers
  export const DOSSIER_STATUS = {
    NOUVEAU: 'nouveau',
    EN_COURS: 'en_cours',
    EN_ATTENTE: 'en_attente',
    TERMINE: 'termine',
    ARCHIVE: 'archive',
  };
  
  export const DOSSIER_STATUS_LABELS = {
    [DOSSIER_STATUS.NOUVEAU]: 'Nouveau',
    [DOSSIER_STATUS.EN_COURS]: 'En cours',
    [DOSSIER_STATUS.EN_ATTENTE]: 'En attente',
    [DOSSIER_STATUS.TERMINE]: 'Terminé',
    [DOSSIER_STATUS.ARCHIVE]: 'Archivé',
  };
  
  export const DOSSIER_STATUS_COLORS = {
    [DOSSIER_STATUS.NOUVEAU]: 'info',
    [DOSSIER_STATUS.EN_COURS]: 'primary',
    [DOSSIER_STATUS.EN_ATTENTE]: 'warning',
    [DOSSIER_STATUS.TERMINE]: 'success',
    [DOSSIER_STATUS.ARCHIVE]: 'secondary',
  };
  
  // Rôles utilisateurs
  export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    VENDEUR: 'vendeur',
    COMPTABLE: 'comptable',
    USER: 'user',
  };
  
  export const USER_ROLES_LABELS = {
    [USER_ROLES.ADMIN]: 'Administrateur',
    [USER_ROLES.MANAGER]: 'Manager',
    [USER_ROLES.VENDEUR]: 'Vendeur',
    [USER_ROLES.COMPTABLE]: 'Comptable',
    [USER_ROLES.USER]: 'Utilisateur',
  };
  
  // Méthodes de paiement
  export const PAYMENT_METHODS = {
    ESPECES: 'especes',
    CHEQUE: 'cheque',
    VIREMENT: 'virement',
    CARTE: 'carte',
    AUTRE: 'autre',
  };
  
  export const PAYMENT_METHODS_LABELS = {
    [PAYMENT_METHODS.ESPECES]: 'Espèces',
    [PAYMENT_METHODS.CHEQUE]: 'Chèque',
    [PAYMENT_METHODS.VIREMENT]: 'Virement bancaire',
    [PAYMENT_METHODS.CARTE]: 'Carte bancaire',
    [PAYMENT_METHODS.AUTRE]: 'Autre',
  };
  
  // Types de documents
  export const DOCUMENT_TYPES = {
    PDF: 'pdf',
    IMAGE: 'image',
    EXCEL: 'excel',
    WORD: 'word',
    AUTRE: 'autre',
  };
  
  // Pagination
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    LIMITS: [10, 25, 50, 100],
  };
  
  // Formats d'export
  export const EXPORT_FORMATS = {
    CSV: 'csv',
    EXCEL: 'xlsx',
    PDF: 'pdf',
  };
  
  // Messages
  export const MESSAGES = {
    SUCCESS: {
      CREATE: 'Élément créé avec succès',
      UPDATE: 'Élément modifié avec succès',
      DELETE: 'Élément supprimé avec succès',
      SAVE: 'Enregistré avec succès',
    },
    ERROR: {
      GENERIC: 'Une erreur est survenue',
      NETWORK: 'Erreur de connexion au serveur',
      NOT_FOUND: 'Élément non trouvé',
      UNAUTHORIZED: 'Vous n\'êtes pas autorisé',
      VALIDATION: 'Erreur de validation des données',
    },
    CONFIRM: {
      DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
      CANCEL: 'Êtes-vous sûr de vouloir annuler ?',
      LOGOUT: 'Êtes-vous sûr de vouloir vous déconnecter ?',
    },
  };
  
  // Regex de validation
  export const REGEX = {
    EMAIL: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    PHONE: /^(\+216)?[0-9]{8}$/,
    POSTAL_CODE: /^[0-9]{4}$/,
    URL: /^https?:\/\/.+/,
  };
  
  // Limites
  export const LIMITS = {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_IMAGE_SIZE: 2 * 1024 * 1024, // 2MB
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 50,
  };