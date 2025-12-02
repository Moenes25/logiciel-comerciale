// ProduitDetails.jsx — Tailwind responsive + animé (même logique/données)
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
// import "./Produits.css"; // ⬅️ plus nécessaire

export default function ProduitDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const location = useLocation();
  const goBack = () => navigate(location.state?.from ?? "/dashboard/produits");

  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeletedMessage, setShowDeletedMessage] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [showStockPopup, setShowStockPopup] = useState(false);
  const [newStock, setNewStock] = useState(0);

  /* ---------- fetch ---------- */
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`https://logiciel-commercial-backend-production.up.railway.app/api/produits/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProduit(res.data);
      } catch (err) {
        console.error(err);
        setError("Produit non trouvé ou erreur serveur.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (produit?.stock?.quantite != null) setNewStock(produit.stock.quantite);
  }, [produit]);

  /* ---------- utils visuels ---------- */
  const getCategoryIcon = (categorie) => {
    const icons = {
      Informatique: "💻",
      Mobile: "📱",
      Audio: "🎧",
      Périphériques: "🖱️",
      Bureautique: "📎",
      Électroménager: "🏠",
    };
    return icons[categorie] || "📦";
  };

  const stockInfo = (() => {
    const q = produit?.stock?.quantite ?? 0;
    const min = produit?.stock?.stockMin ?? 0;
    if (q === 0) return { label: "rupture", icon: "❌", chip: "bg-rose-100 text-rose-700", dot: "bg-rose-500" };
    if (q <= min) return { label: "faible", icon: "⚠️", chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500" };
    return { label: "bon", icon: "✅", chip: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" };
  })();

  const calculateMarge = () => {
    const pa = produit?.prixAchat ?? 0;
    const pv = produit?.prixVente ?? 0;
    if (!pa) return "0.0";
    return (((pv - pa) / pa) * 100).toFixed(1);
  };

  const calculateValeurStock = () => {
    const pa = produit?.prixAchat ?? 0;
    const q = produit?.stock?.quantite ?? 0;
    return (pa * q).toFixed(2);
  };

  /* ---------- actions ---------- */
  const handleAjusterStock = () => setShowStockPopup(true);
  const handleEdit = () =>navigate(`/dashboard/produits/${produit._id}/modifier`);
 
  const handleDelete = () => setShowConfirm(true);

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://logiciel-commercial-backend-production.up.railway.app/api/produits/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setShowConfirm(false);
      setShowDeletedMessage(true);
     navigate("/dashboard/produits", { replace: true });
    } catch (err) {
      console.error(err);
      setShowConfirm(false);
    }
  };

  const handleDuplicate = () => setShowDuplicateConfirm(true);
  const confirmDuplicate = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = { ...produit };
      delete data._id;
      delete data.reference;
      delete data.dateCreation;
      delete data.dateModification;
      data.reference = `PROD-${Date.now()}`;
      await axios.post("https://logiciel-commercial-backend-production.up.railway.app/api/produits", data, { headers: { Authorization: `Bearer ${token}` } });
      setShowDuplicateConfirm(false);
      alert("Produit dupliqué avec succès !");
      navigate("/produits");
    } catch (err) {
      console.error(err);
      setShowDuplicateConfirm(false);
    }
  };

  /* ---------- states UI ---------- */
  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-500 animate-spin" />
          <span className="text-sm text-neutral-600">Chargement du produit…</span>
        </div>
      </div>
    );
  }

  if (error || !produit) {
    return (
      <div className="min-h-dvh bg-neutral-50 grid place-items-center p-4">
        <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
          <div className="text-4xl mb-2">📦</div>
          <h3 className="font-semibold mb-1">Produit non trouvé</h3>
          <p className="text-sm text-neutral-600 mb-4">{error || "Le produit que vous recherchez n’existe pas."}</p>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
            onClick={goBack}
          >
            ← Retour aux produits
          </button>
        </div>
      </div>
    );
  }

  /* ---------- view ---------- */
  const qte = produit?.stock?.quantite ?? 0;
  const min = produit?.stock?.stockMin ?? 0;
  const progress = Math.max(0, Math.min(100, Math.round((qte / Math.max(1, min * 3)) * 100)));

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 py-3 sm:h-16 sm:py-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight">📦 Détails du Produit</h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">Informations complètes et gestion du produit</p>
          </div>
          <div className="w-full sm:w-auto grid grid-cols-2 gap-2">
            <button
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50"
            onClick={goBack}
            >
              ← Retour à la liste
            </button>
            <button
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
              onClick={handleEdit}
            >
              ✏️ Modifier
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Layout 2 colonnes */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4 lg:gap-6">
          {/* Colonne principale */}
          <div className="space-y-4 lg:space-y-6">
            {/* Informations générales */}
            <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold">📋 Informations Générales</h3>
                <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs ${stockInfo.chip}`}>
                  <span className={`size-2 rounded-full ${stockInfo.dot}`} />
                  {produit.statut || "—"}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom du produit">
                  <div className="text-base font-semibold">{produit.designation}</div>
                </Field>
                <Field label="Référence">
                  <code className="rounded-md bg-neutral-50 px-2 py-1 text-sm">{produit.reference}</code>
                </Field>

                <Field label="Catégorie">
                  <div className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5">
                    <span className="text-lg">{getCategoryIcon(produit.categorie)}</span>
                    <span className="text-sm">{produit.categorie || "—"}</span>
                  </div>
                </Field>
                <Field label="Fournisseur">
                  <div className="text-sm">{produit.fournisseur?.raisonSociale ?? "—"}</div>
                </Field>

                <Field label="Date création">
                  <div className="text-sm">{produit.dateCreation || "—"}</div>
                </Field>
                <Field label="Dernière modification">
                  <div className="text-sm">{produit.dateModification || "—"}</div>
                </Field>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Description</label>
                  <div className="rounded-xl border bg-neutral-50 p-3 text-sm text-neutral-700">
                    {produit.description || "—"}
                  </div>
                </div>
              </div>
            </section>

            {/* Caractéristiques techniques */}
            <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-base font-semibold">⚙️ Caractéristiques Techniques</h3>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Marque"><div className="text-sm">{produit.marque || "—"}</div></Field>
                <Field label="Modèle"><div className="text-sm">{produit.modele || "—"}</div></Field>
                <Field label="Poids"><div className="text-sm">{produit.poids ? `${produit.poids} kg` : "—"}</div></Field>
                <Field label="Dimensions"><div className="text-sm">{produit.dimensions || "—"}</div></Field>
                <Field label="Code-barres"><code className="rounded-md bg-neutral-50 px-2 py-1 text-sm">{produit.codeBarre || "—"}</code></Field>
                <Field label="Unité"><div className="text-sm">{produit.unite || "—"}</div></Field>
              </div>

              {Array.isArray(produit.caracteristiques) && produit.caracteristiques.length > 0 && (
                <div className="mt-5">
                  <h4 className="text-sm font-semibold mb-2">Caractéristiques détaillées</h4>
                  <ul className="space-y-1.5 text-sm text-neutral-700">
                    {produit.caracteristiques.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 lg:space-y-6">
            {/* Prix et rentabilité */}
            <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-base font-semibold">💰 Prix et Rentabilité</h3>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <PriceItem label="Prix d'achat HT" value={`${(produit.prixAchat ?? 0).toFixed(2)} DNT`} />
                <PriceItem label="Prix de vente HT" value={`${(produit.prixVente ?? 0).toFixed(2)} DNT`} strong />
                <PriceItem label="TVA" value={`${produit.tva ?? 0}%`} />
                <PriceItem
                  label="Prix de vente TTC"
                  value={`${(((produit.prixVente ?? 0) * (1 + (produit.tva ?? 0) / 100)) || 0).toFixed(2)} DNT`}
                />
                <PriceItem label="Marge brute" value={`${calculateMarge()}%`} badge="profit" />
                <PriceItem
                  label="Bénéfice unitaire"
                  value={`${(((produit.prixVente ?? 0) - (produit.prixAchat ?? 0)) || 0).toFixed(2)} DNT`}
                  badge="profit"
                />
              </div>
            </section>

            {/* Gestion des stocks */}
            <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-base font-semibold">📦 Gestion des Stocks</h3>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-xl">{stockInfo.icon}</span>
                <span className="text-sm text-neutral-700">Stock {stockInfo.label}</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-neutral-500">Stock actuel</div>
                  <div className="font-semibold">{qte} {produit.unite || ""}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-neutral-500">Stock minimum</div>
                  <div className="font-semibold">{min} {produit.unite || ""}</div>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="text-xs text-neutral-500">Valeur du stock</div>
                  <div className="font-semibold">{calculateValeurStock()} DNT</div>
                </div>
              </div>

              {/* barre de progression */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>0</span>
                  <span>Seuil: {min}</span>
                  <span>Max</span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-neutral-100 overflow-hidden border">
                  <div
                    className={`h-full rounded-full ${stockInfo.dot}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-1.5 text-xs text-neutral-600">Niveau: {progress}%</div>
              </div>
            </section>

            {/* Actions rapides */}
            <section className="rounded-2xl border bg-white p-5 sm:p-6 shadow-sm">
              <h3 className="text-base font-semibold">⚡ Actions Rapides</h3>
              <div className="mt-3 grid grid-cols-1 gap-2">
                <ActionBtn onClick={handleEdit} tone="primary" icon="✏️" text="Modifier le produit" />
                <ActionBtn onClick={handleAjusterStock} tone="success" icon="📦" text="Ajuster le stock" />
                <ActionBtn onClick={() => alert('À venir 🙂')} tone="info" icon="📊" text="Voir les statistiques" />
                <ActionBtn onClick={handleDuplicate} tone="warning" icon="🔄" text="Dupliquer le produit" />
                <ActionBtn onClick={handleDelete} tone="danger" icon="🗑️" text="Supprimer le produit" />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modaux */}
      {showConfirm && (
        <Modal onClose={() => setShowConfirm(false)} title="Confirmer la suppression">
          <p className="text-sm text-neutral-700">Êtes-vous sûr de vouloir supprimer ce produit ?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50" onClick={() => setShowConfirm(false)}>
              Annuler
            </button>
            <button
              className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              onClick={confirmDelete}
            >
              Oui, supprimer
            </button>
          </div>
        </Modal>
      )}

      {showDuplicateConfirm && (
        <Modal onClose={() => setShowDuplicateConfirm(false)} title="Confirmer la duplication">
          <p className="text-sm text-neutral-700">Voulez-vous vraiment dupliquer ce produit ?</p>
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50" onClick={() => setShowDuplicateConfirm(false)}>
              Annuler
            </button>
            <button
              className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
              onClick={confirmDuplicate}
            >
              Oui, dupliquer
            </button>
          </div>
        </Modal>
      )}

      {showStockPopup && (
        <Modal onClose={() => setShowStockPopup(false)} title="📦 Ajuster le Stock">
          <p className="text-sm text-neutral-700 mb-3">
            Quantité actuelle : <strong>{qte}</strong> {produit.unite || ""}
          </p>
          <input
            type="number"
            min={0}
            value={newStock}
            onChange={(e) => setNewStock(parseInt(e.target.value || "0", 10))}
            className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50" onClick={() => setShowStockPopup(false)}>
              Annuler
            </button>
            <button
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("token");
                  await axios.put(
                    `https://logiciel-commercial-backend-production.up.railway.app/api/produits/${produit._id}`,
                    { ...produit, stock: { ...produit.stock, quantite: newStock } },
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  setProduit((p) => ({ ...p, stock: { ...p.stock, quantite: newStock } }));
                  setShowStockPopup(false);
                  alert("Stock ajusté avec succès !");
                } catch (err) {
                  console.error(err);
                  alert("Une erreur est survenue.");
                }
              }}
            >
              ✅ Confirmer
            </button>
          </div>
        </Modal>
      )}

      {showDeletedMessage && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-xl border bg-white px-4 py-3 shadow-lg animate-[pop_.2s_ease]">
            <div className="text-sm"><span className="mr-1">✅</span> Produit supprimé avec succès.</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- petits composants ---------- */
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PriceItem({ label, value, strong, badge }) {
  return (
    <div className="rounded-xl border p-3">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className={`mt-0.5 ${strong ? "font-semibold" : ""} ${badge === "profit" ? "text-emerald-700" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function ActionBtn({ icon, text, onClick, tone = "primary" }) {
  const tones = {
    primary: "border bg-white hover:bg-neutral-50",
    success: "border bg-emerald-600 text-white hover:bg-emerald-700",
    info: "border bg-sky-600 text-white hover:bg-sky-700",
    warning: "border bg-amber-500 text-white hover:bg-amber-600",
    danger: "border bg-rose-600 text-white hover:bg-rose-700",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full inline-flex items-center justify-start gap-2 rounded-lg px-3 py-2 text-sm shadow-sm active:scale-[.99] transition ${tones[tone]}`}
    >
      <span>{icon}</span>
      <span className="font-medium">{text}</span>
    </button>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border bg-white p-5 shadow-xl animate-[pop_.2s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="size-8 grid place-items-center rounded-lg border hover:bg-neutral-50" onClick={onClose}>✖</button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
