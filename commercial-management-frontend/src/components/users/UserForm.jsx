// UserForm.jsx — Tailwind UI (logique intacte)
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const roleToApi = (uiRole) =>
  uiRole === "Administrateur" ? "admin" : uiRole === "Commercial" ? "manager" : "vendeur";

const UserForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "Utilisateur",
    statut: "Actif",
    departement: "",
    poste: "",
  });

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      if (!isEdit) return;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://logiciel-commercial-backend-production.up.railway.app/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data;
        setFormData({
          nom: u.nom,
          prenom: u.prenom,
          email: u.email,
          telephone: u.telephone ?? "",
          role: u.role === "admin" ? "Administrateur" : u.role === "manager" ? "Commercial" : "Utilisateur",
          statut: u.actif ? "Actif" : "Inactif",
          departement: u.departement || "",
          poste: u.poste || "",
        });
      } catch (err) {
        console.error(err);
        alert("Impossible de charger l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const token = localStorage.getItem("token");

    const dataToSend = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      role: roleToApi(formData.role),
      actif: formData.statut === "Actif",
      departement: formData.departement,
      poste: formData.poste,
      password: !isEdit ? "password123" : undefined, // logique d’origine
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await axios.put(`https://logiciel-commercial-backend-production.up.railway.app/api/users/${id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Utilisateur modifié !");
      } else {
        await axios.post(`https://logiciel-commercial-backend-production.up.railway.app/api/users`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Utilisateur créé !");
      }
      navigate("/dashboard/users");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l’enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">Chargement des données utilisateur…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">
              {isEdit ? "Modifier Utilisateur" : "Nouvel Utilisateur"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
              {isEdit ? "Modifiez les informations utilisateur" : "Créez un nouveau compte utilisateur"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 transition"
              onClick={() => navigate("/dashboard/users")}
              type="button"
            >
              ← Retour
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        {/* Section 1 */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Informations Personnelles</h3>
            <span className="text-xs text-neutral-500">Champs obligatoires *</span>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-500">Nom *</label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Dupont"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Prénom *</label>
              <input
                type="text"
                name="prenom"
                required
                value={formData.prenom}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Marie"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="marie.dupont@exemple.com"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="+216 …"
              />
            </div>
          </div>
        </div>

        {/* Section 2 */}
        <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
          <h3 className="font-semibold">Informations Professionnelles</h3>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-neutral-500">Rôle *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Utilisateur">Utilisateur</option>
                <option value="Commercial">Commercial</option>
                <option value="Administrateur">Administrateur</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500">Statut *</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500">Département</label>
              <input
                type="text"
                name="departement"
                value={formData.departement}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Ventes, IT, RH…"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Poste</label>
              <input
                type="text"
                name="poste"
                value={formData.poste}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Responsable, Ingénieur…"
              />
            </div>
          </div>
        </div>

        {/* Section 3 (création uniquement) */}
        {!isEdit && (
          <div className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold">Sécurité</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Un mot de passe temporaire sera défini côté back (logique existante).
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-neutral-500">Mot de passe temporaire *</label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Mot de passe temporaire"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-500">Confirmation *</label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Confirmer le mot de passe"
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/users")}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.99] transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.99] disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {submitting && <span className="size-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />}
            {isEdit ? "Modifier Utilisateur" : "Créer Utilisateur"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
