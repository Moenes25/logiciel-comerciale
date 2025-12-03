// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";

// Auth
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";

// Layout + page d’accueil dashboard
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./components/dashboard/Dashboard"; // page “home” du dashboard

// Users
import UserList from "./components/users/UserList";
import UserForm from "./components/users/UserForm";
import UserDetails from "./components/users/UserDetails";

// Clients
import ClientList from "./components/clients/ClientList";
import ClientForm from "./components/clients/ClientForm";
import ClientDetails from "./components/clients/ClientDetails";

// Produits
import ProduitList from "./components/produits/ProduitList";
import ProduitForm from "./components/produits/ProduitForm";
import ProduitDetails from "./components/produits/ProduitDetails";

// Dossiers
import DossierList from "./components/dossiers/DossierList";
import DossierForm from "./components/dossiers/DossierForm";
import DossierDetails from "./components/dossiers/DossierDetails";

// Fournisseurs
import FournisseurList from "./components/fournisseurs/FournisseurList";
import FournisseurForm from "./components/fournisseurs/FournisseurForm";
import FournisseurDetails from "./components/fournisseurs/FournisseurDetails";

// Factures
import FactureList from "./components/factures/FactureList";
import FactureForm from "./components/factures/FactureForm";
import FactureDetails from "./components/factures/FactureDetails";

// Commandes
import CommandeList from "./components/commandes/CommandeList";
import CommandeForm from "./components/commandes/CommandeForm";
import CommandeDetails from "./components/commandes/CommandeDetails";

// Livraisons
import LivraisonList from "./components/livraisons/LivraisonList";
import LivraisonForm from "./components/livraisons/LivraisonForm";
import LivraisonDetails from "./components/livraisons/LivraisonDetails";

// Stock
import StockList from "./components/stock/StockList";
import StockForm from "./components/stock/StockForm"; 
import StockDetails from "./components/stock/StockDetails";


// Paramètres
import Parametres from "./components/parametres/Parametres";

import "./App.css";

function TailwindTest() {
  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900 p-6">
      <h1 className="text-2xl font-bold">Tailwind OK ✅</h1>
      <button className="mt-4 inline-flex items-center rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-100 transition">
        Bouton stylé
      </button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ===== PUBLIQUES ===== */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ===== PRIVEES : LAYOUT PERSISTANT ===== */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            {/* index = page d’accueil du dashboard */}
            <Route index element={<Dashboard />} />

            {/* ===== MODULES IMBRIQUÉS (chemins RELATIFS) ===== */}
            {/* Users */}
            <Route path="users" element={<UserList />} />
            <Route path="users/nouveau" element={<UserForm />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="users/:id/modifier" element={<UserForm />} />

            {/* Clients */}
            <Route path="clients" element={<ClientList />} />
            <Route path="clients/nouveau" element={<ClientForm />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="clients/:id/modifier" element={<ClientForm />} />

            {/* Produits */}
            <Route path="produits" element={<ProduitList />} />
            <Route path="produits/nouveau" element={<ProduitForm />} />
            <Route path="produits/:id" element={<ProduitDetails />} />
            <Route path="produits/:id/modifier" element={<ProduitForm />} />

            {/* Dossiers */}
            <Route path="dossiers" element={<DossierList />} />
            <Route path="dossiers/nouveau" element={<DossierForm />} />
            <Route path="dossiers/:id" element={<DossierDetails />} />
            <Route path="dossiers/:id/modifier" element={<DossierForm />} />

            {/* Fournisseurs */}
            <Route path="fournisseurs" element={<FournisseurList />} />
            <Route path="fournisseurs/nouveau" element={<FournisseurForm />} />
            <Route path="fournisseurs/:id" element={<FournisseurDetails />} />
            <Route path="fournisseurs/:id/modifier" element={<FournisseurForm />} />

            {/* Factures */}
            <Route path="factures" element={<FactureList />} />
            <Route path="factures/nouveau" element={<FactureForm />} />
            <Route path="factures/:id" element={<FactureDetails />} />
            <Route path="factures/:id/modifier" element={<FactureForm />} />

            {/* Commandes */}
            <Route path="commandes" element={<CommandeList />} />
            <Route path="commandes/nouveau" element={<CommandeForm />} />
            <Route path="commandes/:id" element={<CommandeDetails />} />
            <Route path="commandes/:id/modifier" element={<CommandeForm />} />

            {/* Livraisons */}
            <Route path="livraisons" element={<LivraisonList />} />
            <Route path="livraisons/nouveau" element={<LivraisonForm />} />
            <Route path="livraisons/:id" element={<LivraisonDetails />} />
            <Route path="livraisons/:id/modifier" element={<LivraisonForm />} />


            {/*Stock*/}
            <Route path="stock" element={<StockList />} />
            <Route path="stock/nouveau" element={<StockForm />} />            
            <Route path="stock/:id" element={<StockDetails />} />
            <Route path="stock/:id/modifier" element={<StockForm />} />

            {/* Paramètres */}
            <Route path="parametres" element={<Parametres />} />
          </Route>

          {/* ===== REDIRECTIONS ===== */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

          {/* Test Tailwind (hors layout) */}
          <Route path="/tailwind-test" element={<TailwindTest />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
