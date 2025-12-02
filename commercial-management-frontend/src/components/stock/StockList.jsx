import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import './Stock1.css';

const StockList = () => {
  const navigate = useNavigate();

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [selectedStatus, setSelectedStatus] = useState("Tous");
  const [selectedFournisseur, setSelectedFournisseur] = useState("Tous");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  const categories = ["Toutes", "Informatique", "Mobile", "Audio", "Périphériques", "Bureautique"];
  const statuts = ["Tous", "En stock", "Stock faible", "Rupture", "En commande"];
  const fournisseurs = ["Tous", "TechCorp", "MobileTech", "SoundMaster", "DisplayPro", "OfficePlus"];

  // Navigation
 const handleNewProduct = () => navigate("/dashboard/produits/nouveau");
const handleViewProduct = (produit) => navigate(`/dashboard/produits/${produit._id}`);
 const handleEditProduct = (produit) => navigate(`/dashboard/produits/${produit._id}/modifier`);

  // Filtrage
  const filteredProduits = produits.filter((produit) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (produit.designation?.toLowerCase() || "").includes(q) ||
      (produit.reference?.toLowerCase() || "").includes(q) ||
      (produit.categorie?.toLowerCase() || "").includes(q);

    const matchesCategory = selectedCategory === "Toutes" || produit.categorie === selectedCategory;

    const matchesStatus =
      selectedStatus === "Tous" ||
      (selectedStatus === "En stock" && produit.stock?.quantite > produit.stock?.stockMin) ||
      (selectedStatus === "Stock faible" &&
        produit.stock?.quantite > 0 &&
        produit.stock?.quantite <= produit.stock?.stockMin) ||
      (selectedStatus === "Rupture" && produit.stock?.quantite === 0);

    const matchesFournisseur =
      selectedFournisseur === "Tous" ||
      (produit.fournisseur && produit.fournisseur.raisonSociale === selectedFournisseur);

    return matchesSearch && matchesCategory && matchesStatus && matchesFournisseur;
  });

  // Utils
  const getStockStatus = (stock, stockMin) => {
    if (stock === 0) return { status: "rupture", color: "bg-rose-100 text-rose-700", dot: "bg-rose-500" };
    if (stock <= stockMin) return { status: "faible", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
    return { status: "bon", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
  };

  const getCategoryIcon = (categorie) => {
    const icons = {
      Informatique: "💻",
      Mobile: "📱",
      Audio: "🎧",
      Périphériques: "🖱️",
      Bureautique: "📎",
      Électroménager: "🏠",
    };
    return icons[categorie] || "📦";
  };

  const calculateMarge = (prixVente, prixAchat) => {
    if (!prixAchat || !prixVente) return 0;
    return ((prixVente - prixAchat) / prixAchat * 100).toFixed(1);
  };

  const calculateValeurStock = (prixAchat, stock) => {
    if (!prixAchat || !stock) return 0;
    return (prixAchat * stock).toFixed(2);
  };
// petit compteur animé (sans lib)
function useCountUp(value, { duration = 700, fps = 60 } = {}) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = display;
    const delta = value - from;
    const frame = 1000 / fps;
    let last = 0;

    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      if (now - last > frame) {
        setDisplay(Math.round(from + delta * ease(t)));
        last = now;
      }
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
    return () => raf.current && cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}

  // Stats
  const stats = {
    total: produits.length,
    enStock: produits.filter((p) => p.stock?.quantite > p.stock?.stockMin).length,
    stockFaible: produits.filter((p) => p.stock?.quantite > 0 && p.stock?.quantite <= p.stock?.stockMin).length,
    rupture: produits.filter((p) => p.stock?.quantite === 0).length,
    valeurStock: produits
      .reduce((total, p) => total + ((p.prixAchat ?? 0) * (p.stock?.quantite ?? 0)), 0)
      .toFixed(2),
  };
  const totalDisplay  = useCountUp(stats.total);
const stockDisplay  = useCountUp(stats.enStock);
const faibleDisplay = useCountUp(stats.stockFaible);
const ruptureDisplay= useCountUp(stats.rupture);
  const statCards = [
    {
      label: "Produits Total",
      value: totalDisplay,
      icon: "📦",
      glow: "from-sky-400/40",
      bg: "from-sky-500/10 to-sky-500/5",
      onClick: () => setSelectedStatus("Tous"),
    },
    {
      label: "En Stock",
      value: stockDisplay,
      icon: "✅",
      glow: "from-emerald-400/40",
      bg: "from-emerald-500/10 to-emerald-500/5",
      onClick: () => setSelectedStatus("En stock"),
    },
    {
      label: "Stock Faible",
      value:  faibleDisplay,
      icon: "⚠️",
      glow: "from-amber-400/40",
      bg: "from-amber-500/10 to-amber-500/5",
      onClick: () => setSelectedStatus("Stock faible"),
    },
    {
      label: "En Rupture",
      value: ruptureDisplay,
      icon: "❌",
      glow: "from-rose-400/40",
      bg: "from-rose-500/10 to-rose-500/5",
      onClick: () => setSelectedStatus("Rupture"),
    },
    {
      label: "Valeur Stock (DNT)",
      // valeurStock est une string: on force Number pour formatage propre
      value: Number(stats.valeurStock).toLocaleString(),
      icon: "💰",
      glow: "from-violet-400/40",
      bg: "from-violet-500/10 to-violet-500/5",
      onClick: () => null,
    },
  ];

  // Fetch
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://logiciel-commercial-backend-production.up.railway.app/api/produits", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduits(res.data);
      } catch (err) {
        console.error(err);
        setError("Impossible de récupérer les produits depuis le serveur.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</div>
      </div>
    );
  }

  // Export
  const exportProduits = () => {
    const exportData = filteredProduits.map((prod) => ({
      Désignation: prod.designation,
      Référence: prod.reference,
      Catégorie: prod.categorie,
      Marque: prod.marque ?? "-",
      Modèle: prod.modele ?? "-",
      Description: prod.description ?? "-",
      "Stock actuel" : prod.stock,
      // "Prix Achat (€)": (prod.prixAchat ?? 0).toFixed(2),
      "Prix Vente (DNT)": (prod.prixVente ?? 0).toFixed(2),
      TVA: prod.tva ?? 0,
      "Marge (%)": calculateMarge(prod.prixVente, prod.prixAchat),
      "Stock (qté)": prod.stock?.quantite ?? 0,
      "Stock Minimum": prod.stock?.stockMin ?? 0,
      "Valeur Stock (DNT)": calculateValeurStock(prod.prixAchat, prod.stock?.quantite),
      Fournisseur: prod.fournisseur?.raisonSociale ?? "-",
      Statut: prod.statut ?? "-",
      "Date création": prod.dateCreation,
      "Dernière modification": prod.dateModification,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produits");
    XLSX.writeFile(wb, "Produits_Export.xlsx");
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
    {/* Header */}
<div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
  <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:h-16 sm:py-0
                  flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    {/* Icône + titre */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="size-10 grid place-items-center rounded-xl
                      bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-inner">
        <span className="text-lg" aria-hidden>📦</span>
      </div>
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
          Gestion de Stock
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5 truncate">
          Managez votre catalogue et suivez vos stocks en temps réel
        </p>
      </div>
    </div>

    {/* Actions */}
 {/* <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-end gap-2">
    
      <button
        onClick={handleNewProduct}
        className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition whitespace-nowrap"
      >
        <span className="text-base">＋</span> Nouveau Produit
      </button>
    </div> */}
  </div>
</div>


      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
   
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
  {[
    // { label: "Produits Total",   value: stats.total,       icon: "📦", bg: "from-blue-500/10 to-blue-500/5",     glow: "from-blue-400/40" },
    { label: "En Stock",         value: stats.enStock,     icon: "✅", bg: "from-emerald-500/10 to-emerald-500/5", glow: "from-emerald-400/40" },
    { label: "Stock Faible",     value: stats.stockFaible, icon: "⚠️", bg: "from-amber-500/10 to-amber-500/5",   glow: "from-amber-400/40" },
    { label: "En Rupture",       value: stats.rupture,     icon: "❌", bg: "from-rose-500/10 to-rose-500/5",     glow: "from-rose-400/40" },
    { label: "Valeur Stock (DNT)", value: Number(stats.valeurStock), icon: "💰", bg: "from-violet-500/10 to-violet-500/5", glow: "from-violet-400/40" },
  ].map((s, i) => (
    <div
      key={i}
      className="
        group relative rounded-3xl border border-black/5 bg-white
        p-5 md:p-7 min-h-28 h-full shadow-md shadow-black/5 ring-1 ring-black/5
        transition transform-gpu hover:-translate-y-1 md:hover:scale-[1.01]
        hover:shadow-2xl hover:shadow-black/10 hover:ring-2 hover:ring-black/10
        starting:opacity-0 starting:translate-y-2 duration-500 overflow-hidden
      "
    >
      {/* halo doux (identique clients) */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-2xl transition duration-500 group-hover:opacity-40" />

      {/* contenu */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`absolute inset-0 -z-10 blur-xl opacity-60 bg-gradient-to-br ${s.glow} to-transparent`} />
          <div className={`size-14 md:size-16 grid place-items-center rounded-2xl bg-gradient-to-br ${s.bg} shadow-inner`}>
            <span className="text-2xl md:text-3xl leading-none">{s.icon}</span>
          </div>
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight truncate">
            {/* même formatage que client : nombre avec séparateurs */}
            {Number.isFinite(s.value) ? s.value.toLocaleString() : String(s.value)}
          </div>
          <div className="mt-0.5 text-[11px] sm:text-xs uppercase tracking-wide text-neutral-500 truncate">
            {s.label}
          </div>
        </div>
      </div>

      {/* liseré intérieur, idem clients */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
    </div>
  ))}
</div>


        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end rounded-2xl border bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="flex-1">
            <label className="text-xs text-neutral-500">Recherche</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30">
              <span className="text-neutral-400">🔍</span>
              <input
                className="w-full outline-none placeholder:text-neutral-400 text-sm"
                placeholder="Rechercher un produit par nom, référence ou marque…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border overflow-hidden">
              <button
                className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-neutral-100 font-medium" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Vue Grille"
              >
                ⏹️
              </button>
              <button
                className={`px-3 py-2 text-sm border-l ${viewMode === "list" ? "bg-neutral-100 font-medium" : ""}`}
                onClick={() => setViewMode("list")}
                title="Vue Liste"
              >
                📋
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {statuts.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={selectedFournisseur}
              onChange={(e) => setSelectedFournisseur(e.target.value)}
              className="rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {fournisseurs.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Résultats header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-neutral-600">
            {filteredProduits.length} produit(s) trouvé(s)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportProduits}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              📊 Exporter
            </button>
          </div>
        </div>

       {viewMode === "grid" ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
    {filteredProduits.map((produit) => {
      const st = getStockStatus(produit.stock?.quantite, produit.stock?.stockMin);
      const marge = calculateMarge(produit.prixVente, produit.prixAchat);
      const valeurStock = calculateValeurStock(produit.prixAchat, produit.stock?.quantite ?? 0);
      const icon = getCategoryIcon(produit.categorie);
      const stock = produit.stock?.quantite ?? 0;
      const stockMin = produit.stock?.stockMin ?? 0;
      const stockPct = Math.max(0, Math.min(100, stockMin > 0 ? Math.round((stock / (stockMin * 2)) * 100) : 100));

      return (
        <article
          key={produit._id}
          className="prod-card group relative rounded-2xl border bg-white p-4 shadow-sm overflow-hidden
                     hover:shadow-xl transition-all duration-300 will-change-transform"
        >
          {/* Glow doux */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100
                          blur-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10
                          transition-opacity duration-500" />

          {/* Ruban statut (coin) */}
          <div className="prod-ribbon">
            <span className="prod-ribbon__content">{produit.statut || "—"}</span>
          </div>

          {/* En-tête */}
          <div className="flex items-start justify-between gap-3">
            {/* Catégorie */}
            <div className="inline-flex items-center gap-2 rounded-xl border px-2.5 py-1 bg-white/70 backdrop-blur">
              <span className="text-lg">{icon}</span>
              <span className="text-xs text-neutral-700">{produit.categorie || "—"}</span>
            </div>
            {/* Actions flottantes */}
            {/* <div className="flex items-center gap-1 -mr-1 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition">
              <button
                className="prod-btn"
                title="Modifier"
                onClick={() => handleEditProduct(produit)}
              >
                ✏️
              </button>
              <button
                className="prod-btn"
                title="Voir détails"
                onClick={() => handleViewProduct(produit)}
              >
                👁️
              </button>
            </div> */}
          </div>

          {/* Image/icone produit */}
          <div className="mt-3">
            <div className="relative size-20 grid place-items-center rounded-xl bg-neutral-50 text-2xl">
              {icon}
              {/* Shine */}
              <span className="prod-shine" />
            </div>

            {/* Titre + réf */}
            <h3 className="mt-3 font-semibold leading-tight line-clamp-2">{produit.designation}</h3>
            <p className="text-xs text-neutral-500">Réf : {produit.reference}</p>

            {/* Description courte */}
            {produit.description && (
              <p className="mt-1 text-sm text-neutral-700 line-clamp-2">{produit.description}</p>
            )}

            {/* Grille infos (prix/marge/fournisseur) */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {/* <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Prix achat</div>
                <div className="font-semibold">{(produit.prixAchat ?? 0).toFixed(2)} €</div>
              </div> */}
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Catégorie</div>
                <div className="font-semibold">{produit.categorie}</div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Fournisseur</div>
                <div className="font-semibold truncate">{produit.fournisseur?.raisonSociale || "—"}</div>
              </div>
              
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Valeur du stock</div>
                <div className="font-semibold">{produit.prixAchat * produit.stock.quantite ?? 0 } DNT </div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Stock Minimum</div>
                <div className="font-semibold">{(produit.stockMin ?? 0)} {produit.unite}</div>
              </div>
              
            </div>
          </div>

          {/* Stock + valeur */}
          <div className="mt-3 rounded-xl border p-2.5 bg-white/70 backdrop-blur">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`size-2.5 rounded-full ${st.dot}`} />
                <span className="text-sm text-neutral-700">
                  {stock} {produit.unite} {st.status === "faible" && `(min: ${produit.stockMin})`}
                </span>
              </div>
              {/* <span className="prod-badge">€ {valeurStock}</span> */}
            </div>

            {/* Barre de stock (animée) */}
            <div className="mt-2 prod-bar">
              <div
                className="prod-bar__fill"
                style={{
                  width: `${stockPct}%`,
                  // couleur selon état stock
                  background:
                    st.status === "rupture"
                      ? "linear-gradient(90deg,#f43f5e,#fb7185)"
                      : st.status === "faible"
                      ? "linear-gradient(90deg,#f59e0b,#fbbf24)"
                      : "linear-gradient(90deg,#10b981,#34d399)",
                }}
              />
              <div className="prod-bar__shine" />
            </div> 
          </div>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-[11px] ${st.color}`}>{produit.statut || "—"}</span>
            {(produit.marque || produit.modele) && (
              <span className="px-2 py-1 rounded-full text-[11px] bg-neutral-100 text-neutral-700">
                {produit.marque ?? ""} {produit.modele ?? ""}
              </span>
            )}
          </div>

          {/* CTA bas de carte */}
          {/* <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleViewProduct(produit)}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
            >
              📊 Stats
            </button>
            <button
              onClick={() => handleViewProduct(produit)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
            >
              🛒 Voir
            </button>
          </div> */}
        </article>
      );
    })}
  </div>
) : (
          // Vue Liste
          <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-3 text-xs font-medium text-neutral-500 border-b">
                <div>Produit</div>
                <div>Référence</div>
                <div>Catégorie</div>
                <div>Stock actuel</div>
                <div>Stock Minimum</div>
                <div>Valeur du stock</div>
              
              </div>

              {filteredProduits.map((produit) => {
                const st = getStockStatus(produit.stock?.quantite, produit.stock?.stockMin);
                const marge = calculateMarge(produit.prixVente, produit.prixAchat);

                return (
                  <div
                    key={produit._id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-3 border-b last:border-b-0 items-center hover:bg-neutral-50/60 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="size-9 grid place-items-center rounded-lg bg-neutral-100 text-lg">
                        {getCategoryIcon(produit.categorie)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{produit.designation}</div>
                        <div className="text-xs text-neutral-500 truncate">
                          {(produit.marque ?? "")} {(produit.modele ?? "")}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">{produit.reference}</div>
                    <div className="text-sm">{produit.categorie}</div>

                    <div className="text-sm">
                      <div className="font-medium">{produit.stock?.quantite } {produit.unite}  </div>
                      {/* <div className="text-xs text-neutral-500">{marge}%</div> */}
                    </div>

                    <div className="text-sm">
                      <span className="px-2 py-1 rounded-full text-[11px] bg-neutral-100 text-neutral-700">
                        {produit.stock?.stockMin ?? 0} {produit.unite}
                      </span>
                    </div>

                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-[11px] ${st.color}`}>
                        {produit.prixAchat * produit.stock?.quantite ?? 0 } DNT
                      </span>
                    </div>

                    {/* <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewProduct(produit)}
                        className="size-9 grid place-items-center rounded-lg border bg-white text-neutral-600 hover:bg-neutral-50 active:scale-95 transition"
                        title="Voir détails"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditProduct(produit)}
                        className="size-9 grid place-items-center rounded-lg border bg-white text-neutral-600 hover:bg-neutral-50 active:scale-95 transition"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                    </div> */}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* État vide */}
        {filteredProduits.length === 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <div className="text-4xl mb-2">📦</div>
            <h3 className="font-semibold">Aucun produit trouvé</h3>
            <p className="text-sm text-neutral-500">Aucun produit ne correspond à vos critères</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Toutes");
                  setSelectedStatus("Tous");
                  setSelectedFournisseur("Tous");
                }}
              >
                🔄 Réinitialiser les filtres
              </button>
              <button
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
                onClick={handleNewProduct}
              >
                + Ajouter un produit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockList;
