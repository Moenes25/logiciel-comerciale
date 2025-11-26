import React from 'react';
import { Alert as BAlert } from 'react-bootstrap';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimesCircle 
} from 'react-icons/fa';

const Alert = ({ 
  variant = 'info', 
  message, 
  dismissible = false, 
  onClose,
  show = true,
  className = '',
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <FaCheckCircle className="me-2" />;
      case 'danger':
        return <FaTimesCircle className="me-2" />;
      case 'warning':
        return <FaExclamationTriangle className="me-2" />;
      case 'info':
      default:
        return <FaInfoCircle className="me-2" />;
    }
  };

  if (!show) return null;

  return (
    <BAlert 
      variant={variant} 
      dismissible={dismissible} 
      onClose={onClose}
      className={`d-flex align-items-center ${className}`}
    >
      {getIcon()}
      <span>{message}</span>
    </BAlert>
  );
};

export default Alert;