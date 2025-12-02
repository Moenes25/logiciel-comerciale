// generate-frontend.js
const fs = require('fs');
const path = require('path');

const structure = {
  "public": {
    "index.html": "<!DOCTYPE html><html><head><title>Commercial Management</title></head><body><div id='root'></div></body></html>",
    "assets": {
      "images": {},
      "favicon.ico": ""
    }
  },
  "src": {
    "components": {
      "common": {
        "Navbar.jsx": "// Navbar component",
        "Sidebar.jsx": "// Sidebar component",
        "Footer.jsx": "// Footer component",
        "Loader.jsx": "// Loader component",
        "Modal.jsx": "// Modal component",
        "Table.jsx": "// Table component",
        "Card.jsx": "// Card component",
        "Alert.jsx": "// Alert component"
      },
      "auth": {
        "Login.jsx": "// Login component",
        "Register.jsx": "// Register component",
        "PrivateRoute.jsx": "// PrivateRoute component"
      },
      "dashboard": {
        "Dashboard.jsx": "// Dashboard component",
        "StatsCard.jsx": "// StatsCard component",
        "RecentActivities.jsx": "// RecentActivities component"
      },
      "users": {
        "UserList.jsx": "// UserList component",
        "UserForm.jsx": "// UserForm component",
        "UserDetails.jsx": "// UserDetails component"
      },
      "clients": {
        "ClientList.jsx": "// ClientList component",
        "ClientForm.jsx": "// ClientForm component",
        "ClientDetails.jsx": "// ClientDetails component"
      },
      "fournisseurs": {
        "FournisseurList.jsx": "// FournisseurList component",
        "FournisseurForm.jsx": "// FournisseurForm component",
        "FournisseurDetails.jsx": "// FournisseurDetails component"
      },
      "produits": {
        "ProduitList.jsx": "// ProduitList component",
        "ProduitForm.jsx": "// ProduitForm component",
        "ProduitDetails.jsx": "// ProduitDetails component"
      },
      "commandes": {
        "CommandeList.jsx": "// CommandeList component",
        "CommandeForm.jsx": "// CommandeForm component",
        "CommandeDetails.jsx": "// CommandeDetails component"
      },
      "factures": {
        "FactureList.jsx": "// FactureList component",
        "FactureForm.jsx": "// FactureForm component",
        "FactureDetails.jsx": "// FactureDetails component",
        "FacturePrint.jsx": "// FacturePrint component"
      },
      "dossiers": {
        "DossierList.jsx": "// DossierList component",
        "DossierForm.jsx": "// DossierForm component",
        "DossierDetails.jsx": "// DossierDetails component"
      }
    },
    "services": {
      "api.js": "// axios setup",
      "authService.js": "// authService",
      "userService.js": "// userService",
      "clientService.js": "// clientService",
      "fournisseurService.js": "// fournisseurService",
      "produitService.js": "// produitService",
      "commandeService.js": "// commandeService",
      "factureService.js": "// factureService",
      "dossierService.js": "// dossierService"
    },
    "context": {
      "AuthContext.jsx": "// AuthContext",
      "ThemeContext.jsx": "// ThemeContext"
    },
    "hooks": {
      "useAuth.js": "// useAuth hook",
      "useFetch.js": "// useFetch hook",
      "useDebounce.js": "// useDebounce hook"
    },
    "utils": {
      "constants.js": "// constants",
      "helpers.js": "// helpers",
      "validators.js": "// validators",
      "formatters.js": "// formatters"
    },
    "routes": {
      "AppRoutes.jsx": "// AppRoutes"
    },
    "styles": {
      "custom.css": "/* custom styles */",
      "variables.css": "/* variables */"
    },
    "App.jsx": "// App component",
    "index.jsx": "// index.js",
    "setupTests.js": "// setupTests"
  },
  "package.json": "{}",
  ".env": "",
  ".gitignore": "node_modules\n.env",
  "README.md": "# Commercial Management Frontend"
};

// Fonction récursive pour créer dossiers et fichiers
function createStructure(basePath, obj) {
  Object.keys(obj).forEach(key => {
    const fullPath = path.join(basePath, key);
    if (typeof obj[key] === 'string') {
      fs.writeFileSync(fullPath, obj[key]);
      console.log(`File created: ${fullPath}`);
    } else {
      if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
      createStructure(fullPath, obj[key]);
    }
  });
}

// Lancer la génération dans le dossier actuel
createStructure(process.cwd(), structure);
console.log('Frontend structure generated successfully!');
