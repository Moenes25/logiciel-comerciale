// CommandeDetails.jsx — Tailwind (responsive + animé) — même logique/données
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ImpressionService from "../../services/ImpressionService";
import commandeService from "../../services/commandeService";
import Swal from "sweetalert2";

export default function CommandeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commande, setCommande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMenuImprimer, setShowMenuImprimer] = useState(false);

  const icons = {
    en_cours: "📦",
    expediee: "🚚",
    livree: "✅",
    annulee: "❌",
    confirmee: "✔️",
  };

  // --- Fetch ---
  useEffect(() => {
    const fetchCommande = async () => {
      try {
        const res = await commandeService.getById(id);
        if (res.success) setCommande(res.data);
      } catch (e) {
        console.error("Erreur backend :", e);
      } finally {
        setLoading(false);
      }
    };
    fetchCommande();
  }, [id]);

  // --- Helpers statut/COULEUR ---
  const formatStatut = (statut) => {
    switch (statut) {
      case "en_cours":
        return "En traitement";
      case "confirmee":
        return "Confirmée";
      case "expediee":
        return "Expédiée";
      case "livree":
        return "Livrée";
      case "annulee":
        return "Annulée";
      default:
        return statut;
    }
  };

  const getStatutColor = (label) => {
    switch (label) {
      case "Confirmée":
        return "bg-emerald-100 text-emerald-700 ring-emerald-200";
      case "En traitement":
        return "bg-amber-100 text-amber-700 ring-amber-200";
      case "Expédiée":
        return "bg-violet-100 text-violet-700 ring-violet-200";
      case "Livrée":
        return "bg-blue-100 text-blue-700 ring-blue-200";
      case "Annulée":
        return "bg-rose-100 text-rose-700 ring-rose-200";
      default:
        return "bg-neutral-100 text-neutral-700 ring-neutral-200";
    }
  };

  // --- Changer statut (SweetAlert) ---
  const changerStatut = async (nouveauStatut) => {
    const confirmation = await Swal.fire({
      title: `${icons[nouveauStatut] || "ℹ️"} Changer le statut ?`,
      text: `Voulez-vous vraiment passer la commande en "${nouveauStatut}" ?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, changer",
      cancelButtonText: "Annuler",
      confirmButtonColor: "#0ea5ff",
      cancelButtonColor: "#ef4444",
    });
    if (!confirmation.isConfirmed) return;

    const res = await commandeService.changeStatus(id, nouveauStatut);
    if (res.success) {
      const updated = await commandeService.getById(id);
      if (updated.success) {
        setCommande(updated.data);
        Swal.fire({
          title: "Succès ✔️",
          text: "Statut mis à jour avec succès !",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
      }
    } else {
      Swal.fire({
        title: "Erreur ❌",
        text: "Impossible de changer le statut.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-6 py-4 shadow-sm">
          <span className="size-4 rounded-full border-2 border-neutral-300 border-t-neutral-600 animate-spin" />
          <span className="text-sm text-neutral-700">Chargement des détails commande…</span>
        </div>
      </div>
    );
  }

  if (!commande) {
    return (
      <div className="min-h-dvh grid place-items-center bg-neutral-50 p-6">
        <div className="rounded-2xl border bg-white px-6 py-8 shadow-sm text-center">
          <div className="text-4xl mb-2">🧾</div>
          <h3 className="font-semibold">Commande non trouvée</h3>
          <p className="text-sm text-neutral-500">La commande n’existe pas ou a été supprimée.</p>
          <button
            className="mt-4 rounded-lg border px-4 py-2 text-sm hover:bg-neutral-50"
          onClick={() => navigate("/dashboard/commandes")}
          >
            ← Liste des commandes
          </button>
        </div>
      </div>
    );
  }

  // -------- Calculs (identiques à ta logique) --------
  const totalHTBrut = commande.lignes?.reduce(
    (total, l) => total + l.quantite * l.prixUnitaire,
    0
  );

  const totalRemiseProduits = commande.lignes?.reduce(
    (total, l) => total + (l.prixUnitaire * l.quantite * (l.remise || 0)) / 100,
    0
  );

  const remiseGlobaleMontant = commande.remiseGlobale
    ? (totalHTBrut * commande.remiseGlobale) / 100
    : 0;

  const totalRemise = totalRemiseProduits + remiseGlobaleMontant;
  const totalHTNet = totalHTBrut - totalRemise;

  const totalTVA = commande.lignes?.reduce((total, l) => {
    const montantHTNet =
      l.prixUnitaire * l.quantite - (l.prixUnitaire * l.quantite * (l.remise || 0)) / 100;
    const tva = l.produit?.tva || 0;
    return total + (montantHTNet * tva) / 100;
  }, 0);

  const netAPayer = totalHTNet + totalTVA;

  const commandePourPDF = {
    ...commande,
    produits: commande.lignes.map((l) => {
      const brut = l.quantite * l.prixUnitaire;
      const rem = brut * (l.remise || 0) / 100;
      const htNet = brut - rem;
      const tvaPct = l.produit.tva || 0;
      const tvaMt = (htNet * tvaPct) / 100;
      return {
        code: l.produit.reference,
        designation: l.produit.designation,
        quantite: l.quantite,
        prixHT: l.prixUnitaire,
        remise: l.remise || 0,
        montantHTNet: htNet,
        tva: tvaPct,
        montantTTC: htNet + tvaMt,
      };
    }),
    totalHTBrut,
    remiseGlobaleMontant,
    totalRemise,
    totalHTNet,
    totalTVA,
    netAPayer,
  };

  // --- Impression/Téléchargement ---
  const handleImprimer = (type) => {
    if (type === "facture") ImpressionService.genererFacture(commandePourPDF);
    if (type === "bon-commande") ImpressionService.genererBonCommande(commandePourPDF);
    setShowMenuImprimer(false);
  };
  const handleTelechargerPDF = (type) => {
    ImpressionService.telechargerPDF(commandePourPDF, type);
    setShowMenuImprimer(false);
  };

  const statutLabel = formatStatut(commande.statut);

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* HEADER sticky */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight truncate">
              Commande {commande.numero}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">Détails de la commande</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/dashboard/commandes"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              ← Liste Commandes
            </Link>

            <button
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
              onClick={() => navigate(`/dashboard/commandes/${commande._id}/modifier`)}
              title="Modifier"
            >
              ✏️ Modifier
            </button>

            {/* Dropdown Impression */}
            <div className="relative">
              <button
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
                onClick={() => setShowMenuImprimer((v) => !v)}
              >
                🖨️ Imprimer <span className="text-xs">▼</span>
              </button>
              {showMenuImprimer && (
                <div
                  className="absolute right-0 mt-2 w-60 rounded-xl border bg-white p-1.5 shadow-lg ring-1 ring-black/5 animate-[pop_.15s_ease]"
                  onMouseLeave={() => setShowMenuImprimer(false)}
                >
                  <button
                    className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                    onClick={() => handleImprimer("facture")}
                  >
                    🧾 Imprimer la Facture
                  </button>
                  <button
                    className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                    onClick={() => handleImprimer("bon-commande")}
                  >
                    📄 Imprimer le Bon de Commande
                  </button>
                  <div className="my-1 h-px bg-neutral-200" />
                  <button
                    className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                    onClick={() => handleTelechargerPDF("facture")}
                  >
                    📥 Télécharger Facture PDF
                  </button>
                  <button
                    className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                    onClick={() => handleTelechargerPDF("bon-commande")}
                  >
                    📥 Télécharger Bon PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        {/* Carte infos de base */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">📋 Informations de Base</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">Numéro</div>
              <div className="font-semibold">{commande.numero}</div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">Client</div>
              <div className="font-medium flex items-center gap-1">
                {commande.type === "vente" ? (
                  commande.client?.type === "entreprise" ? (
                    <>🏢 {commande.client?.nom}</>
                  ) : (
                    <>👤 {commande.client?.nom} {commande.client?.prenom}</>
                  )
                ) : (
                  <>🏢 {commande.fournisseur?.raisonSociale}</>
                )}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">Date commande</div>
              <div className="font-medium">
                {new Date(commande.dateCommande).toLocaleDateString()}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">Livraison prévue</div>
              <div className="font-medium">
                {commande.dateLivraison
                  ? new Date(commande.dateLivraison).toLocaleDateString()
                  : "—"}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">Statut</div>
              <div
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] ring-1 ${getStatutColor(
                  statutLabel
                )}`}
              >
                <span>{icons[commande.statut] || "ℹ️"}</span>
                <span className="font-medium">{statutLabel}</span>
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-neutral-500">Remise globale</div>
              <div className="font-medium">
                {commande.remiseGlobale && commande.remiseGlobale > 0
                  ? `${commande.remiseGlobale}%`
                  : "—%"}
              </div>
            </div>
          </div>
        </section>

        {/* Produits */}
       {/* Produits */}
<section className="rounded-2xl border bg-white p-5 shadow-sm">
  <h3 className="text-sm font-semibold text-neutral-700 mb-3">📦 Produits Commandés</h3>

  {/* Mobile ≤ md : cartes */}
  <div className="grid gap-3 md:hidden">
    {commande.lignes?.map((l, i) => {
      const brut   = l.quantite * l.prixUnitaire;
      const rem    = (brut * (l.remise || 0)) / 100;
      const htNet  = brut - rem;
      const tvaPct = l.produit?.tva || 0;
      const tvaMt  = (htNet * tvaPct) / 100;
      const ttc    = htNet + tvaMt;

      return (
        <div
          key={i}
          className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold leading-tight truncate">{l.produit.designation}</div>
              <div className="text-[11px] text-neutral-500">Code : {l.produit.reference}</div>
            </div>
            <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[11px]">
              Qté {l.quantite}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border p-2">
              <div className="text-xs text-neutral-500">P.U. HT</div>
              <div className="font-medium">{l.prixUnitaire.toFixed(2)} DT</div>
            </div>
            <div className="rounded-xl border p-2">
              <div className="text-xs text-neutral-500">Remise</div>
              <div className="font-medium">{l.remise || 0}%</div>
            </div>
            <div className="rounded-xl border p-2">
              <div className="text-xs text-neutral-500">HT net</div>
              <div className="font-medium">{htNet.toFixed(2)} DT</div>
            </div>
            <div className="rounded-xl border p-2">
              <div className="text-xs text-neutral-500">TVA ({tvaPct}%)</div>
              <div className="font-medium">{tvaMt.toFixed(2)} DT</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between rounded-xl border px-3 py-2">
            <span className="text-sm text-neutral-600">Montant TTC</span>
            <span className="text-base font-semibold">{ttc.toFixed(2)} DT</span>
          </div>
        </div>
      );
    })}
  </div>

  {/* Desktop ≥ md : table améliorée */}
  <div className="hidden md:block rounded-2xl border bg-white shadow-md ring-1 ring-black/5 overflow-hidden transition hover:shadow-lg hover:ring-black/10">
    {/* scroll horizontal doux + header sticky */}
    <div className="overflow-x-auto">
      <table className="min-w-[900px] w-full text-sm table-auto">
        <thead className="bg-neutral-50/80 backdrop-blur sticky top-0 z-10 text-neutral-600">
          <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
            {[
              "Code","Désignation","Qté","P.U. HT","Remise %",
              "Montant HT Brut","Montant Remise","Montant HT Net",
              "TVA %","Montant TVA","Montant TTC"
            ].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>

        <tbody className="divide-y">
          {commande.lignes?.map((l,i) => {
            const brut   = l.quantite * l.prixUnitaire;
            const rem    = (brut * (l.remise || 0)) / 100;
            const htNet  = brut - rem;
            const tvaPct = l.produit?.tva || 0;
            const tvaMt  = (htNet * tvaPct) / 100;
            const ttc    = htNet + tvaMt;

            return (
              <tr key={i} className="group transition hover:bg-neutral-50/70">
                <td className="px-3 py-2 whitespace-nowrap">{l.produit.reference}</td>
                <td className="px-3 py-2">
                  <div className="line-clamp-2">{l.produit.designation}</div>
                </td>
                <td className="px-3 py-2 text-right md:text-left">{l.quantite}</td>
                <td className="px-3 py-2 whitespace-nowrap">{l.prixUnitaire.toFixed(2)} DT</td>
                <td className="px-3 py-2">{l.remise || 0}%</td>
                <td className="px-3 py-2">{brut.toFixed(2)} DT</td>
                <td className="px-3 py-2">-{rem.toFixed(2)} DT</td>
                <td className="px-3 py-2">{htNet.toFixed(2)} DT</td>
                <td className="px-3 py-2">{tvaPct}%</td>
                <td className="px-3 py-2">{tvaMt.toFixed(2)} DT</td>
                <td className="px-3 py-2 font-semibold">{ttc.toFixed(2)} DT</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>

  {/* Totaux */}
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border">
      <span className="text-sm text-neutral-600">Total HT Brut</span>
      <span className="font-semibold">{totalHTBrut.toFixed(2)} DT</span>
    </div>
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border">
      <span className="text-sm text-neutral-600">Remise globale ({commande.remiseGlobale || 0}%)</span>
      <span className="font-semibold text-rose-600">- {remiseGlobaleMontant.toFixed(2)} DT</span>
    </div>
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border">
      <span className="text-sm text-neutral-600">Remises produits</span>
      <span className="font-semibold text-rose-600">- {totalRemiseProduits.toFixed(2)} DT</span>
    </div>
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border">
      <span className="text-sm text-neutral-600">Total HT Net</span>
      <span className="font-semibold">{totalHTNet.toFixed(2)} DT</span>
    </div>
    <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 border">
      <span className="text-sm text-neutral-600">Total TVA</span>
      <span className="font-semibold">+ {totalTVA.toFixed(2)} DT</span>
    </div>
    <div className="sm:col-span-2 lg:col-span-1 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 border border-emerald-200">
      <span className="text-sm font-medium text-emerald-700">Net à payer</span>
      <span className="text-lg font-extrabold text-emerald-700">{netAPayer.toFixed(2)} DT</span>
    </div>
  </div>
</section>


        {/* Actions rapides */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">⚡ Actions rapides</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
              onClick={() => changerStatut("en_cours")}
            >
              <span>📦</span> Préparer
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
              onClick={() => changerStatut("expediee")}
            >
              <span>🚚</span> Expédier
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
              onClick={() => changerStatut("livree")}
            >
              <span>✅</span> Livrer
            </button>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 active:scale-[.98] transition"
              onClick={() => changerStatut("annulee")}
            >
              <span>❌</span> Annuler
            </button>
          </div>
        </section>

        {/* Notes */}
        {commande.notes && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">📝 Notes</h3>
            <div className="rounded-xl border bg-neutral-50 p-4 text-sm text-neutral-700">
              {commande.notes}
            </div>
          </section>
        )}

        {/* Historique */}
        {Array.isArray(commande.historique) && commande.historique.length > 0 && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">📊 Historique</h3>
            <div className="divide-y">
              {commande.historique.map((h) => (
                <div key={h.id} className="py-3 flex items-center gap-3">
                  <div className="text-xs text-neutral-500 w-28 shrink-0">{h.date}</div>
                  <div className="flex-1 text-sm">{h.action}</div>
                  <div className="text-xs text-neutral-500 shrink-0">par {h.utilisateur}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
