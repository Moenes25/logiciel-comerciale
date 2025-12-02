// StockForm.jsx — Formulaire de création/modification de stock avec sélection de produit
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

export default function StockForm() {
  const navigate = useNavigate();
  const location = useLocation();

  // Si on vient d'un produit spécifique, on pré-remplit
  const produitIdFromState = location.state?.produitId || "";
  const produitNomFromState = location.state?.produitNom || "";

  const backToList = () => navigate(location.state?.from ?? "/dashboard/produits");

  const [formData, setFormData] = useState({
    produit: produitIdFromState,
    produitNom: produitNomFromState,
    quantite: 0,
    stockMin: 0,
    stockMax: 1000,
    unite: "unité"
  });

  const [mouvementData, setMouvementData] = useState({
    type: "entree",
    quantite: 1,
    reference: "",
    motif: ""
  });

  const [produits, setProduits] = useState([]);
  const [produitSelectionne, setProduitSelectionne] = useState(null);
  const [stockExistant, setStockExistant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stockId, setStockId] = useState(null);
  const [mode, setMode] = useState("create"); // "create" ou "edit"

  const unites = ["unité", "pièce", "kg", "litre", "mètre", "paquet", "carton"];
  const typesMouvement = [
    { value: "entree", label: "Entrée stock" },
    { value: "sortie", label: "Sortie stock" },
    { value: "ajuster", label: "Ajustement" }
  ];

  /* ---------- Fetch tous les produits ---------- */
  useEffect(() => {
    fetchProduits();
  }, []);

  /* ---------- Quand le produit change, chercher son stock ---------- */
  useEffect(() => {
    if (formData.produit) {
      fetchProduitDetails();
      checkStockExistant();
    } else {
      setProduitSelectionne(null);
      setStockExistant(null);
      setStockId(null);
      setMode("create");
    }
  }, [formData.produit]);

  const fetchProduits = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://logiciel-commercial-backend-production.up.railway.app/api/produits",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProduits(response.data);
      
      // Si on a un produitIdFromState, sélectionner le produit
      if (produitIdFromState) {
        const produit = response.data.find(p => p._id === produitIdFromState);
        if (produit) {
          setProduitSelectionne(produit);
        }
      }
    } catch (err) {
      console.error("Erreur chargement produits:", err);
      setError("Impossible de charger la liste des produits.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProduitDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "https://logiciel-commercial-backend-production.up.railway.app/api"}/produits/${formData.produit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProduitSelectionne(response.data);
    } catch (err) {
      console.error("Erreur chargement produit:", err);
      setProduitSelectionne(null);
    }
  };

  const checkStockExistant = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL || "https://logiciel-commercial-backend-production.up.railway.app/api"}/stocks/produit/${formData.produit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const stock = response.data;
      setStockExistant(stock);
      setStockId(stock._id);
      setMode("edit");
      
      // Mettre à jour le formulaire avec les données existantes
      setFormData(prev => ({
        ...prev,
        quantite: stock.quantite || 0,
        stockMin: stock.stockMin || 0,
        stockMax: stock.stockMax || 1000,
        unite: stock.unite || "unité"
      }));
    } catch (err) {
      // Si 404, pas de stock existant
      if (err.response?.status === 404) {
        setStockExistant(null);
        setStockId(null);
        setMode("create");
        // Réinitialiser les valeurs par défaut
        setFormData(prev => ({
          ...prev,
          quantite: 0,
          stockMin: 0,
          stockMax: 1000,
          unite: "unité"
        }));
      }
    }
  };

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === "produit") {
      // Quand on change le produit, réinitialiser les données
      const produit = produits.find(p => p._id === value);
      setFormData(prev => ({
        ...prev,
        produit: value,
        produitNom: produit ? produit.designation : "",
        quantite: 0,
        stockMin: 0,
        stockMax: 1000,
        unite: "unité"
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
      }));
    }
  };

  const handleMouvementChange = (e) => {
    const { name, value, type } = e.target;
    setMouvementData(prev => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const calculateValeurStock = () => {
    const pa = produitSelectionne?.prixAchat || 0;
    const q = formData.quantite || 0;
    return (pa * q).toFixed(2);
  };

  const calculateValeurStockVente = () => {
    const pv = produitSelectionne?.prixVente || 0;
    const q = formData.quantite || 0;
    return (pv * q).toFixed(2);
  };

  const calculateMarge = () => {
    const pa = produitSelectionne?.prixAchat || 0;
    const pv = produitSelectionne?.prixVente || 0;
    if (!pa) return "0.0";
    return (((pv - pa) / pa) * 100).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (!formData.produit) {
      setError("Veuillez sélectionner un produit.");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let result;
      
      if (mode === "edit" && stockId) {
        // Mise à jour du stock existant
        result = await axios.put(
          `${process.env.REACT_APP_API_URL || "https://logiciel-commercial-backend-production.up.railway.app/api"}/stocks/${stockId}`,
          {
            quantite: formData.quantite,
            stockMin: formData.stockMin,
            stockMax: formData.stockMax,
            unite: formData.unite
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess("Stock mis à jour avec succès !");
      } else {
        // Création d'un nouveau stock
        result = await axios.post(
          `${process.env.REACT_APP_API_URL || "https://logiciel-commercial-backend-production.up.railway.app/api"}/stocks`,
          {
            produit: formData.produit,
            quantite: formData.quantite,
            stockMin: formData.stockMin,
            stockMax: formData.stockMax,
            unite: formData.unite
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setStockId(result.data._id);
        setMode("edit");
        setStockExistant(result.data);
        setSuccess("Stock créé avec succès !");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || `Erreur lors de la ${mode === "edit" ? "mise à jour" : "création"} du stock.`);
    } finally {
      setSaving(false);
    }
  };

  const handleMouvement = async (type) => {
    if (!stockId) {
      setError("Veuillez d'abord créer ou sélectionner un stock.");
      return;
    }

    if (mouvementData.quantite <= 0) {
      setError("La quantité doit être supérieure à 0");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      let endpoint = "";
      let payload = {};

      switch (type) {
        case "entree":
          endpoint = `/stocks/${stockId}/entree`;
          payload = {
            quantite: mouvementData.quantite,
            reference: mouvementData.reference
          };
          break;
        case "sortie":
          endpoint = `/stocks/${stockId}/sortie`;
          payload = {
            quantite: mouvementData.quantite,
            reference: mouvementData.reference
          };
          break;
        case "ajuster":
          endpoint = `/stocks/${stockId}/ajuster`;
          payload = {
            nouvelleQuantite: mouvementData.quantite,
            motif: mouvementData.motif
          };
          break;
        default:
          break;
      }

      const res = await axios.put(
        `${process.env.REACT_APP_API_URL || "https://logiciel-commercial-backend-production.up.railway.app/api"}${endpoint}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour le formulaire avec les nouvelles données
      setFormData(prev => ({
        ...prev,
        quantite: res.data.stock.quantite
      }));

      setSuccess(res.data.message || "Opération effectuée avec succès !");
      setMouvementData({
        type: "entree",
        quantite: 1,
        reference: "",
        motif: ""
      });

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Erreur lors de l'opération.");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin" />
          <span className="text-sm text-neutral-600">Chargement des produits…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:h-16 sm:py-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">
              {mode === "edit" ? "Gestion du Stock" : "Nouveau Stock"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
              {mode === "edit" && produitSelectionne 
                ? `${produitSelectionne.designation} - ${produitSelectionne.reference}`
                : "Ajoutez ou gérez le stock d'un produit"}
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <button
              type="button"
              onClick={backToList}
              className="w-full sm:w-auto rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
            >
              ← Retour aux produits
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm mt-4">
          {/* Section: Sélection du produit */}
          <Section title="📦 Sélection du Produit">


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Nom du produit *">
                <Select name="produits" value={formData.fournisseur} onChange={handleChange}>
                  <option value="">Sélectionner un Produit</option>
                  {/* {fournisseurs.map((f) => (
                    <option key={f._id} value={f._id}>{f.raisonSociale}</option>
                  ))} */}
                </Select>
              </Field>


              <Field label="Stock actuel *">
                    <Input 
                      type="number" 
                      name="quantite" 
                      value={formData.quantite} 
                      onChange={handleChange} 
                      min="0"
                      required 
                    />
                  </Field>

                  <Field label="Stock minimum">
                    <Input 
                      type="number" 
                      name="stockMin" 
                      value={formData.stockMin} 
                      onChange={handleChange} 
                      min="0" 
                    />
                  </Field>

                  <Field label="Stock maximum">
                    <Input 
                      type="number" 
                      name="stockMax" 
                      value={formData.stockMax} 
                      onChange={handleChange} 
                      min="0" 
                    />
                  </Field>

                  <Field label="Unité">
                    <Select name="unite" value={formData.unite} onChange={handleChange}>
                      {unites.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Produit *">
                <Select 
                  name="produit" 
                  value={formData.produit} 
                  onChange={handleChange} 
                  required
                >
                  <option value="">Sélectionner un produit</option>
                  {produits.map((produit) => (
                    <option key={produit._id} value={produit._id}>
                      {produit.reference} - {produit.designation}
                    </option>
                  ))}
                </Select>
              </Field>

              {produitSelectionne && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="text-sm font-medium text-blue-800">
                    {produitSelectionne.designation}
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    Catégorie: {produitSelectionne.categorie} | 
                    Prix Achat: {produitSelectionne.prixAchat}€ | 
                    Prix Vente: {produitSelectionne.prixVente}€
                  </div>
                  {stockExistant ? (
                    <div className="text-xs text-emerald-600 mt-1">
                      ✓ Stock existant ({formData.quantite} {formData.unite})
                    </div>
                  ) : (
                    <div className="text-xs text-amber-600 mt-1">
                      ⚠ Aucun stock existant pour ce produit
                    </div>
                  )}
                </div>
              )}
            </div> */}
          </Section>

          {formData.produit && (
            <>
             

              {/* Section: Mouvements rapides */}
              {mode === "edit" && stockId && (
                <Section title="⚡ Mouvements Rapides">
                  <div className="rounded-xl border border-neutral-200 p-4 bg-neutral-50">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <Field label="Type de mouvement">
                        <Select name="type" value={mouvementData.type} onChange={handleMouvementChange}>
                          {typesMouvement.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </Select>
                      </Field>

                      <Field label="Quantité">
                        <Input 
                          type="number" 
                          name="quantite" 
                          value={mouvementData.quantite} 
                          onChange={handleMouvementChange}
                          min="1" 
                        />
                      </Field>

                      <Field label={mouvementData.type === "ajuster" ? "Motif" : "Référence"}>
                        <Input 
                          name={mouvementData.type === "ajuster" ? "motif" : "reference"} 
                          value={mouvementData.type === "ajuster" ? mouvementData.motif : mouvementData.reference} 
                          onChange={handleMouvementChange}
                          placeholder={mouvementData.type === "ajuster" ? "Inventaire, correction..." : "FAC-001, CMD-002..."}
                        />
                      </Field>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => handleMouvement(mouvementData.type)}
                          disabled={saving}
                          className={`w-full py-2.5 rounded-lg font-medium text-sm ${
                            mouvementData.type === "entree" 
                              ? "bg-green-600 hover:bg-green-700 text-white" 
                              : mouvementData.type === "sortie"
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          } disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          {saving ? "..." : 
                            mouvementData.type === "entree" ? "➕ Entrée" :
                            mouvementData.type === "sortie" ? "➖ Sortie" : "📝 Ajuster"}
                        </button>
                      </div>
                    </div>
                  </div>
                </Section>
              )}

              {/* Section: Statistiques */}
              <Section title="📈 Statistiques">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <SummaryItem 
                    label="Prix d'achat HT" 
                    value={`${(produitSelectionne?.prixAchat || 0).toFixed(2)} €`} 
                  />
                  <SummaryItem 
                    label="Prix de vente HT" 
                    value={`${(produitSelectionne?.prixVente || 0).toFixed(2)} €`} 
                  />
                  <SummaryItem 
                    label="Marge brute" 
                    value={`${calculateMarge()}%`} 
                    highlight 
                  />
                  <SummaryItem 
                    label="Valeur du stock (coût)" 
                    value={`${calculateValeurStock()} €`} 
                  />
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <SummaryItem 
                    label="Valeur du stock (vente)" 
                    value={`${calculateValeurStockVente()} €`} 
                  />
                  <SummaryItem 
                    label="Quantité en stock" 
                    value={formData.quantite} 
                  />
                  <SummaryItem 
                    label="Statut" 
                    value={
                      formData.quantite <= 0 ? "🟥 Rupture" :
                      formData.quantite < formData.stockMin ? "🟨 Stock faible" :
                      formData.quantite > formData.stockMax ? "🟦 Stock élevé" : "🟢 Normal"
                    }
                    highlight={formData.quantite <= 0 || formData.quantite < formData.stockMin}
                  />
                </div>
              </Section>
            </>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={backToList}
              className="rounded-lg border px-4 py-2.5 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !formData.produit}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <span className="size-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />}
              {mode === "edit" ? "💾 Mettre à jour le Stock" : "➕ Créer le Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Composants UI ---------- */
function Section({ title, children }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-neutral-50 disabled:text-neutral-500 ${props.className || ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${props.className || ""}`}
    />
  );
}

function SummaryItem({ label, value, highlight }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`mt-0.5 ${highlight ? "text-emerald-700 font-semibold" : "font-medium"}`}>{value}</div>
    </div>
  );
}