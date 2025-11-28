// ClientForm.jsx — Tailwind (responsive + animé)
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import clientService from "../../services/clientService";
import "./Client1.css";

export default function ClientForm() {
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
    type: "Particulier",
    statut: "Actif",
    credit: 0,
    notes: "",
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef(null);

  // Charger client pour édition
  useEffect(() => {
    if (!isEdit) return;

    abortRef.current?.abort?.();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        const res = await clientService.getById(id, { signal: ctrl.signal });
        if (res.success) {
          const c = res.data;
          setFormData({
            nom: c.nom || "",
            email: c.email || "",
            telephone: c.telephone || "",
            adresse: c.adresse?.rue || "",
            ville: c.adresse?.ville || "",
            codePostal: c.adresse?.codePostal || "",
            pays: c.adresse?.pays || "Tunisie",
            type: (c.type || "Particulier").toLowerCase() === "entreprise" ? "Entreprise" : "Particulier",
            statut: c.actif ? "Actif" : "Inactif",
            notes: c.notes || "",
            credit: c.credit || 0,
          });
        } else {
          setError("Client non trouvé.");
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Erreur de chargement.");
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: name === "credit" ? Number(value) : value }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setSaving(true);
  setError("");

  const payload = {
    code: `CLT-${Date.now().toString().slice(-4)}`,
    nom: formData.nom,
    email: formData.email,
    telephone: formData.telephone,
    type: formData.type.toLowerCase(),
    adresse: {
      rue: formData.adresse,
      ville: formData.ville,
      codePostal: formData.codePostal,
      pays: formData.pays,
    },
    notes: formData.notes,
    actif: formData.statut === "Actif",
    credit: Number(formData.credit) || 0,
  };

  try {
    const res = isEdit
      ? await clientService.update(id, payload)
      : await clientService.create(payload);

    if (res?.success) {
      navigate("/dashboard/clients", { replace: true });
    } else {
      setError(res?.message || "Une erreur est survenue.");
    }
  } catch (err) {
    console.error(err);
    setError("Erreur de communication avec le serveur.");
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin" />
          <span className="text-sm text-neutral-600">Chargement des données client…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">{isEdit ? "Modifier Client" : "Nouveau Client"}</h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
              {isEdit ? "Modifiez les informations du client" : "Ajoutez un nouveau client à votre portefeuille"}
            </p>
          </div>
       
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 animate-[pop_.2s_ease]">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm animate-[pop_.2s_ease]"
        >
          {/* Section: base */}
          <Section title="Informations de Base">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Nom / Raison sociale *">
                <input
                  className="fx-input"
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  placeholder="Nom du client ou raison sociale"
                />
              </Field>

              <Field label="Email *">
                <input
                  className="fx-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="email@exemple.com"
                />
              </Field>

              <Field label="Téléphone *">
                <input
                  className="fx-input"
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  placeholder="+216  12 345 678"
                />
              </Field>

              <Field label="Type de client *">
                <select className="fx-input" name="type" value={formData.type} onChange={handleChange}>
                  <option>Particulier</option>
                  <option>Entreprise</option>
                </select>
              </Field>

              <Field label="Statut *">
                <select className="fx-input" name="statut" value={formData.statut} onChange={handleChange}>
                  <option>Actif</option>
                  <option>Inactif</option>
                </select>
              </Field>

              <Field label="Chiffre d’affaires (€)">
                <input
                  className="fx-input"
                  type="number"
                  name="credit"
                  value={formData.credit}
                  onChange={handleChange}
                  min={0}
                  placeholder="Ex: 12000"
                />
              </Field>
            </div>
          </Section>

          {/* Section: adresse */}
          <Section title="Adresse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Field label="Adresse" className="lg:col-span-1">
                <input
                  className="fx-input"
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Numéro et nom de rue"
                />
              </Field>

              <Field label="Ville">
                <input
                  className="fx-input"
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  placeholder="ville"
                />
              </Field>

              <Field label="Code Postal">
                <input
                  className="fx-input"
                  type="text"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handleChange}
                  placeholder="Code Postal"
                />
              </Field>

              <Field label="Pays">
                <select className="fx-input" name="pays" value={formData.pays} onChange={handleChange}>
                  <option>Tunisie</option>
                  <option>Autre</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Section: notes */}
          <Section title="Informations Complémentaires">
            <Field label="Notes" className="col-span-full">
              <textarea
                className="fx-input min-h-[120px]"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notes importantes sur le client…"
              />
            </Field>
          </Section>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
           <button
  type="button"
  onClick={() => navigate("/dashboard/clients")}
  className="rounded-lg border px-4 py-2.5 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
>
  Annuler
</button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving && <span className="size-3 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />}
              {isEdit ? "Modifier Client" : "Créer Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- petits composants UI ---------- */

function Section({ title, children }) {
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">{title}</h3>
      {children}
    </section>
  );
}

function Field({ label, className = "", children }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
