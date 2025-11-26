// UserDetails.jsx — Tailwind UI (logique intacte)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

const roleTint = (role) => {
  switch (role) {
    case "Administrateur":
      return "bg-purple-100 text-purple-700 ring-purple-200";
    case "Commercial":
      return "bg-amber-100 text-amber-800 ring-amber-200";
    default:
      return "bg-blue-100 text-blue-700 ring-blue-200";
  }
};
const statusTint = (statut) =>
  statut === "Actif"
    ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
    : "bg-rose-100 text-rose-700 ring-rose-200";

const initials = (p = "", n = "") =>
  `${(p[0] || "?").toUpperCase()}${(n[0] || "").toUpperCase()}`;

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleResetPassword = () => {
    if (window.confirm("Réinitialiser le mot de passe ?")) {
      alert("Email envoyé !");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data: u } = await axios.get(`http://localhost:8000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formatted = {
          id: u._id,
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          telephone: u.telephone || "-",
          role: u.role === "admin" ? "Administrateur" : u.role === "manager" ? "Commercial" : "Utilisateur",
          statut: u.actif ? "Actif" : "Inactif",
          dateCreation: new Date(u.dateCreation).toLocaleDateString(),
          departement: u.departement || "-",
          poste: u.poste || "-",
          derniereConnexion: "-",
          permissions: u.permissions || [],
          historique: u.historique || [],
        };
        setUser(formatted);
      } catch (e) {
        console.error("Erreur chargement utilisateur:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

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
  if (!user) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="rounded-xl border bg-white px-6 py-5 shadow-sm">
          <div className="text-sm">Utilisateur non trouvé</div>
          <button
            className="mt-3 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
            onClick={() => navigate("/dashboard/users")}
          >
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl grid place-items-center bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-inner">
              <span className="text-lg font-semibold">{initials(user.prenom, user.nom)}</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {user.prenom} {user.nom}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">Détails de l’utilisateur</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/users"
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 transition"
            >
              ← Retour
            </Link>
            <button
              className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
              onClick={() => navigate(`/dashboard/users/${user.id}/modifier`)}
            >
              ✏️ Modifier
            </button>
            <button
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
              onClick={handleResetPassword}
            >
              🔄 Réinitialiser MDP
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Badges résumé */}
        <div className="flex flex-wrap items-center gap-2">
          <span className={["px-2.5 py-1 rounded-full text-xs font-medium ring-1", roleTint(user.role)].join(" ")}>
            {user.role}
          </span>
          <span className={["px-2.5 py-1 rounded-full text-xs font-medium ring-1", statusTint(user.statut)].join(" ")}>
            {user.statut}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium ring-1 bg-neutral-100 text-neutral-700 ring-neutral-200">
            Créé le {user.dateCreation}
          </span>
        </div>

        {/* Cartes d’info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Perso */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold">Informations Personnelles</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Nom complet</span>
                <span className="font-medium">{user.prenom} {user.nom}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Email</span>
                <span className="font-medium truncate max-w-[60%] text-right">{user.email}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Téléphone</span>
                <span className="font-medium">{user.telephone}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Poste</span>
                <span className="font-medium">{user.poste}</span>
              </div>
            </div>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold">Informations Professionnelles</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Rôle</span>
                <span className={["px-2 py-1 rounded-full text-[11px] font-medium ring-1", roleTint(user.role)].join(" ")}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Statut</span>
                <span className={["px-2 py-1 rounded-full text-[11px] font-medium ring-1", statusTint(user.statut)].join(" ")}>
                  {user.statut}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Département</span>
                <span className="font-medium">{user.departement}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-neutral-500">Dernière connexion</span>
                <span className="font-medium">{user.derniereConnexion}</span>
              </div>
            </div>
          </div>

          {/* Système */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold">Permissions & Système</h3>
            <div className="mt-3">
              <div className="text-sm text-neutral-500 mb-2">Permissions</div>
              <div className="flex flex-wrap gap-2">
                {user.permissions.length === 0 ? (
                  <span className="text-sm text-neutral-600">Aucune permission</span>
                ) : (
                  user.permissions.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-md text-xs font-medium bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200"
                    >
                      {p}
                    </span>
                  ))
                )}
              </div>
              <div className="mt-4">
                <button
                  onClick={handleResetPassword}
                  className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
                >
                  🔄 Réinitialiser le mot de passe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Historique */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Historique des Activités</h3>
            <span className="text-xs text-neutral-500">{user.historique.length} éléments</span>
          </div>
          {user.historique.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">Aucune activité trouvée.</p>
          ) : (
            <div className="mt-3 divide-y">
              {user.historique.map((h, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className="text-xs sm:text-sm text-neutral-500 w-40">{h.date}</div>
                  <div className="text-sm flex-1">{h.action}</div>
                  <div className="text-xs sm:text-sm text-neutral-500">par {h.utilisateur}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions bas de page */}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
            onClick={() => navigate(`/dashboard/users/${user.id}/modifier`)}
          >
            ✏️ Modifier
          </button>
          <button
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
            onClick={() => navigate("/dashboard/users")}
          >
            Terminer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
