import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BNavbar, Container, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { 
  FaBars, 
  FaBell, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [notifications] = useState([
    { id: 1, message: 'Nouvelle commande #1234', time: 'Il y a 5 min' },
    { id: 2, message: 'Facture #5678 payée', time: 'Il y a 1 heure' },
    { id: 3, message: 'Stock faible pour produit XYZ', time: 'Il y a 2 heures' },
  ]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <BNavbar bg="white" className="shadow-sm px-3 py-2" style={{ height: '60px' }}>
      <Container fluid>
        {/* Bouton toggle sidebar */}
        <button 
          className="btn btn-link text-dark p-0 me-3"
          onClick={toggleSidebar}
          style={{ fontSize: '1.5rem' }}
        >
          <FaBars />
        </button>

        {/* Logo et titre */}
        <BNavbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary">
          Gestion Commerciale
        </BNavbar.Brand>

        {/* Navigation droite */}
        <Nav className="ms-auto align-items-center">
          {/* Toggle thème */}
          <Nav.Link onClick={toggleTheme} className="me-2">
            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
          </Nav.Link>

          {/* Notifications */}
          <NavDropdown
            title={
              <span className="position-relative">
                <FaBell size={18} />
                <Badge 
                  bg="danger" 
                  pill 
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: '0.6rem' }}
                >
                  {notifications.length}
                </Badge>
              </span>
            }
            id="notifications-dropdown"
            align="end"
            className="me-2"
          >
            <NavDropdown.Header>Notifications</NavDropdown.Header>
            {notifications.map((notif) => (
              <NavDropdown.Item key={notif.id}>
                <div>
                  <small className="fw-bold">{notif.message}</small>
                  <br />
                  <small className="text-muted">{notif.time}</small>
                </div>
              </NavDropdown.Item>
            ))}
            <NavDropdown.Divider />
            <NavDropdown.Item className="text-center text-primary">
              Voir tout
            </NavDropdown.Item>
          </NavDropdown>

          {/* Menu utilisateur */}
          <NavDropdown
            title={
              <span>
                <FaUser className="me-2" />
                {user?.nom || 'Utilisateur'}
              </span>
            }
            id="user-dropdown"
            align="end"
          >
            <NavDropdown.Header>
              <div className="text-center">
                <strong>{user?.nom} {user?.prenom}</strong>
                <br />
                <small className="text-muted">{user?.email}</small>
              </div>
            </NavDropdown.Header>
            <NavDropdown.Divider />
            <NavDropdown.Item as={Link} to="/profile">
              <FaUser className="me-2" />
              Mon profil
            </NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/settings">
              <FaCog className="me-2" />
              Paramètres
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout} className="text-danger">
              <FaSignOutAlt className="me-2" />
              Déconnexion
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </BNavbar>
  );
};

export default Navbar;