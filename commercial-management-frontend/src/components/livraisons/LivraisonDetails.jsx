// LivraisonDetails.jsx — Tailwind (responsive + animé) — même logique/données
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import livraisonService from "../../services/livraisonService";
import commandeService from "../../services/commandeService";
import ImpressionService from "../../services/ImpressionService";
import Swal from "sweetalert2";

export default function LivraisonDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [livraison, setLivraison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (id.startsWith("virtual-")) {
          const cmdId = id.replace("virtual-", "");
          const cmd = await commandeService.getById(cmdId);
          setLivraison({
            isVirtual: true,
            numero: "LIV-" + cmd.data.numero,
            commande: cmd.data,
            livreur: null,
            statut: cmd.data.statut,
            dateLivraison: cmd.data.dateCommande,
          });
        } else {
          const livraisonData = await livraisonService.getById(id);
          setLivraison(livraisonData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    const closeOnOutsideClick = (e) => {
      if (!e.target.closest(".dropdown")) setOpenDropdown(false);
    };
    document.addEventListener("click", closeOnOutsideClick);
    return () => document.removeEventListener("click", closeOnOutsideClick);
  }, []);

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
          <div className="text-lg font-semibold">Livraison introuvable.</div>
        </div>
      </div>
    );
  }

  const commande = livraison.commande || {};
  commande.lignes = commande.lignes || [];

  // Calculs (identiques à CommandeDetails)
  const totalHTBrut = commande.lignes?.reduce(
    (t, l) => t + l.quantite * l.prixUnitaire,
    0
  );

  const totalRemiseProduits = commande.lignes?.reduce(
    (t, l) => t + (l.prixUnitaire * l.quantite * (l.remise || 0)) / 100,
    0
  );

  const totalHTNet = totalHTBrut - totalRemiseProduits;

  const tvaTotal = commande.lignes?.reduce((t, l) => {
    const htNet =
      l.quantite * l.prixUnitaire -
      (l.prixUnitaire * l.quantite * (l.remise || 0)) / 100;
    return t + (htNet * (l.produit?.tva || 0)) / 100;
  }, 0);

  const totalTTC = totalHTNet + tvaTotal;

  const formatStatut = (s) => {
    switch (s) {
      case "expediee":
        return "Expédiée";
      case "en_livraison":
        return "En livraison";
      case "livree":
        return "Livrée";
      case "en_preparation":
        return "En préparation";
      default:
        return s;
    }
  };

  const statutPillClasses = (label) => {
    switch (label) {
      case "En préparation":
        return "bg-amber-100 text-amber-700 ring-amber-200";
      case "Expédiée":
        return "bg-violet-100 text-violet-700 ring-violet-200";
      case "En livraison":
        return "bg-sky-100 text-sky-700 ring-sky-200";
      case "Livrée":
        return "bg-emerald-100 text-emerald-700 ring-emerald-200";
      default:
        return "bg-neutral-100 text-neutral-700 ring-neutral-200";
    }
  };

  return (
    <div className="min-h-dvh bg-neutral-50">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">
              Livraison {livraison.numero}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">
              Détails de la livraison
            </p>
          </div>

          <div className="flex items-center gap-2">
           <Link to="/dashboard/Livraisons"
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              ← Retour liste
            </Link>

            {!livraison.isVirtual && (
              <>
                <button
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
                 onClick={() => navigate(`/dashboard/livraisons/${id}/modifier`)}
                >
                  ✏️ Modifier
                </button>

                {/* Dropdown Impression */}
                <div className="relative dropdown">
                  <button
                    className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown((s) => !s);
                    }}
                  >
                    🖨️ Imprimer
                  </button>

                  {openDropdown && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white p-1 shadow-lg animate-[pop_.18s_ease]">
                      <button
                        className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                        onClick={() =>
                          ImpressionService.imprimerBonLivraison(livraison)
                        }
                      >
                        🧾 Imprimer bon de livraison
                      </button>
                      <button
                    className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                    onClick={() => ImpressionService.genererFactureAvecLivraison(livraison)}
                  >
                    🧾 Imprimer la Facture
                  </button>
                  <div className="my-1 h-px bg-neutral-200" />
                      <button
                        className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                        onClick={() =>
                          ImpressionService.telechargerBonLivraisonPDF(
                            livraison
                          )
                        }
                      >
                        📥 Télécharger Bon PDF
                      </button>

                      <button
                        className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-neutral-50"
                        onClick={() =>
                          ImpressionService.telechargerFacturePDFDeLivraison(
                            livraison
                          )
                        }
                      >
                        📥 Télécharger Facture PDF
                      </button>


                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Infos Livraison */}
          <div className="lg:col-span-1 rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">
              📦 Informations Livraison
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-neutral-500">Numéro</div>
                <div className="font-medium">{livraison.numero}</div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Commande</div>
                <div className="font-medium">{commande.numero}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-neutral-500">Client</div>
                <div className="font-medium">
                  {commande.client ? (
                    commande.client.type === "entreprise" ? (
                      <>🏢 {commande.client.nom || ""}</>
                    ) : (
                      <>
                        👤 {commande.client.nom || ""}{" "}
                        {commande.client.prenom || ""}
                      </>
                    )
                  ) : (
                    "— Aucun client —"
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Date</div>
                <div className="font-medium">
                  {new Date(livraison.dateLivraison).toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-500">Statut</div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] ring-1 ${statutPillClasses(
                    formatStatut(livraison.statut)
                  )}`}
                >
                  {formatStatut(livraison.statut)}
                </span>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-neutral-500">Livreur</div>
                <div className="font-medium">{livraison.livreur || "—"}</div>
              </div>
            </div>
          </div>

          {/* Détails logistiques */}
          <div className="lg:col-span-1 rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">
              🚚 Détails Logistiques
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Info label="Mode de livraison" value={livraison.modeLivraison} />
              <Info label="Transporteur" value={livraison.transporteur} />
              <Info label="Numéro de suivi" value={livraison.numeroSuivi} />
              <Info
                label="Date préparation"
                value={
                  livraison.datePreparation
                    ? new Date(livraison.datePreparation).toLocaleDateString()
                    : "—"
                }
              />
              <Info
                label="Date expédition"
                value={
                  livraison.dateExpedition
                    ? new Date(livraison.dateExpedition).toLocaleDateString()
                    : "—"
                }
              />
              <Info
                label="Date prévue"
                value={
                  livraison.dateLivraisonPrevue
                    ? new Date(
                        livraison.dateLivraisonPrevue
                      ).toLocaleDateString()
                    : "—"
                }
              />
              <Info
                label="Date réelle"
                value={
                  livraison.dateLivraisonReelle
                    ? new Date(
                        livraison.dateLivraisonReelle
                      ).toLocaleDateString()
                    : "—"
                }
              />
              <Info
                label="Frais de livraison"
                value={
                  typeof livraison.fraisLivraison === "number"
                    ? `${livraison.fraisLivraison.toFixed(2)} DT`
                    : "—"
                }
              />
              <div className="sm:col-span-2">
                <div className="text-xs text-neutral-500">Commentaires</div>
                <div className="font-medium">
                  {livraison.commentaires || "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="lg:col-span-1 rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">
              📍 Adresse de Livraison
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Info label="Rue" value={livraison.adresseLivraison?.rue} />
              <Info label="Ville" value={livraison.adresseLivraison?.ville} />
              <Info
                label="Code postal"
                value={livraison.adresseLivraison?.codePostal}
              />
              <Info label="Pays" value={livraison.adresseLivraison?.pays} />
            </div>
          </div>
        </div>

        {/* Produits */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            📦 Produits Commandés
          </h3>
         {/* ✅ Table responsive (cartes en mobile + table en desktop) */}
<div className="space-y-3">
  {/* Mobile ≤ md : cartes compactes */}
  <div className="grid gap-3 md:hidden">
    {commande.lignes?.length > 0 ? (
      commande.lignes.map((l, i) => {
        const htBrut = l.prixUnitaire * l.quantite;
        const remiseValue = (htBrut * (l.remise || 0)) / 100;
        const htNet = htBrut - remiseValue;
        const tvaPct = l.produit?.tva || 0;
        const tvaValue = (htNet * tvaPct) / 100;
        const ttc = htNet + tvaValue;

        return (
          <div
            key={i}
            className="group rounded-2xl border bg-white p-4 shadow-sm hover:shadow-md transition transform-gpu hover:-translate-y-0.5"
          >
            {/* header ligne */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold leading-tight truncate">
                  {l.produit?.designation || "—"}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {l.produit?.reference || "—"} • {l.quantite} × {l.prixUnitaire?.toFixed(2)} DT
                </div>
              </div>
              <span className="rounded-lg bg-neutral-100 px-2 py-1 text-[11px]">
                {tvaPct}% TVA
              </span>
            </div>

            {/* détails mini-grille */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">HT Brut</div>
                <div className="font-medium">{htBrut.toFixed(2)} DT</div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Remise</div>
                <div className="font-medium text-rose-600">- {remiseValue.toFixed(2)} DT</div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">HT Net</div>
                <div className="font-medium">{htNet.toFixed(2)} DT</div>
              </div>
              <div className="rounded-xl border p-2">
                <div className="text-xs text-neutral-500">Montant TVA</div>
                <div className="font-medium">+ {tvaValue.toFixed(2)} DT</div>
              </div>
            </div>

            {/* total TTC */}
            <div className="mt-3 flex items-center justify-between rounded-xl border px-3 py-2">
              <span className="text-sm text-neutral-600">Montant TTC</span>
              <span className="text-base font-extrabold">{ttc.toFixed(2)} DT</span>
            </div>
          </div>
        );
      })
    ) : (
      <div className="rounded-2xl border bg-white px-4 py-6 text-center text-sm text-neutral-600">
        Aucun produit trouvé pour cette commande.
      </div>
    )}
  </div>

  {/* Desktop ≥ md : table améliorée */}
  <div className="hidden md:block rounded-2xl border bg-white shadow-md ring-1 ring-black/5 overflow-hidden transition hover:shadow-lg hover:ring-black/10">
    <div className="overflow-x-auto">
      <table className="min-w-[1000px] w-full text-sm table-auto">
        <thead className="bg-neutral-50/80 backdrop-blur sticky top-0 z-10 text-neutral-600">
          <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold">
            {[
              "Code",
              "Désignation",
              "Qté",
              "P.U. HT",
              "Remise %",
              "Montant HT Brut",
              "Montant Remise",
              "Montant HT Net",
              "TVA %",
              "Montant TVA",
              "Montant TTC",
            ].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {commande.lignes?.length > 0 ? (
            commande.lignes.map((l, i) => {
              const htBrut = l.prixUnitaire * l.quantite;
              const remiseValue = (htBrut * (l.remise || 0)) / 100;
              const htNet = htBrut - remiseValue;
              const tvaPct = l.produit?.tva || 0;
              const tvaValue = (htNet * tvaPct) / 100;
              const ttc = htNet + tvaValue;

              return (
                <tr key={i} className="group transition hover:bg-neutral-50/70">
                  <td className="px-3 py-2 whitespace-nowrap">{l.produit?.reference || "—"}</td>
                  <td className="px-3 py-2">
                    <div className="max-w-[360px] truncate">{l.produit?.designation || "—"}</div>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{l.quantite}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{l.prixUnitaire?.toFixed(2)} DT</td>
                  <td className="px-3 py-2 whitespace-nowrap">{l.remise || 0}%</td>
                  <td className="px-3 py-2 whitespace-nowrap">{htBrut.toFixed(2)} DT</td>
                  <td className="px-3 py-2 whitespace-nowrap text-rose-600">- {remiseValue.toFixed(2)} DT</td>
                  <td className="px-3 py-2 whitespace-nowrap">{htNet.toFixed(2)} DT</td>
                  <td className="px-3 py-2 whitespace-nowrap">{tvaPct}%</td>
                  <td className="px-3 py-2 whitespace-nowrap">+ {tvaValue.toFixed(2)} DT</td>
                  <td className="px-3 py-2 font-semibold whitespace-nowrap">{ttc.toFixed(2)} DT</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" className="px-3 py-6 text-center text-neutral-500">
                Aucun produit trouvé pour cette commande.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>


          {/* Totaux */}
          <div className="mt-5 rounded-xl border bg-neutral-50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <Total label="Total HT Brut" value={`${totalHTBrut.toFixed(2)} DT`} />
              <Total
                label="Remises produits"
                value={`- ${totalRemiseProduits.toFixed(2)} DT`}
                type="remise"
              />
              <div className="hidden lg:block" />
              <Total label="Total HT Net" value={`${totalHTNet.toFixed(2)} DT`} strong />
              <Total label="Total TVA" value={`+ ${tvaTotal.toFixed(2)} DT`} />
              <Total
                label="Net à payer"
                value={`${totalTTC.toFixed(2)} DT`}
                strong
                final
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- petits composants UI ---------- */
function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="font-medium">{value ?? "—"}</div>
    </div>
  );
}

function Total({ label, value, type, strong, final }) {
  return (
    <div
      className={`rounded-lg border bg-white px-3 py-2 ${
        final ? "ring-1 ring-blue-200" : ""
      }`}
    >
      <div className="text-xs text-neutral-500">{label}</div>
      <div
        className={`mt-0.5 ${
          strong ? "font-semibold" : "font-medium"
        } ${type === "remise" ? "text-rose-600" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
