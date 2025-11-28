import * as yup from 'yup';

// Schémas de validation avec Yup

// Validation pour la connexion
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email invalide')
    .required('L\'email est requis'),
  password: yup
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .required('Le mot de passe est requis'),
});

// Validation pour l'inscription
export const registerSchema = yup.object().shape({
  nom: yup
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  prenom: yup
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Le prénom est requis'),
  email: yup
    .string()
    .email('Email invalide')
    .required('L\'email est requis'),
  telephone: yup
    .string()
    .matches(/^(\+216)?[0-9]{8}$/, 'Numéro de téléphone invalide')
    .required('Le téléphone est requis'),
  password: yup
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    )
    .required('Le mot de passe est requis'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});

// Validation pour un client
export const clientSchema = yup.object().shape({
  nom: yup
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  email: yup
    .string()
    .email('Email invalide')
    .required('L\'email est requis'),
  telephone: yup
    .string()
    .matches(/^(\+216)?[0-9]{8}$/, 'Numéro de téléphone invalide')
    .required('Le téléphone est requis'),
  adresse: yup
    .string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .required('L\'adresse est requise'),
  ville: yup
    .string()
    .required('La ville est requise'),
  codePostal: yup
    .string()
    .matches(/^[0-9]{4}$/, 'Code postal invalide')
    .required('Le code postal est requis'),
});

// Validation pour un fournisseur
export const fournisseurSchema = yup.object().shape({
  nom: yup
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  email: yup
    .string()
    .email('Email invalide')
    .required('L\'email est requis'),
  telephone: yup
    .string()
    .matches(/^(\+216)?[0-9]{8}$/, 'Numéro de téléphone invalide')
    .required('Le téléphone est requis'),
  adresse: yup
    .string()
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .required('L\'adresse est requise'),
  matriculeFiscale: yup
    .string()
    .required('Le matricule fiscal est requis'),
});

// Validation pour un produit
export const produitSchema = yup.object().shape({
  nom: yup
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  reference: yup
    .string()
    .required('La référence est requise'),
  prix: yup
    .number()
    .positive('Le prix doit être positif')
    .required('Le prix est requis'),
  quantite: yup
    .number()
    .integer('La quantité doit être un nombre entier')
    .min(0, 'La quantité ne peut pas être négative')
    .required('La quantité est requise'),
  categorie: yup
    .string()
    .required('La catégorie est requise'),
  description: yup
    .string()
    .max(500, 'La description ne doit pas dépasser 500 caractères'),
});

// Validation pour une commande
export const commandeSchema = yup.object().shape({
  clientId: yup
    .number()
    .required('Le client est requis'),
  dateCommande: yup
    .date()
    .required('La date de commande est requise'),
  dateLivraison: yup
    .date()
    .min(yup.ref('dateCommande'), 'La date de livraison doit être après la date de commande'),
  produits: yup
    .array()
    .of(
      yup.object().shape({
        produitId: yup.number().required(),
        quantite: yup.number().positive().integer().required(),
        prixUnitaire: yup.number().positive().required(),
      })
    )
    .min(1, 'Au moins un produit est requis'),
  remise: yup
    .number()
    .min(0, 'La remise ne peut pas être négative')
    .max(100, 'La remise ne peut pas dépasser 100%'),
});

// Validation pour une facture
export const factureSchema = yup.object().shape({
  clientId: yup
    .number()
    .required('Le client est requis'),
  commandeId: yup
    .number()
    .required('La commande est requise'),
  dateFacture: yup
    .date()
    .required('La date de facture est requise'),
  dateEcheance: yup
    .date()
    .min(yup.ref('dateFacture'), 'La date d\'échéance doit être après la date de facture')
    .required('La date d\'échéance est requise'),
  montantHT: yup
    .number()
    .positive('Le montant HT doit être positif')
    .required('Le montant HT est requis'),
  tauxTVA: yup
    .number()
    .min(0, 'Le taux de TVA ne peut pas être négatif')
    .max(100, 'Le taux de TVA ne peut pas dépasser 100%')
    .required('Le taux de TVA est requis'),
});

// Validation pour un dossier
export const dossierSchema = yup.object().shape({
  titre: yup
    .string()
    .min(3, 'Le titre doit contenir au moins 3 caractères')
    .required('Le titre est requis'),
  description: yup
    .string()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .required('La description est requise'),
  clientId: yup
    .number()
    .required('Le client est requis'),
  dateDebut: yup
    .date()
    .required('La date de début est requise'),
  dateFin: yup
    .date()
    .min(yup.ref('dateDebut'), 'La date de fin doit être après la date de début'),
  budget: yup
    .number()
    .positive('Le budget doit être positif'),
});

// Validation pour un utilisateur
export const userSchema = yup.object().shape({
  nom: yup
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .required('Le nom est requis'),
  prenom: yup
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .required('Le prénom est requis'),
  email: yup
    .string()
    .email('Email invalide')
    .required('L\'email est requis'),
  telephone: yup
    .string()
    .matches(/^(\+216)?[0-9]{8}$/, 'Numéro de téléphone invalide')
    .required('Le téléphone est requis'),
  role: yup
    .string()
    .required('Le rôle est requis'),
});

// Validation pour changement de mot de passe
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Le mot de passe actuel est requis'),
  newPassword: yup
    .string()
    .min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
    )
    .notOneOf([yup.ref('currentPassword')], 'Le nouveau mot de passe doit être différent')
    .required('Le nouveau mot de passe est requis'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
    .required('La confirmation du mot de passe est requise'),
});