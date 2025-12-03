import { format, parseISO, formatDistance, formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';
import numeral from 'numeral';

// Configuration de numeral pour le français
numeral.register('locale', 'fr', {
  delimiters: {
    thousands: ' ',
    decimal: ',',
  },
  abbreviations: {
    thousand: 'k',
    million: 'M',
    billion: 'Md',
    trillion: 'T',
  },
  currency: {
    symbol: 'TND',
  },
});

numeral.locale('fr');

// ===== FORMATAGE DES DATES =====

export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return format(parsedDate, formatString, { locale: fr });
  } catch (error) {
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
};

export const formatDateLong = (date) => {
  return formatDate(date, 'dd MMMM yyyy');
};

export const formatDateTimeLong = (date) => {
  return formatDate(date, 'dd MMMM yyyy à HH:mm');
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(parsedDate, new Date(), { 
      addSuffix: true,
      locale: fr 
    });
  } catch (error) {
    return '';
  }
};

export const formatRelativeDate = (date) => {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return formatRelative(parsedDate, new Date(), { locale: fr });
  } catch (error) {
    return '';
  }
};

// ===== FORMATAGE DES NOMBRES =====

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '0';
  return numeral(value).format('0,0');
};

export const formatDecimal = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0';
  const format = decimals === 2 ? '0,0.00' : `0,0.${'0'.repeat(decimals)}`;
  return numeral(value).format(format);
};

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0%';
  const format = decimals === 2 ? '0,0.00%' : `0,0.${'0'.repeat(decimals)}%`;
  return numeral(value / 100).format(format);
};

// ===== FORMATAGE DES DEVISES =====

export const formatCurrency = (value, currency = 'TND') => {
  if (value === null || value === undefined) return '0,00 TND';
  return `${numeral(value).format('0,0.00')} ${currency}`;
};

export const formatCurrencyCompact = (value, currency = 'TND') => {
  if (value === null || value === undefined) return '0 TND';
  if (value >= 1000000) {
    return `${numeral(value).format('0.0a')} ${currency}`;
  }
  return formatCurrency(value, currency);
};

// ===== FORMATAGE DES TAILLES DE FICHIERS =====

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// ===== FORMATAGE DES TÉLÉPHONES =====

export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater pour le format tunisien: XX XXX XXX
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Avec indicatif: +216 XX XXX XXX
  if (cleaned.length === 11 && cleaned.startsWith('216')) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
  }
  
  return phone;
};

// ===== FORMATAGE DES STATUTS =====

export const formatStatus = (status) => {
  if (!status) return '';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// ===== FORMATAGE DES NOMS =====

export const formatFullName = (firstName, lastName) => {
  if (!firstName && !lastName) return '';
  if (!firstName) return lastName;
  if (!lastName) return firstName;
  return `${firstName} ${lastName}`;
};

export const formatInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

// ===== FORMATAGE DES ADRESSES =====

export const formatAddress = (address, city, postalCode, country = 'Tunisie') => {
  const parts = [address, postalCode, city, country].filter(Boolean);
  return parts.join(', ');
};

// ===== FORMATAGE DES RÉFÉRENCES =====

export const formatReference = (type, number, year) => {
  const paddedNumber = String(number).padStart(5, '0');
  return `${type}-${year}-${paddedNumber}`;
};

// Exemple: formatReference('FAC', 123, 2025) => "FAC-2025-00123"

export const formatInvoiceNumber = (number, year = new Date().getFullYear()) => {
  return formatReference('FAC', number, year);
};

export const formatOrderNumber = (number, year = new Date().getFullYear()) => {
  return formatReference('CMD', number, year);
};

// ===== FORMATAGE DES LISTES =====

export const formatList = (items, separator = ', ', lastSeparator = ' et ') => {
  if (!items || items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(lastSeparator);
  
  const allButLast = items.slice(0, -1).join(separator);
  const last = items[items.length - 1];
  return `${allButLast}${lastSeparator}${last}`;
};

// ===== PARSING =====

export const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  
  // Remplacer les espaces et virgules
  const cleaned = String(value).replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? 0 : parsed;
};

export const parseCurrency = (value) => {
  return parseNumber(value);
};