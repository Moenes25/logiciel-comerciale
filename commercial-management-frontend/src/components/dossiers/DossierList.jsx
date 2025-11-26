// DossierList.jsx — mêmes styles, filtres fonctionnels
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import dossierService from "../../services/dossierService";
import clientService from "../../services/clientService";

const norm = (v) => (v ? String(v).toLowerCase() : "");

export default function DossierList() {
  const [dossiers, setDossiers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // ⬇️ NOUVEAU : états des filtres
  const [typeFilter, setTypeFilter] = useState("");   // "entreprise" | "particulier" | ""
  const [statusFilter, setStatusFilter] = useState(""); // "Actif" | "Inactif" | ""
  const [cityFilter, setCityFilter] = useState("");   // "Tunis" | ... | ""

  const [showPopup, setShowPopup] = useState(false);          // ⬅️ NEW
  const [selectedClient, setSelectedClient] = useState(null); // ⬅️ NEW

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [dr, cr] = await Promise.all([
          dossierService.getAll(),
          clientService.getAll(),
        ]);
        if (dr?.success) setDossiers(dr.data || []);
        if (cr?.success) setClients(cr.data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // index des dossiers par client
  const dossiersParClient = useMemo(() => {
    const map = new Map();
    for (const d of dossiers) {
      const cid = String(d.client?._id || d.clientId || "");
      if (!cid) continue;
      const arr = map.get(cid) || [];
      arr.push(d);
      map.set(cid, arr);
    }
    return map;
  }, [dossiers]);

  // cartes client
  const cartes = useMemo(() => {
    return clients.map((c) => {
      const cid = String(c._id || c.id);
      const list = dossiersParClient.get(cid) || [];
      const fullName =
        norm(c.type) === "entreprise"
          ? (c.nom || c.raisonSociale || "Entreprise")
          : [c.nom, c.prenom].filter(Boolean).join(" ") || "Client";

      return {
        _id: cid,
        titre: fullName,
        client: c,
        nbDossiers: list.length,
      };
    });
  }, [clients, dossiersParClient]);

  // ⬇️ NOUVEAU : options dynamiques de ville
  const cityOptions = useMemo(() => {
    const set = new Set(
      clients
        .map((c) => c?.adresse?.ville)
        .filter((v) => v && String(v).trim().length > 0)
    );
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }, [clients]);

  // badges
  const badgeType = (c) => (norm(c?.type) === "entreprise" ? "Entreprise" : "Particulier");
  const badgeStatut = (c) => (c?.statut ? c.statut : (c?.actif ? "Actif" : "Inactif"));


    // ➕ NEW: ouvrir la popup
const openClientDetails = (client) => {
  setSelectedClient(client);   // ⬅️ on stocke l'objet complet
  setShowPopup(true);
};

  // ⬇️ NOUVEAU : filtrage combiné (recherche + filtres)
  const filtered = useMemo(() => {
    const q = norm(searchTerm);
    return cartes.filter(({ titre, client }) => {
      // recherche plein-texte
      const matchesSearch =
        norm(titre).includes(q) ||
        norm(client?.email).includes(q) ||
        norm(client?.adresse?.ville).includes(q);

      // type
      const matchesType =
        !typeFilter || norm(client?.type) === norm(typeFilter);

      // statut (prend en compte client.statut ou client.actif)
      const clientStatus = client?.statut ? client.statut : (client?.actif ? "Actif" : "Inactif");
      const matchesStatus =
        !statusFilter || clientStatus === statusFilter;

      // ville
      const matchesCity =
        !cityFilter || norm(client?.adresse?.ville) === norm(cityFilter);

      return matchesSearch && matchesType && matchesStatus && matchesCity;
    });
  }, [cartes, searchTerm, typeFilter, statusFilter, cityFilter]);

  // stats
  const stats = useMemo(() => {
    const total = cartes.length;
    const entreprises = cartes.filter(c => norm(c.client?.type) === "entreprise").length;
    const particuliers = cartes.filter(c => norm(c.client?.type) === "particulier").length;
    const actifs = cartes.filter(c => c.client?.actif === true || c.client?.statut === "Actif").length;
    return { total, entreprises, particuliers, actifs };
  }, [cartes]);

  const statCards = [
    { label: "Clients totaux", value: stats.total,       icon: "👥", glow: "from-sky-400/40",     bg: "from-sky-500/10 to-sky-500/5" },
    { label: "Entreprises",    value: stats.entreprises, icon: "🏢", glow: "from-amber-400/40",   bg: "from-amber-500/10 to-amber-500/5" },
    { label: "Particuliers",   value: stats.particuliers,icon: "👤", glow: "from-violet-400/40",  bg: "from-violet-500/10 to-violet-500/5" },
    { label: "Actifs",         value: stats.actifs,      icon: "✅", glow: "from-emerald-400/40", bg: "from-emerald-500/10 to-emerald-500/5" },
  ];

  // actions
  const handleNew = () => navigate("/dashboard/clients/nouveau");
  const openClient = (id) => navigate(`/clients/${id}`);

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">Chargement…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 grid place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-inner">
              <span className="text-lg">📁</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">Gestion des Dossiers</h1>
              <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5 truncate">Suivez vos projets et contrats</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleNew} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition">
              <span className="text-base">＋</span> Nouveau Dossier
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch p-4">
        {statCards.map((s, i) => (
          <div key={i} className="group relative rounded-3xl border border-black/5 bg-white p-5 md:p-7 min-h-28 h-full shadow-md shadow-black/5 ring-1 ring-black/5 transition transform-gpu hover:-translate-y-1 md:hover:scale-[1.01] hover:shadow-2xl hover:shadow-black/10 hover:ring-2 hover:ring-black/10 starting:opacity-0 starting:translate-y-2 duration-500 overflow-hidden">
            <div className={`pointer-events-none absolute inset-0 rounded-3xl opacity-0 blur-2xl transition duration-500 group-hover:opacity-40 bg-gradient-to-br ${s.glow} to-transparent`} />
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className={`absolute inset-0 -z-10 blur-xl opacity-60 bg-gradient-to-br ${s.glow} to-transparent`} />
                <div className={`size-14 md:size-16 grid place-items-center rounded-2xl bg-gradient-to-br ${s.bg} shadow-inner`}>
                  <span className="text-2xl md:text-3xl leading-none">{s.icon}</span>
                </div>
              </div>
              <div className="min-w-0 leading-tight">
                <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight truncate">{Number(s.value).toLocaleString()}</div>
                <div className="mt-0.5 text-[11px] sm:text-xs uppercase tracking-wide text-neutral-500 truncate">{s.label}</div>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
          </div>
        ))}
      </div>

      {/* Toolbar + liste */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
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

          {/* ⬇️ Selects désormais fonctionnels (mêmes classes) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:w-[560px]">
            <div>
              <label className="text-xs text-neutral-500">Type</label>
              <select
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="entreprise">Entreprise</option>
                <option value="particulier">Particulier</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-500">Statut</label>
              <select
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-500">Ville</label>
              <select
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <option value="">Toutes</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LISTE — 1 carte par client */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm starting:opacity-0 starting:translate-y-2 duration-300">
            <div className="text-5xl mb-2">📁</div>
            <h3 className="font-semibold">Aucun client trouvé</h3>
            <p className="text-sm text-neutral-500">Ajustez votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(({ _id, titre, client }) => {
              const typeLbl = badgeType(client);
              const statutLbl = badgeStatut(client);
              const badgeStatutCls =
                statutLbl === "Actif"
                  ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                  : "bg-rose-100 text-rose-700 ring-rose-200";

              return (
                <div
                  key={_id}
                  className="group relative rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5 starting:opacity-0 starting:translate-y-2 duration-300"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="size-12 sm:size-14 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-inner">
                      <span className="text-xl">📁</span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{titre}</h3>
                      <p className="text-xs text-neutral-500 truncate">
                        {typeLbl}
                        {client?.nom && norm(client?.type) !== "entreprise" && client?.prenom ? (
                          <> • {client.nom} {client.prenom}</>
                        ) : null}
                      </p>
                    </div>

                    <div className="ml-auto flex flex-wrap items-center gap-1.5 justify-end">
                      <span className="px-2 py-1 rounded-full text-[11px] font-medium ring-1 bg-neutral-100 text-neutral-700 ring-neutral-200">
                        {typeLbl}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-[11px] font-medium ring-1 ${badgeStatutCls}`}>
                        {statutLbl}
                      </span>
                    </div>
                  </div>

                  {/* Détails */}
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                    <div className="rounded-lg bg-neutral-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-neutral-500">📧 Email</span>
                      <span className="font-medium truncate max-w-[9rem]">{client?.email || "—"}</span>
                    </div>
                    <div className="rounded-lg bg-neutral-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-neutral-500">📞 Téléphone</span>
                      <span className="font-medium">{client?.telephone || "—"}</span>
                    </div>
                    <div className="rounded-lg bg-neutral-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-neutral-500">🏙️ Ville</span>
                      <span className="font-medium">{client?.adresse?.ville || "—"}</span>
                    </div>
                    <div className="rounded-lg bg-neutral-50 px-3 py-2 flex items-center justify-between">
                      <span className="text-neutral-500">📅 Créé le</span>
                      <span className="font-medium">
                        {client?.dateCreation ? new Date(client.dateCreation).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => openClientDetails(client)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
                    >
                      👁️ Détails
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
         {/* ===================== MODAL DÉTAIL CLIENT ===================== */}
      {showPopup && selectedClient && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm animate-[fade_.2s_ease] p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border bg-white shadow-2xl ring-1 ring-black/5 animate-[pop_.2s_ease] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER du modal */}
            <div className="flex items-start gap-3 p-5 border-b">
              <div className={`size-12 grid place-items-center rounded-xl text-white shadow-inner
                ${norm(selectedClient?.type) === "entreprise" ? "bg-gradient-to-br from-rose-400 to-amber-400" : "bg-gradient-to-br from-indigo-400 to-violet-500"}`}>
                <span className="font-bold text-lg">
                  {(selectedClient.nom || selectedClient.raisonSociale || "?").charAt(0).toUpperCase()}
                </span>
              </div>

              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">
                  {selectedClient.nom || selectedClient.raisonSociale}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200">
                    {badgeType(selectedClient)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-[11px] font-medium ring-1 ${
                    (selectedClient.statut === "Actif" || selectedClient.actif)
                      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
                      : "bg-rose-100 text-rose-700 ring-rose-200"
                  }`}>
                    {selectedClient.statut || (selectedClient.actif ? "Actif" : "Inactif")}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="ml-auto size-9 grid place-items-center rounded-lg border hover:bg-neutral-50 active:scale-95 transition"
                aria-label="Fermer"
              >
                ✖
              </button>
            </div>

            {/* CONTENU */}
            <div className="p-5 space-y-4">
              {/* Infos principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-neutral-500">📧 Email</div>
                  <div className="font-medium break-all">{selectedClient.email || "—"}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-neutral-500">📞 Téléphone</div>
                  <div className="font-medium">{selectedClient.telephone || "—"}</div>
                </div>
                <div className="rounded-xl border p-3 sm:col-span-2">
                  <div className="text-xs text-neutral-500">🏠 Adresse</div>
                  <div className="font-medium">
                    {selectedClient?.adresse?.rue || "—"}
                    <div className="text-neutral-600">
                      {(selectedClient?.adresse?.ville || "—")},{" "}
                      {selectedClient?.adresse?.codePostal || "—"}{" "}
                      {selectedClient?.adresse?.pays || "—"}
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-neutral-500">📅 Créé le</div>
                  <div className="font-medium">
                    {selectedClient.dateCreation
                      ? new Date(selectedClient.dateCreation).toLocaleString()
                      : "—"}
                  </div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-neutral-500">💰 Chiffre d’affaires</div>
                  <div className="font-semibold">{selectedClient.credit || 0} €</div>
                </div>
              </div>

              {/* Notes */}
              <div className="rounded-xl border bg-neutral-50 p-3">
                <div className="text-xs text-neutral-500 mb-1">📝 Notes</div>
                <div className="text-sm text-neutral-800">
                  {selectedClient.notes || "Aucune note"}
                </div>
              </div>

              {/* Dossiers liés (si présents) */}
              {(() => {
                const cid = String(selectedClient._id || selectedClient.id || "");
                const list = dossiersParClient.get(cid) || [];
                if (!list.length) return null;
                return (
                  <div className="rounded-xl border p-3">
                    <div className="text-sm font-semibold mb-2">📁 Dossiers liés ({list.length})</div>
                    <div className="divide-y">
                      {list.slice(0, 5).map((d) => (
                        <div key={d._id} className="py-2 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{d.titre || d.numero}</div>
                            <div className="text-[11px] text-neutral-500 truncate">
                              #{d.numero} • {d.type || "—"} • {d.statut || "—"}
                            </div>
                          </div>
                          <Link
                            to={`/dossiers/${d._id}`}
                            className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-neutral-50 active:scale-95 transition"
                          >
                            Ouvrir
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* FOOTER actions (optionnel) */}
   
          </div>
        </div>
      )}
      {/* =================== /MODAL =================== */}
    </div>
  );
}
