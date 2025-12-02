// FournisseurDetails.jsx — Tailwind (responsive + animé, même logique)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import fournisseurService from "../../services/fournisseurService";

const FournisseurDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFournisseur = async () => {
      try {
        const res = await fournisseurService.getById(id);
        if (res.success) setFournisseur(res.data);
      } catch (e) {
        console.error("Erreur lors du chargement du fournisseur", e);
      } finally {
        setLoading(false);
      }
    };
    fetchFournisseur();
  }, [id]);

  const statutTint = (actif) =>
    actif
      ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
      : "bg-rose-100 text-rose-700 ring-rose-200";

  const typeIcon = (type) => {
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

  const stars = (note = 0) => {
    const n = Math.max(0, Math.min(5, Math.round(note)));
    return "★".repeat(n) + "☆".repeat(5 - n);
  };

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

  if (!fournisseur) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="rounded-xl border bg-white px-6 py-5 shadow-sm text-center">
          <div className="text-4xl mb-2">🏢</div>
          <div className="font-semibold">Fournisseur non trouvé</div>
          <p className="text-sm text-neutral-500 mt-1">Vérifiez l’URL ou retournez à la liste.</p>
          <div className="mt-4">
            <Link
              to="/dashboard/fournisseurs"
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 transition"
            >
              ← Liste Fournisseurs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const dateOrDash = (d) => (d ? new Date(d).toLocaleDateString() : "—");

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="size-10 grid place-items-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-inner">
              <span className="text-lg">{typeIcon(fournisseur.type)}</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {fournisseur.raisonSociale}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
                Détails du fournisseur
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/dashboard/fournisseurs"
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 transition"
            >
              ← Liste Fournisseurs
            </Link>
            <button
              onClick={() => navigate(`/dashboard/fournisseurs/${id}/modifier`)}
              className="inline-flex items-center gap-1 bg-blue-600 rounded-lg  px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-600 active:scale-[.98] transition"
            >
              ✏️ Modifier
            </button>
            
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Bandeau résumé */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 starting:opacity-0 starting:translate-y-2 duration-300">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">Type</div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xl">{typeIcon(fournisseur.type)}</span>
              <span className="font-semibold">{fournisseur.type || "—"}</span>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">Statut</div>
            <div className="mt-1">
              <span
                className={[
                  "inline-flex items-center px-2 py-1 rounded-full text-[12px] font-medium ring-1",
                  statutTint(!!fournisseur.actif),
                ].join(" ")}
              >
                {fournisseur.actif ? "Actif" : "Inactif"}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="text-xs text-neutral-500">Note</div>
            <div className="mt-1 font-semibold">
              {stars(fournisseur.rate || 0)}{" "}
              <span className="text-neutral-500">({fournisseur.rate || 0}/5)</span>
            </div>
          </div>
        </div>

        {/* Cartes infos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Informations générales */}
          <div className="group relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Informations Générales</h3>
              <span className="text-neutral-300">📄</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-neutral-50 px-3 py-2">
                <div className="text-neutral-500">Nom</div>
                <div className="font-medium">{fournisseur.raisonSociale || "—"}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 px-3 py-2">
                <div className="text-neutral-500">SIRET / Matricule</div>
                <div className="font-medium">{fournisseur.matriculeFiscale || "—"}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 px-3 py-2">
                <div className="text-neutral-500">Date d’ajout</div>
                <div className="font-medium">{dateOrDash(fournisseur.dateCreation)}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 px-3 py-2">
                <div className="text-neutral-500">Dernière MAJ</div>
                <div className="font-medium">{dateOrDash(fournisseur.dateModification)}</div>
              </div>
              {fournisseur.notes && (
                <div className="sm:col-span-2 rounded-lg bg-neutral-50 px-3 py-2">
                  <div className="text-neutral-500">Notes</div>
                  <div className="font-medium text-neutral-700">{fournisseur.notes}</div>
                </div>
              )}
            </div>
          </div>

          {/* Coordonnées */}
          <div className="group relative rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Coordonnées</h3>
              <span className="text-neutral-300">📬</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-neutral-50 px-3 py-2">
                <div className="text-neutral-500">Email</div>
                <div className="font-medium">{fournisseur.email || "—"}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 px-3 py-2">
                <div className="text-neutral-500">Téléphone</div>
                <div className="font-medium">{fournisseur.telephone || "—"}</div>
              </div>
              <div className="rounded-lg bg-neutral-50 px-3 py-2 sm:col-span-2">
                <div className="text-neutral-500">Adresse</div>
                <div className="font-medium">
                  {fournisseur.adresse?.rue || "—"}
                  <br />
                  {(fournisseur.adresse?.ville || "—") +
                    (fournisseur.adresse?.codePostal ? ` ${fournisseur.adresse?.codePostal}` : "")}
                  , {fournisseur.adresse?.pays || "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact principal */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Contact principal</h3>
            <span className="text-neutral-300">👤</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <div className="text-neutral-500">Nom</div>
              <div className="font-medium">
                {fournisseur.contactPrincipal?.nom || "—"}{" "}
                {fournisseur.contactPrincipal?.prenom || ""}
              </div>
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <div className="text-neutral-500">Email</div>
              <div className="font-medium">{fournisseur.contactPrincipal?.email || "—"}</div>
            </div>
            <div className="rounded-lg bg-neutral-50 px-3 py-2">
              <div className="text-neutral-500">Téléphone</div>
              <div className="font-medium">{fournisseur.contactPrincipal?.telephone || "—"}</div>
            </div>
          </div>
        </div>

        {/* Actions flottantes (mobile) */}
        <div className="sm:hidden sticky bottom-3 z-10">
          <div className="mx-auto max-w-7xl px-4">
            <div className="rounded-2xl border bg-white/95 backdrop-blur p-2 shadow-lg flex items-center gap-2">
              <button
                onClick={() => navigate(`/dashboard/fournisseurs/${id}/modifier`)}
                className="flex-1 rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white shadow active:scale-[.98] transition"
              >
                ✏️ Modifier
              </button>
              <button
                onClick={() =>
                  navigate("/produits/nouveau", { state: { fournisseurId: id } })
                }
                className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow active:scale-[.98] transition"
              >
                📦 Commander
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FournisseurDetails;
