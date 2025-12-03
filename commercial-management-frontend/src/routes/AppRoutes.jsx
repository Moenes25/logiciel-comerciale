import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Components
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import PrivateRoute from '../components/auth/PrivateRoute';

// Layout
import MainLayout from '../components/common/MainLayout';

// Dashboard
import Dashboard from '../components/dashboard/Dashboard';

// Users
import UserList from '../components/users/UserList';
import UserForm from '../components/users/UserForm';
import UserDetails from '../components/users/UserDetails';

// Clients
import ClientList from '../components/clients/ClientList';
import ClientForm from '../components/clients/ClientForm';
import ClientDetails from '../components/clients/ClientDetails';

// Fournisseurs
import FournisseurList from '../components/fournisseurs/FournisseurList';
import FournisseurForm from '../components/fournisseurs/FournisseurForm';
import FournisseurDetails from '../components/fournisseurs/FournisseurDetails';

// Produits
import ProduitList from '../components/produits/ProduitList';
import ProduitForm from '../components/produits/ProduitForm';
import ProduitDetails from '../components/produits/ProduitDetails';

// Commandes
import CommandeList from '../components/commandes/CommandeList';
import CommandeForm from '../components/commandes/CommandeForm';
import CommandeDetails from '../components/commandes/CommandeDetails';


// Livraisons
import LivraisonList from '../components/livraisons/LivraisonList.jsx';
import LivraisonForm from '../components/livraisons/LivraisonForm.jsx';
import LivraisonDetails from '../components/livraisons/LivraisonDetails.jsx';





// Factures
import FactureList from '../components/factures/FactureList';
import FactureForm from '../components/factures/FactureForm';
import FactureDetails from '../components/factures/FactureDetails';

// Dossiers
import DossierList from '../components/dossiers/DossierList';
import DossierForm from '../components/dossiers/DossierForm';
import DossierDetails from '../components/dossiers/DossierDetails';


//Stock
import StockList from '../components/stock/StockList';
import StockForm from '../components/stock/StockForm';
import StockDetails from '../components/stock/StockDetails';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes protégées */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Users */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id/edit" element={<UserForm />} />
          <Route path="/users/:id" element={<UserDetails />} />

          {/* Clients */}
          <Route path="/clients" element={<ClientList />} />
          <Route path="/clients/new" element={<ClientForm />} />
          <Route path="/clients/:id/edit" element={<ClientForm />} />
          <Route path="/clients/:id" element={<ClientDetails />} />

          {/* Fournisseurs */}
          <Route path="/fournisseurs" element={<FournisseurList />} />
          <Route path="/fournisseurs/new" element={<FournisseurForm />} />
          <Route path="/fournisseurs/:id/edit" element={<FournisseurForm />} />
          <Route path="/fournisseurs/:id" element={<FournisseurDetails />} />

          {/* Produits */}
          <Route path="/produits" element={<ProduitList />} />
          <Route path="/produits/new" element={<ProduitForm />} />
          <Route path="/produits/:id/edit" element={<ProduitForm />} />
          <Route path="/produits/:id" element={<ProduitDetails />} />

          {/* Commandes */}
          <Route path="/commandes" element={<CommandeList />} />
          <Route path="/commandes/new" element={<CommandeForm />} />
          <Route path="/commandes/:id/edit" element={<CommandeForm />} />
          <Route path="/commandes/:id" element={<CommandeDetails />} />

          {/* Livraisons */}
          <Route path="/livraisons" element={<LivraisonList />} />
          <Route path="/livraisons/new" element={<LivraisonForm />} />
          <Route path="/livraisons/:id/edit" element={<LivraisonForm />} />
          <Route path="/livraisons/:id" element={<LivraisonDetails />} />


          {/* Factures */}
          <Route path="/factures" element={<FactureList />} />
          <Route path="/factures/new" element={<FactureForm />} />
          <Route path="/factures/:id/edit" element={<FactureForm />} />
          <Route path="/factures/:id" element={<FactureDetails />} />

          {/* Dossiers */}
          <Route path="/dossiers" element={<DossierList />} />
          <Route path="/dossiers/new" element={<DossierForm />} />
          <Route path="/dossiers/:id/edit" element={<DossierForm />} />
          <Route path="/dossiers/:id" element={<DossierDetails />} />


          {/*Stock*/}
          <Route path="/stock" element={<StockList />} />
          <Route path="/stock/new" element={<StockForm />} />
          <Route path="/stock/:id/edit" element={<StockForm />} />
          <Route path="/stock/:id" element={<StockDetails />} />
        </Route>
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;