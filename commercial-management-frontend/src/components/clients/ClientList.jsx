// ClientList.jsx — version Tailwind responsive + animée (sans lib externe)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import clientService from "../../services/clientService";

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

const ClientList = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      const response = await clientService.getAll();
      if (response?.success) setClients(response.data);
      setLoading(false);
    };
    fetchClients();
  }, []);

  const normalize = (v) => (v ? String(v).toLowerCase() : "");

  const filteredClients = useMemo(() => {
    const q = normalize(searchTerm);
    return clients.filter((c) => {
      const matchesSearch =
        normalize(c.nom).includes(q) ||
        normalize(c.email).includes(q) ||
        normalize(c.adresse?.ville).includes(q);

      const matchesType = !typeFilter || normalize(c.type) === normalize(typeFilter);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "Actif" && (c.statut === "Actif" || c.actif === true)) ||
        (statusFilter === "Inactif" && (c.statut === "Inactif" || c.actif === false));

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [clients, searchTerm, typeFilter, statusFilter]);

  // Stats (avec compteur animé)
 // 1) Comptages (objet)
const stats = {
  total: clients.length,
  actifs: clients.filter(c => c.actif === true || c.statut === "Actif").length,
  entreprises: clients.filter(c => normalize(c.type) === "entreprise").length,
  particuliers: clients.filter(c => normalize(c.type) === "particulier").length,
};

// 2) Compteurs animés (nombres)
const totalDisplay = useCountUp(stats.total);
const actifsDisplay = useCountUp(stats.actifs);
const entrDisplay   = useCountUp(stats.entreprises);
const partDisplay   = useCountUp(stats.particuliers);

// 3) Données d’affichage (tableau) -> celui-ci qu’on .map
const statCards = [
  { label: "Clients totaux", value: totalDisplay, icon: "👥", bg: "from-blue-500/10 to-blue-500/5",     glow: "from-blue-400/40" },
  { label: "Clients actifs", value: actifsDisplay, icon: "✅", bg: "from-emerald-500/10 to-emerald-500/5", glow: "from-emerald-400/40" },
  { label: "Entreprises",    value: entrDisplay,   icon: "🏢", bg: "from-amber-500/10 to-amber-500/5",   glow: "from-amber-400/40" },
  { label: "Particuliers",   value: partDisplay,   icon: "👤", bg: "from-violet-500/10 to-violet-500/5", glow: "from-violet-400/40" },
];


  const handleShowDetails = (client) => {
    setSelectedClient(client);
    setShowPopup(true);
  };
  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setConfirmDelete(true);
  };
  const handleDeleteConfirm = async () => {
    try {
      const res = await clientService.delete(clientToDelete._id);
      if (res?.success) {
        setClients((prev) => prev.filter((c) => c._id !== clientToDelete._id));
        setConfirmDelete(false);
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 1800);
      } else {
        alert("❌ Erreur lors de la suppression.");
      }
    } catch {
      alert("⚠️ Erreur serveur.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="rounded-xl border bg-white px-6 py-4 shadow-sm flex items-center gap-3">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin" />
          <span className="text-sm text-neutral-600">Chargement des clients…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
    
{/* Header */}
<div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
  <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:h-16 sm:py-0 pt-[env(safe-area-inset-top)]
                  flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    {/* Icône + titre */}
    <div className="flex items-center gap-3 min-w-0">
      <div className="size-10 grid place-items-center rounded-2xl
                      bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-inner">
        <span className="text-lg">🧑‍🤝‍🧑</span>
      </div>
      <div className="min-w-0">
        <h1 className="text-base sm:text-xl font-bold tracking-tight truncate">
          Gestion des Clients
        </h1>
        <p className="text-[11px] sm:text-sm text-neutral-500 -mt-0.5 truncate">
          Managez votre portefeuille clients
        </p>
      </div>
    </div>

    {/* Actions */}
   <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-end gap-2">
          <button
  onClick={() => navigate("/dashboard/clients/nouveau")}
  className="inline-flex items-center justify-center w-full sm:w-auto gap-1
             rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white
             shadow hover:bg-blue-700 active:scale-[.98] transition whitespace-nowrap"
>
  <span className="text-base">＋</span> Nouveau Client
</button>
  
  
    </div>
  </div>
</div>


      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
     {/* Stats */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
  {statCards.map((s, i) => (
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
            {s.value.toLocaleString()}
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
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end rounded-2xl border bg-white p-3.5 sm:p-4 shadow-sm">
          <div className="flex-1">
            <label className="text-xs text-neutral-500">Recherche</label>
            <div className="mt-1 flex items-center gap-2 rounded-xl border px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/30">
              <span className="text-neutral-400">🔍</span>
              <input
                className="w-full outline-none placeholder:text-neutral-400 text-sm"
                placeholder="Rechercher un client…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:w-[360px]">
            <div>
              <label className="text-xs text-neutral-500">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Tous les types</option>
                <option value="entreprise">Entreprise</option>
                <option value="particulier">Particulier</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Tous les statuts</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid clients */}
        {filteredClients.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-semibold">Aucun client trouvé</h3>
            <p className="text-sm text-neutral-500">Aucun client ne correspond à vos critères.</p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("");
                  setStatusFilter("");
                }}
              >
                Réinitialiser les filtres
              </button>
             <button
  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
  onClick={() => navigate("/dashboard/clients/nouveau")}
>
  Ajouter un client
</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((client) => {
              const isEntreprise = normalize(client.type) === "entreprise";
              const badgeColor =
                client.actif || client.statut === "Actif" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700";
              const avatarGradient = isEntreprise
                ? "from-rose-400 to-amber-300"
                : "from-indigo-400 to-violet-500";

              return (
    <div
  key={client._id || client.id}
  className="group relative rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5"
>
  {/* header */}
  <div className="flex items-center gap-3">
    <div
      className={`size-12 sm:size-14 rounded-xl text-white grid place-items-center bg-gradient-to-br ${avatarGradient} shadow-inner`}
    >
      <span className="font-bold text-lg">
        {(client.nom || "?").charAt(0).toUpperCase()}
      </span>
    </div>

    <div className="min-w-0">
      <h3 className="font-semibold truncate">{client.nom}</h3>
      <p className="text-xs text-neutral-500 truncate">{client.email}</p>
    </div>

    {/* badges + delete alignés à droite */}
    <div className="ml-auto flex items-center gap-1.5">
      <span className={`px-2 py-1 rounded-full text-[11px] font-medium ${badgeColor}`}>
        {client.statut || (client.actif ? "Actif" : "Inactif")}
      </span>
      <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700">
        {client.type || "—"}
      </span>

      {/* bouton poubelle (discret / visible au hover desktop) */}
      <button
        onClick={() => handleDeleteClick(client)}
        className="
          relative inline-flex items-center justify-center size-9
          rounded-full border bg-white/90 text-neutral-500
          hover:text-rose-600 hover:bg-rose-50 shadow-sm hover:shadow
          active:scale-95 transition
          opacity-100 md:opacity-0 md:group-hover:opacity-100
          focus:opacity-100 focus:outline-none
        "
        title="Supprimer"
        aria-label="Supprimer le client"
      >
        {/* icône poubelle en SVG (meilleure netteté que l’emoji) */}
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1l-1 12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3L5 7H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1zm2 0v1h2V3h-2zM7 7l1 12a1 1 0 0 0 1 .9h6a1 1 0 0 0 1-.9L17 7H7zm3 3a1 1 0 0 1 2 0v7a1 1 0 1 1-2 0v-7zm4 0a1 1 0 1 1 2 0v7a1 1 0 1 1-2 0v-7z"/>
        </svg>
      </button>
    </div>
  </div>

                  {/* details */}
                  <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <span className="text-neutral-700">{client.telephone || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏙️</span>
                      <span className="text-neutral-700">
                        {client.adresse?.ville || "—"}, {client.adresse?.pays || "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span className="text-neutral-700">{client.credit || 0} DNT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span className="text-neutral-700">
                        Créé le {client.dateCreation ? new Date(client.dateCreation).toLocaleString() : "—"}
                      </span>
                    </div>
                  </div>

                  {/* actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => handleShowDetails(client)}
                      className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
                    >
                      👁️ Détails
                    </button>
                   <button
  onClick={() => navigate(`/dashboard/clients/${client._id}/modifier`)}
  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
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

      {/* Modal détail */}
      {showPopup && selectedClient && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm animate-[fade_.2s_ease] p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border bg-white p-5 shadow-xl animate-[pop_.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{selectedClient.nom}</h2>
                <p className="text-xs text-neutral-500">{selectedClient.type}</p>
              </div>
              <button
                className="size-8 grid place-items-center rounded-lg border hover:bg-neutral-50"
                onClick={() => setShowPopup(false)}
              >
                ✖
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <section>
                <h4 className="font-medium mb-1">📞 Informations de contact</h4>
                <p>
                  <strong>Email : </strong>
                  {selectedClient.email}
                </p>
                <p>
                  <strong>Téléphone : </strong>
                  {selectedClient.telephone || "—"}
                </p>
              </section>

              <section>
                <h4 className="font-medium mb-1">🏠 Adresse</h4>
                <p>{selectedClient.adresse?.rue || "—"}</p>
                <p>
                  {selectedClient.adresse?.ville || "—"}, {selectedClient.adresse?.pays || "—"}
                </p>
              </section>

              <section>
                <h4 className="font-medium mb-1">💼 Informations Commerciales</h4>
                <p className="flex items-center gap-2">
                  <strong>Statut : </strong>
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                      selectedClient.statut === "Actif" || selectedClient.actif
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {selectedClient.statut || (selectedClient.actif ? "Actif" : "Inactif")}
                  </span>
                </p>
                <p>
                  <strong>Créé le : </strong>
                  {selectedClient.dateCreation ? new Date(selectedClient.dateCreation).toLocaleString() : "—"}
                </p>
                <p>
                  <strong>Chiffre d’affaires : </strong>
                  {selectedClient.credit || 0} DNT
                </p>
              </section>

              <section>
                <h4 className="font-medium mb-1">📝 Notes</h4>
                <p className="text-neutral-700">{selectedClient.notes || "Aucune note"}</p>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmation suppression */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm animate-[fade_.2s_ease] p-4"
          onClick={() => setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl animate-[pop_.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold">⚠️ Confirmation</h3>
            <p className="mt-2 text-sm">
              Voulez-vous vraiment supprimer le client{" "}
              <strong>{clientToDelete?.nom}</strong> ?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50" onClick={() => setConfirmDelete(false)}>
                Annuler
              </button>
              <button
                className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-rose-700"
                onClick={handleDeleteConfirm}
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast succès */}
      {deleteSuccess && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-xl border bg-white px-4 py-3 shadow-lg animate-[pop_.2s_ease]">
            <div className="text-sm">
              <span className="mr-1">✅</span> Client supprimé avec succès.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;

