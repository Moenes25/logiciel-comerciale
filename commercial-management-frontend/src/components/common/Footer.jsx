import React from 'react';
import { Container } from 'react-bootstrap';
import { FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-3 mt-auto">
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center">
          <p className="mb-0 text-muted small">
            © {new Date().getFullYear()} Gestion Commerciale. Tous droits réservés.
          </p>
          <p className="mb-0 text-muted small">
            Fait avec <FaHeart className="text-danger mx-1" /> par votre équipe
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;