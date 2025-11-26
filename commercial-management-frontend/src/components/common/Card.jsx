import React from 'react';
import { Card as BsCard } from 'react-bootstrap';

/**
 * Composant Card réutilisable
 * Wrapper du composant Card de react-bootstrap,
 * permettant d’utiliser <Card><Card.Body>...</Card.Body></Card>
 * dans toute la plateforme.
 */

const Card = ({ children, className = '', ...rest }) => {
  return (
    <BsCard className={`shadow-sm mb-3 ${className}`} {...rest}>
      {children}
    </BsCard>
  );
};

// Sous-composant : Card.Body
Card.Body = ({ children, className = '', ...rest }) => {
  return (
    <BsCard.Body className={className} {...rest}>
      {children}
    </BsCard.Body>
  );
};

// Sous-composant : Card.Header
Card.Header = ({ children, className = '', ...rest }) => {
  return (
    <BsCard.Header className={`fw-bold ${className}`} {...rest}>
      {children}
    </BsCard.Header>
  );
};

// Sous-composant : Card.Footer
Card.Footer = ({ children, className = '', ...rest }) => {
  return (
    <BsCard.Footer className={`text-muted ${className}`} {...rest}>
      {children}
    </BsCard.Footer>
  );
};

export default Card;
