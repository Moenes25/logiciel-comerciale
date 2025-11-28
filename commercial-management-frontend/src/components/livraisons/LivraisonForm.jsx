// LivraisonForm.jsx — Tailwind (responsive + animé) — même logique/données
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import livraisonService from "../../services/livraisonService";
import commandeService from "../../services/commandeService";

const LivraisonForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isVirtual = id.startsWith("virtual-");
  const isEdit = !isVirtual; // (non utilisé pour changer la logique, gardé pour compat)

  const [loading, setLoading] = useState(true);
  const [livraison, setLivraison] = useState(null);
  const [formData, setFormData] = useState({
    statut: "",
    livreur: "",
    modeLivraison: "",
    transporteur: "",
    numeroSuivi: "",
    datePreparation: "",
    dateExpedition: "",
    dateLivraisonPrevue: "",
    dateLivraisonReelle: "",
    fraisLivraison: 0,
    commentaires: "",
    adresseLivraison: { rue: "", ville: "", codePostal: "", pays: "" },
  });

  // 1) CHARGEMENT
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isVirtual) {
          const cmdId = id.replace("virtual-", "");
          const cmd = await commandeService.getById(cmdId);

          setLivraison({
            isVirtual: true,
            numero: "LIV-" + cmd.data.numero,
            commande: cmd.data,
            statut: cmd.data.statut,
            livreur: null,
            dateLivraison: cmd.data.dateCommande,
          });
        } else {
          const data = await livraisonService.getById(id);
          if (data) {
            setLivraison(data);
            setFormData({
              statut: data.statut || "",
              livreur: data.livreur || "",
              modeLivraison: data.modeLivraison || "",
              transporteur: data.transporteur || "",
              numeroSuivi: data.numeroSuivi || "",
              datePreparation: data.datePreparation?.split("T")[0] || "",
              dateExpedition: data.dateExpedition?.split("T")[0] || "",
              dateLivraisonPrevue: data.dateLivraisonPrevue?.split("T")[0] || "",
              dateLivraisonReelle: data.dateLivraisonReelle?.split("T")[0] || "",
              fraisLivraison: data.fraisLivraison || 0,
              commentaires: data.commentaires || "",
              adresseLivraison: {
                rue: data.adresseLivraison?.rue || "",
                ville: data.adresseLivraison?.ville || "",
                codePostal: data.adresseLivraison?.codePostal || "",
                pays: data.adresseLivraison?.pays || "",
              },
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // 2) GESTION DES CHAMPS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleAdresseChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      adresseLivraison: { ...prev.adresseLivraison, [name]: value },
    }));
  };

  // 3) SOUMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await livraisonService.update(id, formData);
      console.log("⬅️ RÉPONSE DU BACKEND :", updated);
      alert("Livraison modifiée avec succès !");
      navigate("/dashboard/livraisons");
    } catch (err) {
      console.error("Erreur update:", err);
      alert("Erreur lors de la mise à jour !");
    }
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
  if (!livraison) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="rounded-xl border bg-white px-6 py-5 shadow-sm">
          <div className="text-lg font-semibold">Erreur chargement.</div>
        </div>
      </div>
    );
  }

  const Header = () => (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">
            Modifier Livraison {livraison.numero}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
            Mettre à jour les informations de livraison
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/Livraisons", { relative: "path" })}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );

  const Section = ({ title, children, icon }) => (
    <div className="rounded-2xl border bg-white p-5 shadow-sm starting:opacity-0 starting:translate-y-2 duration-300">
      <h3 className="text-sm font-semibold text-neutral-700 mb-3">
        <span className="mr-1">{icon}</span> {title}
      </h3>
      {children}
    </div>
  );

  const Field = ({ label, children, className = "" }) => (
    <div className={`space-y-1 ${className}`}>
      <label className="text-xs text-neutral-500">{label}</label>
      {children}
    </div>
  );

  const inputBase =
    "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30";

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Header />

      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Infos livraison */}
        <Section title="Informations Livraison" icon="📦">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Statut">
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className={inputBase}
              >
                <option value="en_preparation">En préparation</option>
                <option value="expediee">Expédiée</option>
                <option value="en_livraison">En livraison</option>
                <option value="livree">Livrée</option>
                <option value="retournee">Retournée</option>
              </select>
            </Field>

            <Field label="Livreur">
              <input
                name="livreur"
                type="text"
                value={formData.livreur}
                onChange={handleChange}
                placeholder="Nom du livreur"
                className={inputBase}
              />
            </Field>

            <Field label="Date Livraison prévue">
              <input
                name="dateLivraisonPrevue"
                type="date"
                value={formData.dateLivraisonPrevue}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>

            <Field label="Date Livraison réelle">
              <input
                name="dateLivraisonReelle"
                type="date"
                value={formData.dateLivraisonReelle}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>
          </div>
        </Section>

        {/* Logistique */}
        <Section title="Informations Logistiques" icon="🚚">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Field label="Mode de Livraison">
              <select
                name="modeLivraison"
                value={formData.modeLivraison}
                onChange={handleChange}
                className={inputBase}
              >
                <option value="">Sélectionnez</option>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="retrait_magasin">Retrait magasin</option>
              </select>
            </Field>

            <Field label="Transporteur">
              <input
                name="transporteur"
                type="text"
                value={formData.transporteur}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>

            <Field label="Numéro de suivi">
              <input
                name="numeroSuivi"
                type="text"
                value={formData.numeroSuivi}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>

            <Field label="Date préparation">
              <input
                name="datePreparation"
                type="date"
                value={formData.datePreparation}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>

            <Field label="Date expédition">
              <input
                name="dateExpedition"
                type="date"
                value={formData.dateExpedition}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>

            <Field label="Frais de livraison">
              <input
                name="fraisLivraison"
                type="number"
                step="0.1"
                value={formData.fraisLivraison}
                onChange={handleChange}
                className={inputBase}
              />
            </Field>

            <Field label="Commentaires" className="sm:col-span-2 lg:col-span-3">
              <textarea
                name="commentaires"
                rows="3"
                value={formData.commentaires}
                onChange={handleChange}
                className={inputBase}
                placeholder="Notes ou consignes…"
              />
            </Field>
          </div>
        </Section>

        {/* Adresse */}
        <Section title="Adresse de livraison" icon="📍">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Rue" className="lg:col-span-2">
              <input
                name="rue"
                type="text"
                value={formData.adresseLivraison.rue}
                onChange={handleAdresseChange}
                className={inputBase}
              />
            </Field>

            <Field label="Ville">
              <input
                name="ville"
                type="text"
                value={formData.adresseLivraison.ville}
                onChange={handleAdresseChange}
                className={inputBase}
              />
            </Field>

            <Field label="Code postal">
              <input
                name="codePostal"
                type="text"
                value={formData.adresseLivraison.codePostal}
                onChange={handleAdresseChange}
                className={inputBase}
              />
            </Field>

            <Field label="Pays">
              <input
                name="pays"
                type="text"
                value={formData.adresseLivraison.pays}
                onChange={handleAdresseChange}
                className={inputBase}
              />
            </Field>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            className="rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            onClick={() => navigate("/dashboard/livraisons")}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
          >
            Modifier Livraison
          </button>
        </div>
      </form>
    </div>
  );
};

export default LivraisonForm;
