// ClientDetails.jsx — version Tailwind (responsive + animée)
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    abortRef.current?.abort?.();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetch(`https://logiciel-commercial-backend-production.up.railway.app/api/clients/${id}`, {
          signal: ctrl.signal,
        });
        const data = await res.json();
        setClient(data);
      } catch (e) {
        if (e.name !== "AbortError") console.error("Erreur de chargement:", e);
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="rounded-xl border bg-white px-6 py-4 shadow-sm flex items-center gap-3">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin" />
          <span className="text-sm text-neutral-600">Chargement des détails client…</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="rounded-xl border bg-white px-6 py-5 shadow-sm">
          <div className="text-rose-600 font-semibold">Client non trouvé</div>
          <div className="mt-2">
            <Link to="/clients" className="text-blue-600 hover:underline">
              ← Retour à la liste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isActif = client.statut === "Actif" || client.actif === true;
  const isEntreprise = (client.type || "").toLowerCase() === "entreprise";
  const avatarGradient = isEntreprise
    ? "from-rose-400 to-amber-300"
    : "from-indigo-400 to-violet-500";

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">
              Détails du client
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
              Fiche et informations complètes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/clients"
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 transition"
            >
              ← Retour
            </Link>
            <button
              onClick={() => navigate(`/clients/${client._id}/modifier`)}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
            >
              ✏️ Modifier
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Carte identité */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div
              className={`size-16 sm:size-20 rounded-2xl grid place-items-center text-white bg-gradient-to-br ${avatarGradient} shadow-inner`}
            >
              <span className="text-2xl font-bold">
                {(client.nom || "?").charAt(0).toUpperCase()}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold leading-tight truncate">
                  {client.nom}
                </h2>
                <span
                  className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                    isActif
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {client.statut || (client.actif ? "Actif" : "Inactif")}
                </span>
                <span className="px-2 py-1 rounded-full text-[11px] font-medium bg-neutral-100 text-neutral-700">
                  {client.type || "—"}
                </span>
              </div>
              <p className="text-sm text-neutral-600 truncate mt-1">
                {client.email}
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <InfoRow icon="📞" label="Téléphone" value={client.telephone || "—"} />
                <InfoRow
                  icon="🏙️"
                  label="Ville / Pays"
                  value={`${client.adresse?.ville || "—"}, ${client.adresse?.pays || "—"}`}
                />
                <InfoRow
                  icon="📍"
                  label="Adresse"
                  value={client.adresse?.rue || "—"}
                />
                <InfoRow
                  icon="💰"
                  label="Chiffre d’affaires / Crédit"
                  value={`${client.chiffreAffaire ?? client.credit ?? 0} €`}
                />
                <InfoRow
                  icon="📅"
                  label="Créé le"
                  value={
                    client.dateCreation
                      ? new Date(client.dateCreation).toLocaleString()
                      : "—"
                  }
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => setShowPopup(true)}
                  className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
                >
                  👁️ Voir le résumé
                </button>
                <button
                  onClick={() => navigate(`/clients/${client._id}/modifier`)}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] transition"
                >
                  ✏️ Modifier
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold mb-2">📝 Notes</h3>
          <p className="text-sm text-neutral-700">
            {client.notes || "Aucune note."}
          </p>
        </div>
      </div>

      {/* Popup résumé (modal) */}
      {showPopup && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm animate-[fade_.2s_ease] p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border bg-white p-5 shadow-xl animate-[pop_.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold">{client.nom}</h2>
                <p className="text-xs text-neutral-500">{client.type}</p>
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
                <h4 className="font-medium mb-1">📞 Informations de Contact</h4>
                <p>
                  <strong>Email : </strong>
                  {client.email}
                </p>
                <p>
                  <strong>Téléphone : </strong>
                  {client.telephone || "—"}
                </p>
              </section>

              <section>
                <h4 className="font-medium mb-1">🏠 Adresse</h4>
                <p>{client.adresse?.rue || "—"}</p>
                <p>
                  {client.adresse?.ville || "—"}, {client.adresse?.pays || "—"}
                </p>
              </section>

              <section>
                <h4 className="font-medium mb-1">💼 Informations Commerciales</h4>
                <p className="flex items-center gap-2">
                  <strong>Statut : </strong>
                  <span
                    className={`px-2 py-1 rounded-full text-[11px] font-medium ${
                      isActif
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {client.statut || (client.actif ? "Actif" : "Inactif")}
                  </span>
                </p>
                <p>
                  <strong>Créé le : </strong>
                  {client.dateCreation
                    ? new Date(client.dateCreation).toLocaleString()
                    : "—"}
                </p>
                <p>
                  <strong>Chiffre d’affaires : </strong>
                  {client.chiffreAffaire ?? client.credit ?? 0} €
                </p>
              </section>

              <section>
                <h4 className="font-medium mb-1">📝 Notes</h4>
                <p className="text-neutral-700">{client.notes || "Aucune note"}</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* petit composant ligne info */
function InfoRow({ icon, label, value }) {
  return (
    <div className="rounded-xl border px-3 py-2 bg-neutral-50/40 hover:bg-neutral-50 transition">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="mt-0.5 flex items-center gap-2">
        <span className="text-base leading-none">{icon}</span>
        <span className="text-sm text-neutral-800">{value}</span>
      </div>
    </div>
  );
}
