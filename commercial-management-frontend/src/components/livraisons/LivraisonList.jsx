// LivraisonList.jsx — Tailwind (responsive + animé) — même logique/données
import React, { useEffect, useState } from "react";
import livraisonService from "../../services/livraisonService";
import commandeService from "../../services/commandeService";
import { Link, useNavigate } from "react-router-dom";

export default function LivraisonList() {
  const navigate = useNavigate();

  const [livraisons, setLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [livreurFilter, setLivreurFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const liv = await livraisonService.getAll();
        if (liv.success && Array.isArray(liv.data)) {
          // On conserve uniquement les livraisons liées à des commandes expédiées
          const expediees = liv.data.filter((l) => l.commande?.statut === "expediee");
          setLivraisons(expediees);
        }
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Formatage/labels statut
  const formatStatut = (statut) => {
    switch (statut) {
      case "en_preparation":
        return "En préparation";
      case "expediee":
        return "Expédiée";
      case "en_livraison":
        return "En livraison";
      case "livree":
        return "Livrée";
      case "retournee":
        return "Retournée";
      default:
        return statut;
    }
  };

  const statutPillClasses = (label) => {
    switch (label) {
      case "En préparation":
        return "bg-amber-100 text-amber-700 ring-amber-200";
      case "Expédiée":
        return "bg-violet-100 text-violet-700 ring-violet-200";
      case "En livraison":
        return "bg-sky-100 text-sky-700 ring-sky-200";
      case "Livrée":
        return "bg-emerald-100 text-emerald-700 ring-emerald-200";
      case "Retournée":
        return "bg-rose-100 text-rose-700 ring-rose-200";
      default:
        return "bg-neutral-100 text-neutral-700 ring-neutral-200";
    }
  };

  const renderClientName = (commande) => {
    if (!commande?.client) return "—";
    const c = commande.client;
    if (c.type === "entreprise") return <>🏢 {c.nom}</>;
    return <>👤 {c.nom} {c.prenom || ""}</>;
  };

  // Filtrage (on garde seulement les commandes expédiées)
  const filteredLivraisons = livraisons.filter((liv) => {
    if (liv.commande?.statut !== "expediee") return false;

    const matchesSearch =
      (liv.numero || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (liv.commande?.numero || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatut = !statutFilter || formatStatut(liv.statut) === statutFilter;

    const matchesLivreur =
      !livreurFilter ||
      (liv.livreur?.nom || liv.livreur || "")
        .toString()
        .toLowerCase() === livreurFilter.toLowerCase();

    return matchesSearch && matchesStatut && matchesLivreur;
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const current = filteredLivraisons.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(filteredLivraisons.length / itemsPerPage);

  const handlePageChange = (n) => {
    setCurrentPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">Chargement des livraisons…</span>
        </div>
      </div>
    );
  }

  // Stats
  const livEnPrep = livraisons.filter((l) => l.statut === "en_preparation").length;
  const livEnCours = livraisons.filter((l) => l.statut === "en_livraison").length;
  const livTerminees = livraisons.filter((l) => l.statut === "livree").length;

  const montantBadge =
    "inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 text-sm font-semibold text-blue-800 ring-1 ring-inset ring-blue-200";

  return (
    <div className="min-h-dvh bg-neutral-50">
 {/* HEADER sticky */}
<div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0
                  flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    {/* Icône + titre */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="size-10 grid place-items-center rounded-xl
                      bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white shadow-inner">
        <span className="text-lg" aria-hidden>🚚</span>
      </div>
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
          Gestion des Livraisons
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5 truncate">
          Suivez et gérez toutes les livraisons
        </p>
      </div>
    </div>

   {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        onClick={() => navigate("/dashboard/commandes/nouveau")}
        className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
      >
        <span className="text-base">＋</span> Nouvelle Livraison
      </button>
    </div>
  </div>
</div>


      {/* CONTENU */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Livraisons expédiées", value: livraisons.length, icon: "🚚", glow: "from-violet-400/40", bg: "from-violet-500/10 to-violet-500/5" },
            { label: "En préparation", value: livEnPrep, icon: "📦", glow: "from-amber-400/40", bg: "from-amber-500/10 to-amber-500/5" },
            { label: "En livraison", value: livEnCours, icon: "🚛", glow: "from-sky-400/40", bg: "from-sky-500/10 to-sky-500/5" },
            { label: "Livrées", value: livTerminees, icon: "✅", glow: "from-emerald-400/40", bg: "from-emerald-500/10 to-emerald-500/5" },
          ].map((s, i) => (
            <div
              key={i}
              className="group relative rounded-3xl border border-black/5 bg-white p-5 md:p-7 min-h-28 h-full shadow-md shadow-black/5 ring-1 ring-black/5 transition transform-gpu hover:-translate-y-1 md:hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/10 hover:ring-2 hover:ring-black/10 overflow-hidden"
            >
              <div className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-2xl transition duration-500 group-hover:opacity-40 bg-gradient-to-br ${s.glow} to-transparent`} />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className={`absolute inset-0 -z-10 blur-xl opacity-60 bg-gradient-to-br ${s.glow} to-transparent`} />
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
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-3 md:items-end rounded-2xl border bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="flex-1">
            <label className="text-xs text-neutral-500">Recherche</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30">
              <span className="text-neutral-400">🔍</span>
              <input
                className="w-full outline-none placeholder:text-neutral-400 text-sm"
                placeholder="Rechercher livraison ou commande…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:w-[420px]">
            <div>
              <label className="text-xs text-neutral-500">Statut</label>
              <select
                value={statutFilter}
                onChange={(e) => {
                  setStatutFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Tous</option>
                <option value="En préparation">En préparation</option>
                <option value="Expédiée">Expédiée</option>
                <option value="En livraison">En livraison</option>
                <option value="Livrée">Livrée</option>
                <option value="Retournée">Retournée</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-500">Livreur</label>
              <select
                value={livreurFilter}
                onChange={(e) => {
                  setLivreurFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Tous</option>
                {[...new Set(livraisons.map((l) => l.livreur?.nom || l.livreur).filter(Boolean))].map(
                  (nom, i) => (
                    <option key={i} value={nom}>
                      {nom}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* TABLE */}
     {/* TABLE */}
{filteredLivraisons.length === 0 ? (
  <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
    <div className="text-4xl mb-2">🚚</div>
    <h3 className="font-semibold">Aucune livraison trouvée</h3>
    <p className="text-sm text-neutral-500">Aucun résultat ne correspond à vos critères.</p>
  </div>
) : (
  <div className="space-y-3">
    {/* Mobile ≤ md : cartes lisibles */}
    <div className="grid gap-3 md:hidden">
      {current.map((liv) => {
        const ttc = liv.commande?.totaux?.totalTTC ?? 0;
        const produitsCount = liv.commande?.lignes?.length || 0;
        const statutLabel = formatStatut(liv.commande?.statut || liv.statut);

        return (
          <div
            key={liv._id}
            className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold leading-tight truncate">{liv.numero}</div>
                <div className="text-[11px] text-neutral-500">
                  Cmd {liv.commande?.numero || "—"} • {new Date(liv.dateLivraison || liv.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] ring-1 ${statutPillClasses(statutLabel)}`}>
                {statutLabel}
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Client</div>
                <div className="font-medium truncate">{renderClientName(liv.commande)}</div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Montant</div>
                <div className="font-semibold">{ttc.toFixed(2)} DT</div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Produits</div>
                <div className="font-medium">{produitsCount}</div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Livreur</div>
                <div className="font-medium truncate">{liv.isVirtual ? "—" : (liv.livreur?.nom || liv.livreur || "—")}</div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
               onClick={() => navigate(`${liv._id}`)}
              >
                👁️ Voir
              </button>
              <button
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
                onClick={async () => {
                  if (!liv.isVirtual)return navigate(`${liv._id}/modifier`);
                  const realCmdId = liv._id.replace("virtual-", "");
                  const newLiv = await livraisonService.create({
                    commande: realCmdId, statut: "en_preparation", dateLivraison: new Date(), livreur: null,
                  });
                  if (newLiv.success && newLiv.data?._id) navigate(`${newLiv.data._id}/modifier`)
                }}
              >
                ✏️ {liv.isVirtual ? "Créer" : "Modifier"}
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Desktop ≥ md : table améliorée */}
    <div className="hidden md:block rounded-2xl border bg-white shadow-md ring-1 ring-black/5 overflow-hidden transition hover:shadow-lg hover:ring-black/10">
      <div className="overflow-x-hidden">
       <table className="w-full table-fixed text-sm">
          <thead className="bg-neutral-50/80 backdrop-blur sticky top-0 z-10 text-neutral-600">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
              {["Numéro","Client","Montant","Produits","Statut","Actions"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {current.map((liv) => {
              const ttc = liv.commande?.totaux?.totalTTC ?? 0;
              const produitsCount = liv.commande?.lignes?.length || 0;
              const statutLabel = formatStatut(liv.commande?.statut || liv.statut);

              return (
                <tr key={liv._id} className="group transition hover:bg-neutral-50/70">
                  <td className="px-3 py-2 font-semibold whitespace-nowrap">{liv.numero}</td>
               
                  <td className="px-3 py-2">
                    <div className="max-w-[280px] truncate">{renderClientName(liv.commande)}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-1 font-semibold text-blue-800 ring-1 ring-inset ring-blue-200">
                      {ttc.toFixed(2)} DT
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{produitsCount} produits</td>
                  
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] ring-1 ${statutPillClasses(statutLabel)}`}>
                      {statutLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-lg border px-2.5 py-1.5 hover:bg-neutral-50 active:scale-[.98] transition"
                        title="Voir"
                       onClick={() => navigate(`${liv._id}`)}
                      >
                        👁️
                      </button>
                      <button
                        className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
                        title={liv.isVirtual ? "Créer la livraison" : "Modifier"}
                        onClick={async () => {
                          if (!liv.isVirtual) return navigate(`${liv._id}/modifier`);
                          const realCmdId = liv._id.replace("virtual-", "");
                          const newLiv = await livraisonService.create({
                            commande: realCmdId, statut: "en_preparation", dateLivraison: new Date(), livreur: null,
                          });
                          if (newLiv.success && newLiv.data?._id) navigate(`${newLiv.data._id}/modifier`);
                        }}
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 px-4 py-3">
          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Précédent
          </button>
          <span className="text-sm text-neutral-600">
            Page <strong>{currentPage}</strong> / {totalPages}
          </span>
          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  </div>
)}

      </div>
    </div>
  );
}
