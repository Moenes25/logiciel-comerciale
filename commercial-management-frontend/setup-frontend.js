const fs = require('fs');
const path = require('path');

const structure = {
  src: {
    components: {
      common: ['Navbar.jsx','Sidebar.jsx','Footer.jsx','Loader.jsx','Modal.jsx','Table.jsx','Card.jsx','Alert.jsx'],
      auth: ['Login.jsx','Register.jsx','PrivateRoute.jsx'],
      dashboard: ['Dashboard.jsx','StatsCard.jsx','RecentActivities.jsx'],
      users: ['UserList.jsx','UserForm.jsx','UserDetails.jsx'],
      clients: ['ClientList.jsx','ClientForm.jsx','ClientDetails.jsx'],
      fournisseurs: ['FournisseurList.jsx','FournisseurForm.jsx','FournisseurDetails.jsx'],
      produits: ['ProduitList.jsx','ProduitForm.jsx','ProduitDetails.jsx'],
      commandes: ['CommandeList.jsx','CommandeForm.jsx','CommandeDetails.jsx'],
      factures: ['FactureList.jsx','FactureForm.jsx','FactureDetails.jsx','FacturePrint.jsx'],
      dossiers: ['DossierList.jsx','DossierForm.jsx','DossierDetails.jsx']
    },
    services: ['api.js','authService.js','userService.js','clientService.js','fournisseurService.js','produitService.js','commandeService.js','factureService.js','dossierService.js'],
    context: ['AuthContext.jsx','ThemeContext.jsx'],
    hooks: ['useAuth.js','useFetch.js','useDebounce.js'],
    utils: ['constants.js','helpers.js','validators.js','formatters.js'],
    routes: ['AppRoutes.jsx'],
    styles: ['custom.css','variables.css'],
    'App.jsx': null,
    'index.jsx': null,
    'setupTests.js': null
  },
  public: {
    assets: ['favicon.ico'],
    images: []
  }
};

function createStructure(base, obj) {
  Object.keys(obj).forEach(key => {
    const fullPath = path.join(base, key);
    if (Array.isArray(obj[key])) {
      fs.mkdirSync(fullPath, { recursive: true });
      obj[key].forEach(file => fs.writeFileSync(path.join(fullPath, file), ''));
    } else if (obj[key] === null) {
      fs.writeFileSync(fullPath, '');
    } else {
      fs.mkdirSync(fullPath, { recursive: true });
      createStructure(fullPath, obj[key]);
    }
  });
}

createStructure(process.cwd(), structure);

console.log('✅ Frontend structure created successfully!');
