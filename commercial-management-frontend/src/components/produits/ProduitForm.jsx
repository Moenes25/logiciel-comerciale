// ProduitForm.jsx — Tailwind responsive + animé (même logique/données)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import produitService from "../../services/produitService";

export default function ProduitForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const location = useLocation();

  const backToList = () => navigate(location.state?.from ?? "/dashboard/produits");

  // ⭐ si on arrive de "Commander", on aura ça :
  const initialFournisseurId = location.state?.fournisseurId || "";

  const [formData, setFormData] = useState({
    nom: "",
    reference: "",
    categorie: "",
    prix: 0,
    prixAchat: 0,
    stock: 0,
    stockMin: 0,
    fournisseur: initialFournisseurId, // ⭐ pré-sélectionné
    description: "",
    statut: "En stock",
    tva: 20,
    unite: "pièce",
    codeBarre: "",
    poids: 0,
    dimensions: "",
    marque: "",
    modele: "",
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [error, setError] = useState("");

  // Données pour les sélecteurs
  const categories = ["Informatique", "Mobile", "Audio", "Périphériques", "Bureautique", "Électroménager"];
  const statuts = ["En stock", "Stock faible", "Rupture", "En commande"];
  const unites = ["pièce", "kg", "litre", "mètre", "paquet", "carton"];

  /* ---------- Fetch fournisseurs ---------- */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://logiciel-commercial-backend-production.up.railway.app/api/fournisseurs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setFournisseurs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur chargement fournisseurs:", err);
      }
    })();
  }, []);

  /* ---------- Fetch produit (édition) ---------- */
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const response = await produitService.getById(id);
        const produit = response.data;
        setFormData({
          nom: produit.designation,
          reference: produit.reference,
          categorie: produit.categorie,
          prix: produit.prixVente,
          prixAchat: produit.prixAchat,
          stock: produit.stock?.quantite || 0,
          stockMin: produit.stock?.stockMin || 0,
          fournisseur: produit.fournisseur?._id || "",
          description: produit.description || "",
          statut: produit.statut || "En stock",
          tva: produit.tva ?? 20,
          unite: produit.unite || "pièce",
          codeBarre: produit.codeBarre || "",
          poids: produit.poids || 0,
          dimensions: produit.dimensions || "",
          marque: produit.marque || "",
          modele: produit.modele || "",
        });
      } catch (err) {
        console.error("Erreur chargement produit :", err);
        setError("Impossible de charger le produit.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  /* ---------- Handlers ---------- */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const calculateMarge = () => {
    const pa = Number(formData.prixAchat) || 0;
    const pv = Number(formData.prix) || 0;
    if (!pa) return "0.0";
    return (((pv - pa) / pa) * 100).toFixed(1);
  };

  const calculateValeurStock = () => {
    const pa = Number(formData.prixAchat) || 0;
    const q = Number(formData.stock) || 0;
    return (pa * q).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    // générer une référence si vide
    const reference = (formData.reference || "").trim() || `PROD-${Date.now()}`;

    const payload = {
      designation: formData.nom,
      reference,
      categorie: formData.categorie,
      prixAchat: Number(formData.prixAchat) || 0,
      prixVente: Number(formData.prix) || 0,
      tva: Number(formData.tva) || 0,
      unite: formData.unite,
      stock: {
        quantite: Number(formData.stock) || 0,
        stockMin: Number(formData.stockMin) || 0,
      },
      fournisseur: formData.fournisseur || undefined,
      description: formData.description || "",
      codeBarre: formData.codeBarre || "",
      actif: true,
      image: "",
      marque: formData.marque || "",
      modele: formData.modele || "",
      poids: Number(formData.poids) || 0,
      dimensions: formData.dimensions || "",
      dateCreation: new Date(),
      statut: formData.statut,
    };

    try {
      let result;
      const token = localStorage.getItem("token");
      if (isEdit) {
        result = await produitService.update(id, payload);
      } else {
        result = await produitService.create(payload);
        // ⭐ Si un fournisseur est sélectionné → augmenter commandesEnCours
        if (formData.fournisseur) {
          await fetch(
            `https://logiciel-commercial-backend-production.up.railway.app/api/fournisseurs/${formData.fournisseur}/increment-commandes`,
            { method: "PUT", headers: { "Content-Type": "application/json",Authorization: `Bearer ${token}` } }
          );
        }
      }

      if (result.success) {
        alert(`Produit ${isEdit ? "modifié" : "créé"} avec succès !`);
        navigate("/dashboard/produits")
      } else {
        throw new Error(result.message || "Erreur serveur");
      }
    } catch (err) {
      console.error(err);
      setError(`Erreur lors de la ${isEdit ? "modification" : "création"} du produit.`);
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
          <span className="text-sm text-neutral-600">Chargement des données produit…</span>
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
              {isEdit ? "Modifier Produit" : "Nouveau Produit"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
              {isEdit ? "Modifiez les informations du produit" : "Ajoutez un nouveau produit à votre catalogue"}
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

        <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
          {/* Section: base */}
          <Section title="📋 Informations de Base">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Nom du produit *">
                <Input
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Ex: Ordinateur Portable Pro"
                  required
                />
              </Field>

              <Field label="Référence *">
                <Input
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Ex: PROD-001"
                  autoComplete="off"
                  required
                />
              </Field>

              <Field label="Catégorie *">
                <Select name="categorie" value={formData.categorie} onChange={handleChange} required>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Fournisseur">
                <Select name="fournisseur" value={formData.fournisseur} onChange={handleChange}>
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map((f) => (
                    <option key={f._id} value={f._id}>{f.raisonSociale}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Statut *">
                <Select name="statut" value={formData.statut} onChange={handleChange} required>
                  {statuts.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Code-barres">
                <Input name="codeBarre" value={formData.codeBarre} onChange={handleChange} placeholder="1234567890123" />
              </Field>
            </div>
          </Section>

          {/* Section: prix & stocks */}
          <Section title="💰 Prix et Stocks">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Prix d'achat (€) *">
                <Input type="number" step="0.01" min="0" name="prixAchat" value={formData.prixAchat} onChange={handleChange} required />
              </Field>

              <Field label="Prix de vente  (€) *">
                <Input type="number" step="0.01" min="0" name="prix" value={formData.prix} onChange={handleChange} required />
              </Field>

              <Field label="TVA (%)">
                <Select name="tva" value={formData.tva} onChange={handleChange}>
                  <option value="0">0%</option>
                  <option value="5.5">5.5%</option>
                  <option value="10">10%</option>
                  <option value="20">20%</option>
                </Select>
              </Field>

              <Field label="Marge brute">
                <Input value={`${calculateMarge()}%`} disabled />
              </Field>

              <Field label="Stock actuel">
                <Input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} />
              </Field>

              <Field label="Stock minimum">
                <Input type="number" min="0" name="stockMin" value={formData.stockMin} onChange={handleChange} />
              </Field>

              <Field label="Unité">
                <Select name="unite" value={formData.unite} onChange={handleChange}>
                  {unites.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Valeur du stock">
                <Input value={`${calculateValeurStock()} €`} disabled />
              </Field>
            </div>
          </Section>

          {/* Section: caractéristiques */}
          <Section title="⚙️ Caractéristiques Techniques">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Marque">
                <Input name="marque" value={formData.marque} onChange={handleChange} placeholder="Ex: Dell, Apple, Samsung" />
              </Field>
              <Field label="Modèle">
                <Input name="modele" value={formData.modele} onChange={handleChange} placeholder="Ex: XPS 15, iPhone 14" />
              </Field>
              <Field label="Poids (kg)">
                <Input type="number" step="0.01" min="0" name="poids" value={formData.poids} onChange={handleChange} placeholder="0.00" />
              </Field>
              <Field label="Dimensions">
                <Input name="dimensions" value={formData.dimensions} onChange={handleChange} placeholder="Ex: 36 x 25 x 2 cm" />
              </Field>
            </div>
          </Section>

          {/* Section: description */}
          <Section title="📝 Description">
            <div className="grid grid-cols-1">
              <Field label="Description détaillée">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Description complète du produit, caractéristiques, avantages…"
                />
              </Field>
            </div>
          </Section>

          {/* Résumé */}
          <Section title="📊 Résumé">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryItem label="Prix d'achat HT" value={`${(formData.prixAchat ?? 0).toFixed(2)} €`} />
              <SummaryItem label="Prix de vente HT" value={`${(formData.prix ?? 0).toFixed(2)} €`} />
              <SummaryItem label="Marge brute" value={`${calculateMarge()}%`} highlight />
              <SummaryItem label="Valeur du stock" value={`${calculateValeurStock()} €`} />
            </div>
          </Section>

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
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <span className="size-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />}
              {isEdit ? "💾 Modifier Produit" : "➕ Créer Produit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- petits composants UI ---------- */
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

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 ${props.className || ""}`}
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
