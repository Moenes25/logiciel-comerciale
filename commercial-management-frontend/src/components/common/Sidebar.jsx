import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaUserTie, 
  FaTruck,
  FaBoxes,
  FaShoppingCart,
  FaFileInvoice,
  FaFolder,
  FaWarehouse
} from 'react-icons/fa';

const Sidebar = ({ collapsed }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: FaTachometerAlt,
      label: 'Dashboard',
    },
    {
      path: '/users',
      icon: FaUsers,
      label: 'Utilisateurs',
    },
    {
      path: '/clients',
      icon: FaUserTie,
      label: 'Clients',
    },
    {
      path: '/fournisseurs',
      icon: FaTruck,
      label: 'Fournisseurs',
    },
    {
      path: '/produits',
      icon: FaBoxes,
      label: 'Produits',
    },
    {
      path: '/stock', 
      icon: FaWarehouse, 
      label: 'Stock', 
    },
    {
      path: '/commandes',
      icon: FaShoppingCart,
      label: 'Commandes',
    },
    {
      path: '/factures',
      icon: FaFileInvoice,
      label: 'Factures',
    },
    {
      path: '/dossiers',
      icon: FaFolder,
      label: 'Dossiers',
    },
  ];

  // AJOUTEZ CE CODE POUR DEBUGGER
  const handleClick = (path, label) => {
    console.log('🎯 CLICK sur menu:', label, 'Path:', path);
    console.log('📍 URL actuelle:', window.location.href);
  };

  return (
    <div 
      className={`sidebar bg-dark text-white ${collapsed ? 'collapsed' : ''}`}
      style={{
        width: collapsed ? '70px' : '260px',
        height: 'calc(100vh - 60px)',
        position: 'fixed',
        top: '60px',
        left: 0,
        overflowY: 'auto',
        transition: 'width 0.3s ease',
        zIndex: 1000,
      }}
    >
      <nav className="py-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item d-flex align-items-center px-3 py-3 text-white text-decoration-none ${
                isActive ? 'active bg-primary' : ''
              }`
            }
            style={{ transition: 'all 0.3s' }}
            onClick={() => handleClick(item.path, item.label)}
          >
            <item.icon size={20} className="me-3" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* AJOUTEZ CE BOUTON DE TEST */}
      <div className="p-3 border-top">
        <button 
          className="btn btn-warning w-100"
          onClick={() => {
            console.log('🧪 TEST: Navigation manuelle vers /commandes');
            window.location.href = '/commandes';
          }}
        >
          🧪 Test Commandes
        </button>
      </div>

      <style jsx>{`
        .sidebar-item:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .sidebar-item.active {
          border-left: 4px solid #ffc107;
        }
        .sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: #212529;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: #495057;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;