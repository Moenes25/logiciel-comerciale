// FournisseurList.jsx — Tailwind (responsive + animé, même logique)
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import fournisseurService from "../../services/fournisseurService";

const FournisseurList = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Tous");
  const [selectedStatut, setSelectedStatut] = useState("Tous");
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);

  const types = ["Tous", "Équipement IT", "Fournitures Bureau", "Mobilier", "Services"];
  const statuts = ["Tous", "Actif", "Inactif"];

  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const res = await fournisseurService.getAll();
        setFournisseurs(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFournisseurs();
  }, []);

  const filteredFournisseurs = fournisseurs.filter((f) => {
    const nom = f.raisonSociale || "";
    const email = f.email || "";
    const ville = f.adresse?.ville || "";
    const matchesSearch =
      nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ville.toLowerCase().includes(searchTerm.toLowerCase());

    const statut = f.actif ? "Actif" : "Inactif";
    const matchesStatut = selectedStatut === "Tous" || statut === selectedStatut;
    const matchesType = selectedType === "Tous" || f.type === selectedType;

    return matchesSearch && matchesStatut && matchesType;
  });

  const getStatutTint = (statut) =>
    statut === "Actif"
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : "bg-rose-100 text-rose-700 ring-rose-200";

  const getTypeIcon = (type) => {
    switch (type) {
      case "Équipement IT":
        return "💻";
      case "Fournitures Bureau":
        return "📎";
      case "Mobilier":
        return "🪑";
      case "Services":
        return "🔧";
      default:
        return "🏢";
    }
  };

  const stars = (note = 4) => {
    const n = Math.max(0, Math.min(5, Math.round(note)));
    return "★".repeat(n) + "☆".repeat(5 - n);
  };

  // Stats
  const stats = {
    total: fournisseurs.length,
    actifs: fournisseurs.filter((f) => f.actif).length,
    commandes: fournisseurs.reduce((s, f) => s + (f.commandesEnCours || 0), 0),
    moyenne: (
      fournisseurs.reduce((s, f) => s + (f.rate || 4), 0) / (fournisseurs.length || 1)
    ).toFixed(1),
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">Chargement des fournisseurs…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
{/* Header sticky */}
<div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

    {/* Titre + icône */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="size-10 grid place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-inner">
        <span className="text-lg">🏭</span>
      </div>
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
          Gestion des Fournisseurs
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5 truncate">
          Managez votre réseau de fournisseurs
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-2">

      <button
        onClick={() => navigate("/dashboard/fournisseurs/nouveau")}
        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
      >
        <span className="text-base">＋</span> Nouveau Fournisseur
      </button>
    </div>
  </div>
</div>


      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 starting:opacity-0 starting:translate-y-2 duration-300">
          {[
            { label: "Fournisseurs Total", value: stats.total, icon: "🏢", bg: "from-blue-500/10 to-blue-500/5", glow: "from-blue-400/40" },
            { label: "Fournisseurs Actifs", value: stats.actifs, icon: "✅", bg: "from-emerald-500/10 to-emerald-500/5", glow: "from-emerald-400/40" },
            { label: "Commandes en Cours", value: stats.commandes, icon: "📦", bg: "from-amber-500/10 to-amber-500/5", glow: "from-amber-400/40" },
            { label: "Note Moyenne", value: stats.moyenne, icon: "⭐", bg: "from-violet-500/10 to-violet-500/5", glow: "from-violet-400/40" },
          ].map((s, i) => (
            <div
              key={i}
              className="group relative rounded-3xl border bg-white p-5 md:p-7 shadow-md shadow-black/5 ring-1 ring-black/5 transition transform-gpu hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 hover:ring-2 hover:ring-black/10 overflow-hidden"
            >
              <div className={`absolute -top-8 -right-8 size-24 rounded-full blur-3xl opacity-30 bg-gradient-to-br ${s.glow} to-transparent`} />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`size-14 md:size-16 grid place-items-center rounded-2xl bg-gradient-to-br ${s.bg} shadow-inner`}>
                    <span className="text-2xl md:text-3xl leading-none">{s.icon}</span>
                  </div>
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight truncate">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[11px] sm:text-xs uppercase tracking-wide text-neutral-500 truncate">
                    {s.label}
                  </div>
                </div>
              </div>
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
                type="text"
                className="w-full outline-none placeholder:text-neutral-400 text-sm"
                placeholder="Rechercher par nom, email ou ville…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[420px]">
            <div>
              <label className="text-xs text-neutral-500">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500">Statut</label>
              <select
                value={selectedStatut}
                onChange={(e) => setSelectedStatut(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {statuts.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid fournisseurs */}
        {filteredFournisseurs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm starting:opacity-0 starting:translate-y-2 duration-300">
            <div className="text-5xl mb-2">🏢</div>
            <h3 className="font-semibold">Aucun fournisseur trouvé</h3>
            <p className="text-sm text-neutral-500">Aucun fournisseur ne correspond à vos critères.</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedType("Tous");
                  setSelectedStatut("Tous");
                }}
              >
                Réinitialiser les filtres
              </button>
              <button
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                onClick={() => navigate("/dashboard/fournisseurs/nouveau")}
              >
                + Ajouter un fournisseur
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFournisseurs.map((f) => {
              const statut = f.actif ? "Actif" : "Inactif";
              return (
                <div
                  key={f._id}
                  className="group relative rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5 starting:opacity-0 starting:translate-y-2 duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="size-12 sm:size-14 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-inner">
                      <span className="text-xl">{getTypeIcon(f.type)}</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{f.raisonSociale}</h3>
                      <p className="text-xs text-neutral-500 truncate">{f.type || "—"}</p>
                    </div>

                    <div className="ml-auto flex flex-wrap items-center gap-1.5 justify-end">
                      <span className={["px-2 py-1 rounded-full text-[11px] font-medium ring-1", getStatutTint(statut)].join(" ")}>
                        {statut}
                      </span>
                      <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700">
                        {stars(f.rate || 4)} {f.rate || 4}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📧</span>
                      <span className="text-neutral-700 truncate">{f.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <span className="text-neutral-700 truncate">{f.telephone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📍</span>
                      <span className="text-neutral-700 truncate">
                        {f.adresse?.ville || "—"}, {f.adresse?.pays || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📦</span>
                      <span className="text-neutral-700">
                        {f.commandesEnCours || 0} commande(s) en cours
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
                      onClick={() => navigate(`/dashboard/fournisseurs/${f._id}`)}
                    >
                      👁️ Détails
                    </button>
                    <button
                      className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
                      onClick={() => navigate(`/dashboard/fournisseurs/${f._id}/modifier`)}
                    >
                      ✏️ Modifier
                    </button>
                 
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FournisseurList;
