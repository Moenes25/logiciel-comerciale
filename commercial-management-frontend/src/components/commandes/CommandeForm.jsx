// CommandeForm.jsx — Tailwind responsive + animé (même logique/données)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clientService from "../../services/clientService";
import produitService from "../../services/produitService";
import commandeService from "../../services/commandeService";

export default function CommandeForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
 // formatage simple
const fmt = (n) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const [formData, setFormData] = useState({
    client: "",
    dateCommande: new Date().toISOString().split("T")[0],
    dateLivraison: "",
    statut: "En traitement",
    notes: "",
    remiseGlobale: 0,
    produits: [],
  });

  const [nouveauProduit, setNouveauProduit] = useState({
    code: "",
    designation: "",
    quantite: 1,
    prixHT: 0,
    remise: 0,
    tva: 20,
  });

  const [clients, setClients] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(isEdit);

  // --- Chargements initiaux (clients + produits) ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsRes, produitsRes] = await Promise.all([
          clientService.getAll(),
          produitService.getAll(),
        ]);
        setClients(clientsRes.success ? clientsRes.data : []);
        setProduits(produitsRes.success ? produitsRes.data : []);
        if (!isEdit) setLoading(false);
      } catch (err) {
        console.error("Erreur chargement:", err);
        setLoading(false);
      }
    };
    loadData();
  }, [isEdit]);

  const mapStatut = {
    "En traitement": "en_cours",
    "Confirmée": "confirmee",
    "Expédiée": "expediee",
    "Livrée": "livree",
    "Annulée": "annulee",
    "Brouillon": "brouillon",
  };

  // --- Chargement commande si edition ---
  useEffect(() => {
    const loadCommande = async () => {
      if (!isEdit) {
        setLoading(false);
        return;
      }
      try {
        const res = await commandeService.getById(id);
        if (res.success) {
          const cmd = res.data;
          setFormData({
            client: cmd.client?._id || "",
            dateCommande: cmd.dateCommande?.split("T")[0],
            dateLivraison: cmd.dateLivraison?.split("T")[0] || "",
            statut: Object.keys(mapStatut).find((k) => mapStatut[k] === cmd.statut) || "En traitement",
            notes: cmd.notes || "",
            remiseGlobale: cmd.remiseGlobale || 0,
            produits: cmd.lignes.map((ligne) => ({
              id: ligne._id,
              produitId: ligne.produit?._id,
              code: ligne.produit?.reference,
              designation: ligne.produit?.designation,
              quantite: ligne.quantite,
              prixHT: ligne.prixUnitaire,
              remise: ligne.remise,
              tva: ligne.tva,
            })),
          });
        }
      } catch (err) {
        console.error("Erreur serveur :", err);
      } finally {
        setLoading(false);
      }
    };
    loadCommande();
  }, [isEdit, id]);

  // --------- Calculs par ligne ----------
  const calculerMontantHTBrut = (p) => p.prixHT * p.quantite;
  const calculerMontantRemise = (p) => (p.prixHT * p.quantite * p.remise) / 100;
  const calculerMontantHTNet = (p) => calculerMontantHTBrut(p) - calculerMontantRemise(p);
  const calculerMontantTVA = (p) => (calculerMontantHTNet(p) * p.tva) / 100;
  const calculerMontantTTC = (p) => calculerMontantHTNet(p) + calculerMontantTVA(p);

  // --------- Calculs globaux ----------
  const calculerTotalHTBrut = () =>
    formData.produits.reduce((t, p) => t + calculerMontantHTBrut(p), 0);

  const calculerTotalRemise = () => {
    const remiseProduits = formData.produits.reduce((t, p) => t + calculerMontantRemise(p), 0);
    const remiseGlobale = (calculerTotalHTBrut() * formData.remiseGlobale) / 100;
    return remiseProduits + remiseGlobale;
  };

  const calculerTotalHTNet = () => calculerTotalHTBrut() - calculerTotalRemise();
  const calculerTotalTVA = () =>
    formData.produits.reduce((t, p) => t + calculerMontantTVA(p), 0);
  const calculerNetAPayer = () => calculerTotalHTNet() + calculerTotalTVA();

  // --------- Handlers ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProduitChange = (e) => {
    const { name, value } = e.target;
    setNouveauProduit((prev) => ({
      ...prev,
      [name]: ["quantite", "prixHT", "remise", "tva"].includes(name) ? parseFloat(value) : value,
    }));
  };

  const selectionnerProduit = (prod) => {
    setNouveauProduit({
      produitId: prod._id,
      code: prod.reference,
      designation: prod.designation,
      quantite: 1,
      prixHT: parseFloat(prod.prixVente),
      remise: 0,
      tva: parseFloat(prod.tva) || 20,
      stockActuel : prod.stock?.quantite || 0,
    });
  };

  const ajouterProduit = () => {
    const p = nouveauProduit;
    if (p.code && p.designation && p.quantite > 0 && p.prixHT > 0) {
      setFormData((prev) => ({
        ...prev,
        produits: [...prev.produits, { ...p, id: Date.now() }],
      }));
      setNouveauProduit({ code: "", designation: "", quantite: 1, prixHT: 0, remise: 0, tva: 20 });
    }
  };

  const supprimerProduit = (index) => {
    setFormData((prev) => ({
      ...prev,
      produits: prev.produits.filter((_, i) => i !== index),
    }));
  };

  const mettreAJourProduit = (index, field, value) => {
    const arr = [...formData.produits];
    arr[index] = {
      ...arr[index],
      [field]: ["quantite", "prixHT", "remise", "tva"].includes(field) ? parseFloat(value) : value,
    };
    setFormData((prev) => ({ ...prev, produits: arr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const lignes = formData.produits.map((p) => ({
      produit: p.produitId,
      designation: p.designation,
      quantite: Number(p.quantite),
      prixUnitaire: Number(p.prixHT),
      remise: Number(p.remise),
      tva: Number(p.tva),
    }));

    const commandeData = {
      client: formData.client,
      dateCommande: formData.dateCommande,
      dateLivraison: formData.dateLivraison,
      statut: mapStatut[formData.statut],
      notes: formData.notes,
      remiseGlobale: formData.remiseGlobale,
      lignes,
      totaux: {
        totalHT: calculerTotalHTNet(),
        totalTVA: calculerTotalTVA(),
        totalTTC: calculerNetAPayer(),
      },
    };

    let res;
    if (isEdit) {
      res = await commandeService.update(id, commandeData);
    } else {
      res = await commandeService.create({
        ...commandeData,
        numero: `CMD-${Date.now()}`,
        type: "vente",
      });
    }

    if (!res.success) {
      alert("Erreur backend : " + res.message);
      return;
    }

    alert(isEdit ? "Commande modifiée !" : "Commande créée !");
    navigate("/dashboard/commandes")
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">Chargement des données commande…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              {isEdit ? "Modifier Commande" : "Nouvelle Commande"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
              {isEdit ? "Modifiez les informations de la commande" : "Créez une nouvelle commande client"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            
            <button
              form="commande-form"
              type="submit"
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
            >
              {isEdit ? "Sauvegarder" : "Créer"}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <form id="commande-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Infos de base */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm animate-[pop_.2s_ease]">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Informations de Base</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-neutral-600">Client *</label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.nom} {c.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-600">Date de commande *</label>
                <input
                  type="date"
                  name="dateCommande"
                  value={formData.dateCommande}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-600">Date de livraison prévue</label>
                <input
                  type="date"
                  name="dateLivraison"
                  value={formData.dateLivraison}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-600">Statut *</label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500/30"
                >
                  {["En traitement", "Confirmée", "Expédiée", "Livrée", "Annulée", "Brouillon"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-neutral-600">Remise globale (%)</label>
                <input
                  type="number"
                  name="remiseGlobale"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.remiseGlobale}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>
          </section>

          {/* Section: Produits */}
          <section className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Produits de la Commande</h3>

              {/* Sélection rapide */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-neutral-600 mb-2">Produits disponibles</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {produits.map((p) => {
                    const stock = p.stock?.quantite || 0;
                    const stockMin = p.stock?.stockMin || 0;
                    
                    // Déterminer la couleur en fonction du stock
                    let stockClass = "bg-emerald-100 text-emerald-700";
                    if (stock === 0) {
                      stockClass = "bg-rose-100 text-rose-700";
                    } else if (stock <= stockMin) {
                      stockClass = "bg-amber-100 text-amber-700";
                    }
                  return(
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => selectionnerProduit(p)}
                      className="group w-full text-left rounded-xl border bg-white px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition flex items-center gap-3"
                      title="Sélectionner"
                    >
                      <span className="inline-flex items-center justify-center size-8 rounded-lg bg-neutral-100">
                        📦
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium truncate">{p.designation}</span>
                        <span className="block text-[11px] text-neutral-500 truncate">
                          {p.reference} • {(p.prixVente ?? 0).toFixed(2)} DNT HT
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ml-2 ${stockClass}`}>
                          Stock: {stock}
                        </span>
                      </span>
                    </button>
                  )
               })}
                </div>
              </div>

              {/* Ajout manuel d’un produit */}
              <div className="rounded-xl border bg-neutral-50 p-4">
                <h4 className="text-xs font-semibold text-neutral-700 mb-2">Ajouter un produit</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div>
                    <label className="text-xs text-neutral-600">Code</label>
                    <input
                      name="code"
                      value={nouveauProduit.code}
                      onChange={handleProduitChange}
                      placeholder="Code"
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-2">
                    <label className="text-xs text-neutral-600">Désignation</label>
                    <input
                      name="designation"
                      value={nouveauProduit.designation}
                      onChange={handleProduitChange}
                      placeholder="Désignation du produit"
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600">Quantité</label>
                    <input
                      type="number"
                      name="quantite"
                      min="1"
                      max={nouveauProduit.stockActuel || 9999}
                      value={nouveauProduit.quantite}
                      onChange={handleProduitChange}
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    {nouveauProduit.stockActuel !== undefined && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                nouveauProduit.quantite > nouveauProduit.stockActuel 
                                  ? "bg-rose-100 text-rose-700 border border-rose-200" 
                                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                              }`}>
                                Stock: {nouveauProduit.stockActuel}
                              </span>
                            </div>
                          )}

                  </div>
                  <div>
                  <label className="text-xs text-neutral-600">Stock actuel</label>
                  <input
                    type="number"
                    min="0"
                    name="stockActuel"
                    value={nouveauProduit.stockActuel}
                    onChange={handleProduitChange}
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                   </div>
                  <div>
                    <label className="text-xs text-neutral-600">Prix U. HT (DNT)</label>
                    <input
                      type="number"
                      name="prixHT"
                      min="0"
                      step="0.01"
                      value={nouveauProduit.prixHT}
                      onChange={handleProduitChange}
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600">Remise (%)</label>
                    <input
                      type="number"
                      name="remise"
                      min="0"
                      max="100"
                      step="0.1"
                      value={nouveauProduit.remise}
                      onChange={handleProduitChange}
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600">TVA (%)</label>
                    <select
                      name="tva"
                      value={nouveauProduit.tva}
                      onChange={handleProduitChange}
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="5.5">0%</option>
                      <option value="10">7%</option>
                      <option value="20">19%</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={ajouterProduit}
                      className="w-full rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
                    >
                      + Ajouter
                    </button>
                  </div>
                </div>
              </div>

              {/* Tableau des lignes */}
            {/* Lignes produits */}
{formData.produits.length > 0 ? (
  <>
    {/* Mobile: cartes (lisibles, actionnables) */}
    <div className="grid gap-3 md:hidden">
      {formData.produits.map((p, idx) => (
        <div
          key={p.id ?? idx}
          className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold leading-tight truncate">{p.designation || "—"}</div>
              <div className="text-[11px] text-neutral-500">Code: {p.code || "—"}</div>
            </div>
            <button
              type="button"
              onClick={() => supprimerProduit(idx)}
              className="size-8 grid place-items-center rounded-full border text-neutral-600 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition"
              title="Supprimer"
            >🗑️</button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <label className="flex items-center gap-2 rounded-lg border px-2 py-1">
              Qté
              <input
                type="number" min="1" value={p.quantite}
                onChange={(e) => mettreAJourProduit(idx, "quantite", e.target.value)}
                className="ml-auto w-20 rounded-md border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border px-2 py-1">
              P.U. HT
              <input
                type="number" min="0" step="0.01" value={p.prixHT}
                onChange={(e) => mettreAJourProduit(idx, "prixHT", e.target.value)}
                className="ml-auto w-24 rounded-md border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border px-2 py-1">
              Remise %
              <input
                type="number" min="0" max="100" step="0.1" value={p.remise}
                onChange={(e) => mettreAJourProduit(idx, "remise", e.target.value)}
                className="ml-auto w-20 rounded-md border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border px-2 py-1">
              TVA %
              <select
                value={p.tva}
                onChange={(e) => mettreAJourProduit(idx, "tva", e.target.value)}
                className="ml-auto w-20 rounded-md border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="5.5">5.5</option>
                <option value="10">10</option>
                <option value="20">20</option>
              </select>
            </label>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border px-3 py-2">
            <span className="text-sm text-neutral-600">Montant TTC</span>
            <span className="text-base font-semibold">{fmt(calculerMontantTTC(p))} DNT</span>
          </div>
        </div>
      ))}
    </div>

    {/* Desktop: table améliorée */}
    <div className="mt-4 rounded-2xl border bg-white shadow-md ring-1 ring-black/5 overflow-hidden hidden md:block transition hover:shadow-lg hover:ring-black/10">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-neutral-50/80 backdrop-blur sticky top-0 z-10 text-neutral-600">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
              {["Code","Désignation","Qté","P.U. HT","Remise %","Montant HT","TVA %","Montant TTC","Actions"].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y">
            {formData.produits.map((p, idx) => (
              <tr key={p.id ?? idx} className="group transition hover:bg-neutral-50/70">
                <td className="px-3 py-2">
                  <input
                    value={p.code}
                    onChange={(e) => mettreAJourProduit(idx, "code", e.target.value)}
                    className="w-28 rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    value={p.designation}
                    onChange={(e) => mettreAJourProduit(idx, "designation", e.target.value)}
                    className="w-64 rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" min="1" value={p.quantite}
                    onChange={(e) => mettreAJourProduit(idx, "quantite", e.target.value)}
                    className="w-20 rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" min="0" step="0.01" value={p.prixHT}
                    onChange={(e) => mettreAJourProduit(idx, "prixHT", e.target.value)}
                    className="w-24 rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number" min="0" max="100" step="0.1" value={p.remise}
                    onChange={(e) => mettreAJourProduit(idx, "remise", e.target.value)}
                    className="w-20 rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </td>
                <td className="px-3 py-2 font-medium">{fmt(calculerMontantHTNet(p))} DNT</td>
                <td className="px-3 py-2">
                  <select
                    value={p.tva}
                    onChange={(e) => mettreAJourProduit(idx, "tva", e.target.value)}
                    className="w-20 rounded-lg border px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500/30"
                  >
                    <option value="5.5">5.5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                  </select>
                </td>
                <td className="px-3 py-2 font-semibold">{fmt(calculerMontantTTC(p))} DNT</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => supprimerProduit(idx)}
                    className="size-9 grid place-items-center rounded-full border text-neutral-600 hover:bg-rose-50 hover:text-rose-600 active:scale-[.95] transition"
                    title="Supprimer"
                  >🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={9} className="px-3 py-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border">
                    <span className="text-sm text-neutral-600">Total HT Brut</span>
                    <span className="font-semibold">{fmt(calculerTotalHTBrut())} DNT</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border">
                    <span className="text-sm text-neutral-600">
                      Remises (incl. globale {formData.remiseGlobale}%)
                    </span>
                    <span className="font-semibold text-rose-600">- {fmt(calculerTotalRemise())} DNT</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-200">
                    <span className="text-sm font-medium text-emerald-700">Net à payer</span>
                    <span className="text-lg font-extrabold text-emerald-700">{fmt(calculerNetAPayer())} DNT</span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </>
) : (
  <div className="mt-4 rounded-xl border bg-white px-4 py-6 text-center text-sm text-neutral-600">
    Aucun produit ajouté à la commande
  </div>
)}

            </div>
          </section>

          {/* Section: Notes */}
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Informations Complémentaires</h3>
            <label className="text-xs text-neutral-600">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes importantes sur la commande…"
              rows={4}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard/commandes")}
              className="rounded-lg border px-4 py-2.5 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
            >
              {isEdit ? "Modifier Commande" : "Créer Commande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
