// FournisseurForm.jsx — Tailwind (responsive + animé, logique identique)
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fournisseurService from "../../services/fournisseurService";

const FournisseurForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    codePostal: "",
    pays: "Tunisie",
    siret: "",
    type: "Équipement IT",
    statut: "Actif",
    notes: "",
    rate: 4,
  });

  useEffect(() => {
    const fetchFournisseur = async () => {
      if (!isEdit) return;
      try {
        const res = await fournisseurService.getById(id);
        const f = res.data;
        setFormData({
          nom: f.raisonSociale || "",
          email: f.email || "",
          telephone: f.telephone || "",
          adresse: f.adresse?.rue || "",
          ville: f.adresse?.ville || "",
          codePostal: f.adresse?.codePostal || "",
          pays: f.adresse?.pays || "Tunisie",
          siret: f.matriculeFiscale || "",
          type: f.type || "Équipement IT",
          statut: f.actif ? "Actif" : "Inactif",
          notes: f.notes || "",
          rate: f.rate || 4,
        });
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement du fournisseur");
      }
    };
    fetchFournisseur();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fournisseurData = {
      raisonSociale: formData.nom,
      email: formData.email,
      telephone: formData.telephone,
      type: formData.type,
      actif: formData.statut === "Actif",
      matriculeFiscale: formData.siret,
      rate: formData.rate,
      adresse: {
        rue: formData.adresse,
        ville: formData.ville,
        codePostal: formData.codePostal,
        pays: formData.pays,
      },
      notes: formData.notes,
    };

    if (!isEdit) {
      fournisseurData.code = "FOUR-" + Date.now();
    }

    let response;
    if (isEdit) response = await fournisseurService.update(id, fournisseurData);
    else response = await fournisseurService.create(fournisseurData);

    if (!response.success) {
      alert("Erreur : " + response.message);
      return;
    }
    alert(isEdit ? "Fournisseur modifié !" : "Fournisseur créé !");
    navigate("/dashboard/fournisseurs");
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="size-10 grid place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-inner">
              <span className="text-lg">🏢</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                {isEdit ? "Modifier Fournisseur" : "Nouveau Fournisseur"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
                {isEdit
                  ? "Modifiez les informations du fournisseur"
                  : "Ajoutez un nouveau fournisseur à votre réseau"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 transition"
              onClick={() => navigate("/dashboard/fournisseurs")}
            >
              ← Retour
            </button>
            <button
              form="fournisseur-form"
              type="submit"
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
            >
              {isEdit ? "💾 Enregistrer" : "➕ Créer"}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        id="fournisseur-form"
        onSubmit={handleSubmit}
        className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6"
      >
        {/* Carte : Informations générales */}
        <div className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition starting:opacity-0 starting:translate-y-2 duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Informations Générales</h3>
            <span className="text-neutral-300">📋</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Nom */}
            <div>
              <label className="text-xs text-neutral-500">Nom du fournisseur *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData((p) => ({ ...p, nom: e.target.value }))}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Ex : TechCorp"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-neutral-500">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="contact@exemple.com"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="text-xs text-neutral-500">Téléphone *</label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => setFormData((p) => ({ ...p, telephone: e.target.value }))}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="+21 61 234 567"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-xs text-neutral-500">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Équipement IT">Équipement IT</option>
                <option value="Fournitures Bureau">Fournitures Bureau</option>
                <option value="Mobilier">Mobilier</option>
                <option value="Services">Services</option>
              </select>
            </div>

            {/* Statut */}
            <div>
              <label className="text-xs text-neutral-500">Statut *</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData((p) => ({ ...p, statut: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>

            {/* SIRET */}
            <div>
              <label className="text-xs text-neutral-500">Numéro SIRET</label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData((p) => ({ ...p, siret: e.target.value }))}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="123 456 789 00012"
              />
            </div>

            {/* Note */}
            <div>
              <label className="text-xs text-neutral-500">Note du fournisseur</label>
              <select
                value={formData.rate}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, rate: Number(e.target.value) }))
                }
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="1">⭐ 1</option>
                <option value="2">⭐⭐ 2</option>
                <option value="3">⭐⭐⭐ 3</option>
                <option value="4">⭐⭐⭐⭐ 4</option>
                <option value="5">⭐⭐⭐⭐⭐ 5</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carte : Adresse */}
        <div className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Adresse</h3>
            <span className="text-neutral-300">📍</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Rue (full) */}
            <div className="lg:col-span-4">
              <label className="text-xs text-neutral-500">Adresse *</label>
              <input
                type="text"
                value={formData.adresse}
                onChange={(e) => setFormData((p) => ({ ...p, adresse: e.target.value }))}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="12 rue des Fleurs"
              />
            </div>

            {/* Ville */}
            <div>
              <label className="text-xs text-neutral-500">Ville *</label>
              <input
                type="text"
                value={formData.ville}
                onChange={(e) => setFormData((p) => ({ ...p, ville: e.target.value }))}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Code postal */}
            <div>
              <label className="text-xs text-neutral-500">Code Postal *</label>
              <input
                type="text"
                value={formData.codePostal}
                onChange={(e) => setFormData((p) => ({ ...p, codePostal: e.target.value }))}
                required
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            {/* Pays */}
            <div>
              <label className="text-xs text-neutral-500">Pays *</label>
              <select
                value={formData.pays}
                onChange={(e) => setFormData((p) => ({ ...p, pays: e.target.value }))}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Tunisie">Tunisie</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Carte : Notes */}
        <div className="group rounded-2xl border bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Notes internes</h3>
            <span className="text-neutral-300">📝</span>
          </div>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Notes, conditions particulières, infos contact…"
            className="w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>

        {/* Actions (bas de page) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            onClick={() => navigate("/dashboard/fournisseurs")}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
          >
            {isEdit ? "💾 Modifier Fournisseur" : "➕ Créer Fournisseur"}
          </button>
        </div>
      </form>

      {/* Barre d’actions collante (mobile) */}
      <div className="sm:hidden sticky bottom-3 z-10">
        <div className="mx-auto max-w-5xl px-4">
          <div className="rounded-2xl border bg-white/95 backdrop-blur p-2 shadow-lg flex items-center gap-2">
            <button
              onClick={() => navigate("/dashboard/fournisseurs")}
              className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              Annuler
            </button>
            <button
              form="fournisseur-form"
              type="submit"
              className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow active:scale-[.98] transition"
            >
              {isEdit ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FournisseurForm;
