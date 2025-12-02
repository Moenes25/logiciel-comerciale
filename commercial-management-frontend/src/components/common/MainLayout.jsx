import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} />

        {/* Contenu principal */}
        <main 
          className="flex-grow-1 bg-light"
          style={{
            marginLeft: sidebarCollapsed ? '70px' : '260px',
            marginTop: '60px',
            transition: 'margin-left 0.3s ease',
            minHeight: 'calc(100vh - 60px)',
          }}
        >
          <div className="container-fluid p-4">
            <Outlet />
          </div>
          
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;