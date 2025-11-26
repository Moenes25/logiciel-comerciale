// CommandeList.jsx — Tailwind responsive + animé (même logique/données)
import React, { useEffect, useMemo, useState } from "react";
import commandeService from "../../services/commandeService";
import { Link, useNavigate } from "react-router-dom";

export default function CommandeList() {
  const navigate = useNavigate();

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  useEffect(() => {
    (async () => {
      try {
        const res = await commandeService.getAll();
        if (res.success) setCommandes(res.data);
        else console.error("Erreur API Commandes :", res.message);
      } catch (err) {
        console.error("Erreur serveur :", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unformatStatut = (label) => {
    switch (label) {
      case "En traitement":
        return "en_cours";
      case "Confirmée":
        return "confirmee";
      case "Expédiée":
        return "expediee";
      case "Livrée":
        return "livree";
      case "Annulée":
        return "annulee";
      case "Brouillon":
        return "brouillon";
      default:
        return "";
    }
  };

  const formatStatut = (statut) => {
    switch (statut) {
      case "en_cours":
        return "En traitement";
      case "confirmee":
        return "Confirmée";
      case "expediee":
        return "Expédiée";
      case "livree":
        return "Livrée";
      case "annulee":
        return "Annulée";
      default:
        return statut;
    }
  };

  const getStatutTone = (label) => {
    switch (label) {
      case "Confirmée":
        return { bg: "bg-emerald-100", text: "text-emerald-700", ring: "ring-emerald-200" };
      case "En traitement":
        return { bg: "bg-amber-100", text: "text-amber-800", ring: "ring-amber-200" };
      case "Expédiée":
        return { bg: "bg-violet-100", text: "text-violet-700", ring: "ring-violet-200" };
      case "Livrée":
        return { bg: "bg-blue-100", text: "text-blue-700", ring: "ring-blue-200" };
      case "Annulée":
        return { bg: "bg-rose-100", text: "text-rose-700", ring: "ring-rose-200" };
      default:
        return { bg: "bg-neutral-100", text: "text-neutral-700", ring: "ring-neutral-200" };
    }
  };

  const renderClientName = (client) => {
    if (!client) return "—";
    if (client.type === "entreprise") return <>🏢 {client.nom}</>;
    return <>👤 {client.nom} {client.prenom || ""}</>;
  };

  const getClientLabel = (commande) => {
    if (commande.type === "achat") return commande.fournisseur?.raisonSociale || "—";
    if (commande.client?.type === "entreprise") return commande.client.nom || "—";
    return `${commande.client?.nom || ""} ${commande.client?.prenom || ""}`.trim();
  };

  // Filtrage
  const filteredCommandes = useMemo(() => {
    return commandes.filter((commande) => {
      const clientName =
        commande.type === "vente"
          ? `${commande.client?.nom || ""} ${commande.client?.prenom || ""}`
          : commande.fournisseur?.raisonSociale || "";

      const matchesSearch =
        (commande.numero || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatut = !statutFilter || commande.statut === unformatStatut(statutFilter);

      const matchesClient = !clientFilter || clientName.trim() === clientFilter.trim();

      return matchesSearch && matchesStatut && matchesClient;
    });
  }, [commandes, searchTerm, statutFilter, clientFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCommandes = filteredCommandes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);

  // Stats
  const stats = {
    total: commandes.length,
    confirmees: commandes.filter((c) => c.statut === "confirmee").length,
    traitement: commandes.filter((c) => c.statut === "en_cours").length,
    livrees: commandes.filter((c) => c.statut === "livree").length,
    totalMontant: commandes.reduce((sum, cmd) => sum + (cmd.totaux?.totalTTC || 0), 0),
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">Chargement des commandes…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
    {/* Header */}
<div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0
                  flex flex-col sm:flex-row sm:items-center justify-between gap-2">
    {/* Icône + titre */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="size-10 grid place-items-center rounded-xl
                      bg-gradient-to-br from-blue-500 to-sky-600 text-white shadow-inner">
        <span className="text-lg" aria-hidden>🧾</span>
      </div>
      <div className="min-w-0">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
          Gestion des Commandes
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5 truncate">
          Suivez et gérez vos commandes en temps réel
        </p>
      </div>
    </div>

    {/* Actions */}
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <button
        onClick={() => navigate("/dashboard/commandes/nouveau")}
        className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
      >
        <span className="text-base">＋</span> Nouvelle Commande
      </button>
    </div>
  </div>
</div>


      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
        {/* Stats — identiques à ClientList */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
  {[
    { label: "Commandes totales", value: stats.total,        icon: "📦", bg: "from-blue-500/10 to-blue-500/5",     glow: "from-blue-400/40" },
    { label: "Confirmées",        value: stats.confirmees,   icon: "✅", bg: "from-emerald-500/10 to-emerald-500/5", glow: "from-emerald-400/40" },
    { label: "En traitement",     value: stats.traitement,   icon: "🔄", bg: "from-amber-500/10 to-amber-500/5",   glow: "from-amber-400/40" },
    { label: "Chiffre d'affaires",value: stats.totalMontant, icon: "💰", bg: "from-violet-500/10 to-violet-500/5", glow: "from-violet-400/40" },
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
      style={{ transitionDelay: `${i * 50}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-2xl transition duration-500 group-hover:opacity-40" />
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className={`absolute inset-0 -z-10 blur-xl opacity-60 bg-gradient-to-br ${s.glow} to-transparent`} />
          <div className={`size-14 md:size-16 grid place-items-center rounded-2xl bg-gradient-to-br ${s.bg} shadow-inner`}>
            <span className="text-2xl md:text-3xl leading-none">{s.icon}</span>
          </div>
        </div>
        <div className="min-w-0 leading-tight">
          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight truncate">
            {typeof s.value === "number" ? s.value.toLocaleString() : Number(s.value ?? 0).toLocaleString() + (s.icon === "💰" ? " €" : "")}
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


        {/* Toolbar */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-neutral-500">Recherche</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30">
              <span className="text-neutral-400">🔍</span>
              <input
                className="w-full outline-none placeholder:text-neutral-400 text-sm"
                placeholder="Rechercher une commande ou un client…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

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
              <option value="">Tous les statuts</option>
              <option value="Confirmée">Confirmée</option>
              <option value="En traitement">En traitement</option>
              <option value="Expédiée">Expédiée</option>
              <option value="Livrée">Livrée</option>
              <option value="Annulée">Annulée</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-neutral-500">Client</label>
            <select
              value={clientFilter}
              onChange={(e) => {
                setClientFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">Tous les clients</option>
              {[...new Set(commandes.map((c) => getClientLabel(c)))].map((label, idx) => (
                <option key={idx} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

  {/* Tableau / résultats */}
{filteredCommandes.length === 0 ? (
  /* … garde ton bloc “état vide” tel quel … */
  <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">…</div>
) : (
  <>
    {/* Mobile: cartes (lisibles) */}
    <div className="grid gap-3 md:hidden">
      {currentCommandes.map((commande) => {
        const statutLabel = formatStatut(commande.statut);
        const tone = getStatutTone(statutLabel);
        return (
          <div
            key={commande._id}
            className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold leading-tight truncate">#{commande.numero}</div>
                <div className="text-xs text-neutral-500">
                  {commande.dateCommande ? new Date(commande.dateCommande).toLocaleDateString() : "—"}
                </div>
              </div>
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
                {statutLabel}
              </span>
            </div>

            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span>👤</span>
                <span className="truncate">
                  {commande.type === "vente"
                    ? renderClientName(commande.client)
                    : (commande.fournisseur?.raisonSociale || "—")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span>💸</span>
                <span className="font-medium">{(commande.totaux?.totalTTC ?? 0).toFixed(2)} DT</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🗂️</span>
                <span className="text-neutral-700">{commande.lignes?.length || 0} produits</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <span className="text-neutral-700">
                  {commande.dateLivraison ? new Date(commande.dateLivraison).toLocaleDateString() : "—"}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
               onClick={() => navigate(`/dashboard/commandes/${commande._id}`)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
              >
                👁️ Détails
              </button>
              <button
                onClick={() => navigate(`/dashboard/commandes/${commande._id}/modifier`)}
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
              >
                ✏️ Modifier
              </button>
            </div>
          </div>
        );
      })}
    </div>

    {/* Desktop: table améliorée */}
    <div className="rounded-3xl border bg-white shadow-md ring-1 ring-black/5 overflow-hidden hidden md:block transition hover:shadow-lg hover:ring-black/10">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-auto">
          <thead className="bg-neutral-50/80 backdrop-blur sticky top-0 z-10 text-neutral-600">
            <tr className="[&>th]:px-4 [&>th]:py-3 [&>th]:text-left [&>th]:font-semibold">
              {["Numéro", "Client", "Date", "Montant", "Statut", "Livraison", "Produits", "Actions"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {currentCommandes.map((commande) => {
              const statutLabel = formatStatut(commande.statut);
              const tone = getStatutTone(statutLabel);
              return (
                <tr
                  key={commande._id}
                  className="group transition hover:bg-neutral-50/70"
                >
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">#{commande.numero}</td>
                  <td className="px-4 py-3">
                    {commande.type === "vente"
                      ? renderClientName(commande.client)
                      : (commande.fournisseur?.raisonSociale || "—")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {commande.dateCommande ? new Date(commande.dateCommande).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {(commande.totaux?.totalTTC ?? 0).toFixed(2)} DT
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${tone.bg} ${tone.text} ${tone.ring}`}>
                      {statutLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {commande.dateLivraison ? new Date(commande.dateLivraison).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs">
                      {commande.lignes?.length || 0} produits
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/commandes/${commande._id}`)}
                        title="Voir les détails"
                        className="rounded-lg border px-2.5 py-1.5 hover:bg-neutral-50 active:scale-[.98] transition"
                      >
                        👁️
                      </button>
                      <button
                       onClick={() => navigate(`/dashboard/commandes/${commande._id}/modifier`)}
                        title="Modifier la commande"
                        className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
                      >
                        ✏️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* pied optionnel */}
          <tfoot>
            <tr>
              <td colSpan={8} className="px-4 py-3 text-right text-sm text-neutral-600">
                Total affiché :{" "}
                <span className="font-medium">
                  {currentCommandes.reduce((s, c) => s + (c.totaux?.totalTTC || 0), 0).toFixed(2)} DT
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    {totalPages > 1 && (
  <div className="mt-4 flex items-center justify-center gap-2">
    <button
      className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
    >
      ← Précédent
    </button>

    {/* Numéros de pages */}
    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => handlePageChange(p)}
          className={`h-9 min-w-9 rounded-lg px-3 text-sm border transition
            ${p === currentPage ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-neutral-50"}`}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </button>
      ))}
    </div>

    <button
      className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
    >
      Suivant →
    </button>
  </div>
)}
  </>
)}

      </div>
    </div>
  );
}
