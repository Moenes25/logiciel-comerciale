// UserList.jsx — Tailwind responsive + animé (logique inchangée)
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const roleTint = (roleLisible) => {
  switch (roleLisible) {
    case "Administrateur":
      return "bg-purple-100 text-purple-700 ring-purple-200";
    case "Commercial":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    default:
      return "bg-blue-100 text-blue-700 ring-blue-200"; // Utilisateur
  }
};

const statusBg = (statut) =>
  statut === "Actif"
    ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
    : "bg-rose-100 text-rose-700 ring-rose-200";

const initials = (prenom = "", nom = "") =>
  `${(prenom[0] || "?").toUpperCase()}${(nom[0] || "").toUpperCase()}`;

const UserList = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://logiciel-commercial-backend-production.up.railway.app/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formattedUsers = response.data.map((u) => ({
          id: u._id,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          telephone: u.telephone || "-",
          role:
            u.role === "admin"
              ? "Administrateur"
              : u.role === "manager"
              ? "Commercial"
              : u.role === "vendeur"
              ? "Utilisateur"
              : "Utilisateur",
          statut: u.actif ? "Actif" : "Inactif",
          dateCreation: new Date(u.dateCreation).toLocaleDateString(),
          derniereConnexion: "-",
        }));

        setUsers(formattedUsers);
      } catch (e) {
        console.error("Erreur lors du chargement des utilisateurs :", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter || user.statut === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });
  // mini compteur animé (sans lib)
function useCountUp(value, { duration = 700, fps = 60 } = {}) {
  const [display, setDisplay] = React.useState(0);
  const raf = React.useRef(null);

  React.useEffect(() => {
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


  const stats = {
    total: users.length,
    active: users.filter((u) => u.statut === "Actif").length,
    admins: users.filter((u) => u.role === "Administrateur").length,
    commercials: users.filter((u) => u.role === "Commercial").length,
  };
  // compteurs animés
const totalDisplay  = useCountUp(stats.total);
const actifDisplay  = useCountUp(stats.active);
const adminDisplay  = useCountUp(stats.admins);
const commDisplay   = useCountUp(stats.commercials);

// mêmes tons/glows que tes autres pages
const statCards = [
  { label: "Utilisateurs totaux", value: totalDisplay, icon: "👥", glow: "from-sky-400/40",     bg: "from-sky-500/10 to-sky-500/5",     onClick: () => { setRoleFilter(""); setStatusFilter(""); } },
  { label: "Utilisateurs actifs", value: actifDisplay, icon: "✅", glow: "from-emerald-400/40", bg: "from-emerald-500/10 to-emerald-500/5", onClick: () => setStatusFilter("Actif") },
  { label: "Administrateurs",     value: adminDisplay, icon: "👑", glow: "from-violet-400/40",  bg: "from-violet-500/10 to-violet-500/5",  onClick: () => setRoleFilter("Administrateur") },
  { label: "Commerciaux",         value: commDisplay,  icon: "💼", glow: "from-amber-400/40",   bg: "from-amber-500/10 to-amber-500/5",   onClick: () => setRoleFilter("Commercial") },
];


  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">
            Chargement des utilisateurs…
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="size-10 grid place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-inner">
              <span className="text-lg">👥</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                Gestion des Utilisateurs
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
                Managez les accès et permissions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
              onClick={() => navigate("/dashboard/users/nouveau")}
            >
              <span className="text-base">＋</span> Nouvel Utilisateur
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Stats */}
      {/* Stats — même style que les autres pages */}
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
  {statCards.map((s, i) => (
    <button
      key={i}
      onClick={s.onClick}
      className="
        group relative rounded-3xl border border-black/5 bg-white
        p-5 md:p-7 min-h-28 h-full text-left
        shadow-md shadow-black/5 ring-1 ring-black/5
        transition transform-gpu
        hover:-translate-y-1 md:hover:scale-[1.01]
        hover:shadow-2xl hover:shadow-black/10 hover:ring-2 hover:ring-black/10
        starting:opacity-0 starting:translate-y-2 duration-500
        overflow-hidden
      "
    >
      {/* halo doux */}
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
            {Number(s.value).toLocaleString()}
          </div>
          <div className="mt-0.5 text-[11px] sm:text-xs uppercase tracking-wide text-neutral-500 truncate">
            {s.label}
          </div>
        </div>
      </div>

      {/* liseré intérieur */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/40" />
    </button>
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
                placeholder="Rechercher un utilisateur…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full outline-none placeholder:text-neutral-400 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:w-[420px]">
            <div>
              <label className="text-xs text-neutral-500">Rôle</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="">Tous les rôles</option>
                <option value="Administrateur">Administrateur</option>
                <option value="Commercial">Commercial</option>
                <option value="Utilisateur">Utilisateur</option>
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

        {/* Grid users */}
        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm starting:opacity-0 starting:translate-y-2 duration-300">
            <div className="text-5xl mb-2">👥</div>
            <h3 className="font-semibold">Aucun utilisateur trouvé</h3>
            <p className="text-sm text-neutral-500">
              Aucun utilisateur ne correspond à vos critères de recherche.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
                onClick={() => navigate("/dashboard/users/nouveau")}
              >
                + Créer un utilisateur
              </button>
              <button
                className="rounded-lg border px-3.5 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("");
                  setStatusFilter("");
                }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="group relative rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5 starting:opacity-0 starting:translate-y-2 duration-300"
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="size-12 sm:size-14 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-400 to-blue-500 text-white shadow-inner">
                    <span className="font-semibold">{initials(user.prenom, user.nom)}</span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                  </div>

                  <div className="ml-auto flex flex-wrap items-center gap-1.5 justify-end">
                    <span
                      className={[
                        "px-2 py-1 rounded-full text-[11px] font-medium ring-1",
                        statusBg(user.statut),
                      ].join(" ")}
                      title={`Statut: ${user.statut}`}
                    >
                      {user.statut}
                    </span>
                    <span
                      className={[
                        "px-2 py-1 rounded-full text-[11px] font-medium ring-1",
                        roleTint(user.role),
                      ].join(" ")}
                      title={`Rôle: ${user.role}`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 space-y-2 text-sm">
                  <div className="rounded-lg bg-neutral-50 px-3 py-2 flex items-center justify-between">
                    <span className="text-neutral-500">📞 Téléphone</span>
                    <span className="font-medium">{user.telephone}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-50 px-3 py-2 flex items-center justify-between">
                    <span className="text-neutral-500">📅 Créé le</span>
                    <span className="font-medium">{user.dateCreation}</span>
                  </div>
                  <div className="rounded-lg bg-neutral-50 px-3 py-2 flex items-center justify-between">
                    <span className="text-neutral-500">🕐 Dernière connexion</span>
                    <span className="font-medium">{user.derniereConnexion}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
                    onClick={() => navigate(`/dashboard/users/${user.id}`)}
                  >
                    👁️ Détails
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
                    onClick={() => navigate(`/dashboard/users/${user.id}/modifier`)}
                  >
                    ✏️ Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action bar mobile (collante) */}
      <div className="sm:hidden sticky bottom-3 z-10">
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl border bg-white/95 backdrop-blur p-2 shadow-lg flex items-center gap-2">
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("");
                setStatusFilter("");
              }}
              className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => navigate("/dashboard/users/nouveau")}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow active:scale-[.98] transition"
            >
              + Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserList;
