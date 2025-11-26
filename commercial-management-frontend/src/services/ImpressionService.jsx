import React from 'react';
import { renderToString } from 'react-dom/server';
import html2pdf from "html2pdf.js";

class ImpressionService {

   static LOGO_URL = (typeof process !== "undefined" && process.env && process.env.PUBLIC_URL
  ? process.env.PUBLIC_URL
  : "") + "/assets/images/logo.jpg";



  // --- Génération / mémo de codes client & TVA ---
static #codesParClient = new WeakMap();

/** Génère un code lisible, ex: "CLI-9X3Q7A" */
static #randomCode(prefix = "CLI", len = 6) {
  // Base36 lisible, sans caractères ambigus
  const s = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "");
  return `${prefix}-${s.slice(0, len)}`;
}

/** Option 1: code "stable" par client (mémorisé tant que l'objet client vit) */
static getOrCreateCodesForClient(client = {}) {
  // On mémorise par objet client (WeakMap) => même code tant que la page vit
  if (this.#codesParClient.has(client)) return this.#codesParClient.get(client);
  const codes = {
    codeClient: this.#randomCode("CLI", 6),
    codeTVA:    this.#randomCode("TVA", 9)
  };
  this.#codesParClient.set(client, codes);
  return codes;
}

static genererFacture(commande){
   const client = (commande && commande.client) || {};
  // ⬇️ choisis l’une des deux lignes:
  const { codeClient, codeTVA } = this.getOrCreateCodesForClient(client);
  // const { codeClient, codeTVA } = this.getFreshCodes();

  const withCodes = { ...commande, codeClient: commande.codeClient ?? codeClient, codeTVA: commande.codeTVA ?? codeTVA };
  const html = `
    <!DOCTYPE html><html lang="fr">
    <head><meta charset="UTF-8"><title>Facture ${withCodes.numero}</title></head>
    <body><style>${this.getStylesDoc()}</style>${this.getContenuDocument(withCodes, "facture")}</body>
    </html>`;
  this.imprimerHTML(html);
}
static genererBonCommande(commande){
  const client = (commande && commande.client) || {};
  const { codeClient, codeTVA } = this.getOrCreateCodesForClient(client);
  const withCodes = { ...commande, codeClient: commande.codeClient ?? codeClient, codeTVA: commande.codeTVA ?? codeTVA };

  const html = `
    <!DOCTYPE html><html lang="fr">
    <head><meta charset="UTF-8"><title>Bon de Commande ${withCodes.numero}</title></head>
    <body><style>${this.getStylesDoc()}</style>${this.getContenuDocument(withCodes, "commande")}</body>
    </html>`;
  this.imprimerHTML(html);
}


// Sommes / TVA par taux (depuis lignes commande)
static computeTotals(rows){
  let brut=0, remiseTotal=0, net=0, tvaTotal=0, ttcTotal=0;
  const tvaMap=new Map(); // taux -> {base, montant}

  rows.forEach(l=>{
    const q = Number(l.quantite ?? l.qty ?? 0);
    const pu= Number(l.prixHT ?? l.prixUnitaire ?? 0);
    const r  = Number(l.remise ?? 0);      // %
    const t  = Number(l.tva ?? l.produit?.tva ?? 0);

    const htBrut = q*pu;
    const remVal = htBrut*(r/100);
    const htNet  = htBrut - remVal;
    const tvaVal = htNet*(t/100);
    const ttc    = htNet + tvaVal;

    brut += htBrut;
    remiseTotal += remVal;
    net  += htNet;
    tvaTotal += tvaVal;
    ttcTotal += ttc;

    if(!tvaMap.has(t)) tvaMap.set(t,{base:0, montant:0});
    tvaMap.get(t).base    += htNet;
    tvaMap.get(t).montant += tvaVal;
  });

  return { brut, remiseTotal, net, tvaTotal, ttcTotal, tvaMap };
}

static f2(n){ return Number(n||0).toFixed(3).replace(/\.?0+$/,'').replace('.', ','); } // 3 décimales type Dinars
static safe(v){ return (v ?? "") + ""; }

// (simple) nombre en lettres fr – suffisant pour "Arrêté la présente Facture..."
static montantEnLettres(amount){
  const n = Math.round((Number(amount)||0)*100)/100;
  try{
    const intl = new Intl.NumberFormat('fr-TN', { style:'currency', currency:'TND' }).format(n);
    return intl.replace('TND','Dinars'); // rapide et propre
  }catch{ return n.toString().replace('.', ',') + ' Dinars'; }
}


  // ---------------------------
  // 🧩 Formatage du nom Client
  // ---------------------------
  static getNomClient(client) {
    if (!client) return "—";
    if (client.type === "entreprise" || client.raisonSociale) return client.raisonSociale;
    return `${client.nom || ''} ${client.prenom || ''}`.trim();
  }

  // ---------------------------
  // 🧩 Format Date
  // ---------------------------
  static formatDate(dateString) {
    if (!dateString) return "—";
    try { return new Date(dateString).toLocaleDateString('fr-FR'); }
    catch { return dateString; }
  }

  // Convertit les statuts backend en texte lisible
  static formatStatut(statut) {
    switch (statut) {
      case "en_cours": return "EN TRAITEMENT";
      case "confirmee": return "CONFIRMÉE";
      case "expediee": return "EXPÉDIÉE";
      case "livree": return "LIVRÉE";
      case "annulee": return "ANNULÉE";
      default: return statut?.toUpperCase() || "—";
    }
  }

  // Choisit la couleur du tampon selon le statut
  static getStampClass(statut) {
    switch (statut) {
      case "confirmee":
      case "expediee":
      case "livree":
        return "stamp-approved";
      case "en_cours":
        return "stamp-pending";
      case "annulee":
        return "stamp-rejected";
      default:
        return "stamp-pending";
    }
  }

  // ---------------------------
  // Bon de livraison
static imprimerBonLivraison(livraison){
  const cmdBase = { ...livraison.commande, ...livraison }; // dateLivraison, statut, etc.
  const client = (cmdBase && cmdBase.client) || {};
  const { codeClient, codeTVA } = this.getOrCreateCodesForClient(client);
  const cmd = { ...cmdBase, codeClient: cmdBase.codeClient ?? codeClient, codeTVA: cmdBase.codeTVA ?? codeTVA };

  const html = `
    <!DOCTYPE html><html lang="fr">
    <head><meta charset="UTF-8"><style>${this.getStylesDoc()}</style></head>
    <body>${this.getContenuDocument(cmd, "livraison")}</body></html>`;
  this.imprimerHTML(html);
}


 static telechargerBonLivraisonPDF(livraison) {
  // On unifie la source de vérité comme pour imprimerBonLivraison
  const base = { ...livraison.commande, ...livraison }; // dateLivraison, statut, numero, etc.
  const client = base.client || {};
  const { codeClient, codeTVA } = this.getOrCreateCodesForClient(client);
  const withCodes = {
    ...base,
    codeClient: base.codeClient ?? codeClient,
    codeTVA: base.codeTVA ?? codeTVA,
  };

  const html = `
    <div id="doc-root">
      <style>${this.getStylesDoc()}</style>
      ${this.getContenuDocument(withCodes, "livraison")}
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  html2pdf().set({
    margin: 0,
    filename: `Bon_Livraison_${withCodes.numero || "doc"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] },
  })
  .from(container.querySelector("#doc-root"))
  .save()
  .then(() => container.remove());
}


  // ---------------------------
  // 🎨 Styles Facture
  // ---------------------------
// 🎨 Style FACTURE (même grille que le Bon de Commande)
static getStylesFacture() {
  return `
    @page { size: A4; margin: 14mm; }
    :root{
      --ink:#0f172a;
      --sub:#475569;
      --line:#e5e7eb;
      --muted:#f3f4f6;
    }
    *{ box-sizing:border-box; }
    html,body{ font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; color:var(--ink); background:#fff; }

    .doc { width:100%; max-width:794px; margin:0 auto; }

    /* ---------- EN-TÊTE ---------- */
    .header{
      display:grid; grid-template-columns:1fr 1fr; gap:18px; align-items:center;
    }
    .logo img{ width:120px; height:auto; display:block; }

    .box{
      border:1.5px solid var(--line);
      border-radius:6px;
      padding:12px 14px;
      background:#fff;
    }
    .client-card{text-align:left;}
    .client-name{ font-weight:800; text-transform:uppercase; font-size:13.5px; margin-bottom:2px; }
    .client-addr{ font-size:12.5px; color:var(--sub); white-space:pre-line; }

    /* ---------- TITRE ---------- */
    .title{ margin-top:18px; text-align:center; padding:10px 0 4px; font-weight:800; }
    .title .line{ height:2px; background:var(--line); margin:6px 0; }

    /* ---------- INFOS ---------- */
    .kv{ font-size:12.5px; line-height:1.3; margin:2px 0; display:flex; gap:8px; }
    .kv b{ min-width:120px; color:var(--sub); font-weight:600; }
    .ack{ display:flex; align-items:center; font-size:12.5px; color:var(--sub); }

    .info-grid{ display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-top:10px; }

    /* ---------- TABLE ---------- */
    table{ width:100%; border-collapse:collapse; margin-top:18px; font-size:12.5px; }
    thead th{ background:var(--muted); color:var(--ink); text-align:left; padding:9px 8px; border:1px solid var(--line); font-weight:700; }
    tbody td{ padding:8px; border:1px solid var(--line); vertical-align:top; }
    tbody tr:nth-child(even) td{ background:#fff; }
    tbody tr:nth-child(odd) td{ background:#fafafa; }
    .tl{text-align:left;} .tc{text-align:center;} .tr{text-align:right;} .code{white-space:nowrap;}

    /* ---------- TOTAUX ---------- */
    .totaux{
      margin-top:14px;
      display:grid; grid-template-columns:1fr 280px; gap:18px;
      align-items:flex-start;
    }
    .tot-box{ border:1.5px solid var(--line); border-radius:6px; padding:12px 14px; }
    .tot-row{ display:flex; justify-content:space-between; padding:6px 0; }
    .tot-row b{ font-weight:700; }

    .note{ font-size:12px; color:var(--sub); margin-top:12px; }

    @media print { .no-print{ display:none !important; } }
  `;
}

// 🎨 Style COMMUN (identique Bon de Commande) — utilisé par Commande, Facture, Livraison
// ====== STYLES COMMUNS A4 (pour Commande / Facture / Livraison) ======
static getStylesDoc() {
  return `
  @page { size: A4; margin: 12mm; }
  :root{
    --ink:#0b1324; --sub:#475569; --line:#9aa5b2; --muted:#f5f7fb;
    --brand:#1f4cff; --ok:#16a34a; --warn:#eab308; --err:#dc2626;
  }
  *{ box-sizing:border-box; }
  html,body{
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
    color:var(--ink); background:#fff; -webkit-print-color-adjust:exact; print-color-adjust:exact;
    font-variant-numeric: tabular-nums;
  }
    /* zone marque */
.brand{ display:flex; gap:12px; align-items:center; }

/* conteneur du logo : même hauteur que le bloc texte */
.brand .logo{
  flex:0 0 66px;              /* largeur fixe */
  width:66px; height:66px;    /* hauteur égale */
  display:flex; align-items:center; justify-content:center;
  border:1px solid var(--line);
  border-radius:12px;
  background:#fff;            /* pas de texte, fond neutre */
  overflow:hidden;
}

/* image logo distante */
.brand .logo .logo-img{
  max-width:100%;
  max-height:100%;
  object-fit:contain;         /* garde les proportions */
  display:block;
  image-rendering:auto;
}

/* bloc texte à droite du logo */
.brand .h{
  display:flex; flex-direction:column; justify-content:center; gap:3px;
  min-height:66px;            /* aligne verticalement avec le logo */
}

.brand .h .title{ font-weight:800; font-size:16px; letter-spacing:.02em; }
.brand .h .addr{ font-size:12.5px; color:var(--sub); white-space:pre-line; }
.brand .h .tax { margin-top:2px; font-size:12px; color:var(--sub); white-space:pre-line; }

  .doc{ width:100%; max-width:794px; margin:0 auto; }
  .paper{ background:#fff; padding:18px; border:1px solid #e5e7eb; border-radius:10px; }

  /* header */
  .top{
    display:grid; grid-template-columns: 1fr 260px; gap:14px; align-items:start;
    border-bottom:2px solid var(--line); padding-bottom:10px; margin-bottom:10px;
  }
  .brand { display:flex; gap:12px; align-items:center; }
  .brand .logo svg, .brand .logo img{ width:62px; height:62px; display:block; }
  .brand .h {
    display:flex; flex-direction:column; gap:4px;
  }
  .brand .h .title { font-weight:800; font-size:16px; letter-spacing:.02em; }
  .brand .h .addr { font-size:12.5px; color:var(--sub); white-space:pre-line; }
  .client-box{
    border:1px solid var(--line); border-radius:8px; background:#fff; padding:10px 12px;
    min-height:70px;
  }
  .client-box .client-name{ font-weight:800; text-transform:uppercase; font-size:13px; margin-bottom:2px; }
  .client-box .client-addr{ font-size:12.5px; color:var(--sub); white-space:pre-line; }

  /* doc title line */
  .doc-title{
    margin:8px 0 10px; display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:center;
  }
  .doc-title .rule{ height:2px; background:var(--line); }
  .doc-title .t{ font-weight:900; white-space:nowrap; }

  /* small infos row */
  .mini{
    display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;
  }
  .box{ border:1px solid var(--line); border-radius:8px; padding:10px 12px; background:#fff; }
  .box h4{ margin:0 0 6px; font-size:12.5px; font-weight:800; }
  .kv{ display:flex; gap:6px; align-items:baseline; font-size:12.5px; margin:2px 0; }
  .kv b{ min-width:110px; color:var(--sub); }

  /* table lines */
  table{ width:100%; border-collapse:collapse; font-size:12.5px; table-layout:fixed; }
  colgroup col.code{ width:14%; } colgroup col.des{ width:auto; } colgroup col.qte{ width:8%; }
  colgroup col.pu{ width:13%; }  colgroup col.rem{ width:11%; } colgroup col.mht{ width:14%; }
  colgroup col.tva{ width:8%; }  colgroup col.ttc{ width:14%; }

  thead th{
    background:var(--muted); border:1px solid var(--line); padding:8px; text-align:left; font-weight:800;
  }
  tbody td{
    border:1px solid var(--line); padding:7px 8px; vertical-align:top;
    color:#0b1324; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .tl{text-align:left;} .tc{text-align:center;} .tr{text-align:right;}

  /* footer grids (TVA + Totaux) */
  .recap{
    margin-top:10px; display:grid; grid-template-columns: 1fr 280px; gap:12px; align-items:start;
  }
  .tva{ border:1px solid var(--line); border-radius:8px; overflow:hidden; }
  .tva table{ table-layout:auto; }
  .tva th, .tva td{ border:1px solid var(--line); padding:6px 8px; font-size:12.5px; }
  .tva thead th{ background:#fff; font-weight:700; }
  .tot{ border:1px solid var(--line); border-radius:8px; padding:10px 12px; }
  .tot .row{ display:flex; justify-content:space-between; padding:5px 0; }
  .tot .row b{ font-weight:800; }

  .amount-line{ margin:8px 0 10px; font-size:12.5px; color:#1f2937; }
  .signs{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-top:12px; }
  .sign{ height:62px; border:1px dashed var(--line); border-radius:8px; display:flex; align-items:flex-end; padding:8px 10px; }
  .sign label{ font-size:11.5px; color:#475569; }

  /* stamp (livraison) */
  .stamp{ position:absolute; top:12px; right:12px; padding:8px 14px; border:3px solid; font-size:16px; font-weight:900; border-radius:8px; transform: rotate(-6deg); opacity:.95; }
  .stamp-approved{ color:var(--ok); border-color:var(--ok); }
  .stamp-pending{  color:var(--warn); border-color:var(--warn); }
  .stamp-rejected{ color:var(--err); border-color:var(--err); }
 
.brand .h .tax{
  margin-top: 2px;
  font-size: 12px;
  color: var(--sub);
  white-space: pre-line;
}


.company-tax{
  margin-top: 2px;
  font-size: 12px;
  color: var(--sub);
  white-space: pre-line;
}


  /* print cleanup */
  @media print {
    .paper{ border:0; padding:0; }
    thead th{ background:#fff; }
  }`;
}

static getStylesBonCommande(){ return this.getStylesDoc(); }
static getStylesFacture(){   return this.getStylesDoc(); }
static getStylesBonLivraison(){ return this.getStylesDoc(); }




static getStylesBonCommande() { return this.getStylesDoc(); }
static getStylesFacture()    { return this.getStylesDoc(); }
static getStylesBonLivraison(){ return this.getStylesDoc(); }

// ====== Gabarit principal ======
static getContenuDocument(commande, type="commande"){
  const rows = (commande.produits?.length ? commande.produits : commande.lignes) || [];

  // Société
  const s = commande.societe || {};
  const societeNom = s.nom || commande.societeNom || "TERCHICH DISTRIBUTIO";
  const societeAdresse = s.adresse || commande.societeAdresse || "Adresse : GREMDA KM 13\nSFAX 3074";
  const societeMF      = s.mf || s.matriculeFiscale || s.matricule || commande.societeMF || "MF:1860471/x ";

  // Client
  const c = commande.client || {};
  const clientNom = c.raisonSociale || c.nom || [c.nom, c.prenom].filter(Boolean).join(" ") || "—";
  const clientAdresse =
    (c.adresse && (c.adresse.rue || c.adresse.ville || c.adresse.pays))
      ? [c.adresse.rue, c.adresse.ville, c.adresse.pays].filter(Boolean).join("\n")
      : (c.adresse || "");

  // libellés
  const titre = type==="facture"
    ? `Facture N° ${this.safe(commande.numero)}`
    : type==="livraison"
      ? `Bon de livraison N° ${this.safe(commande.numero)}`
      : `Bon de Commande N° ${this.safe(commande.numero)}`;

  const blocDroitTitre = type==="facture" ? "Informations facture"
                       : type==="livraison" ? "Informations livraison"
                       : "Informations commande";

  // dates
  const dateLabel = type==="livraison" ? "Date" : "Date";
  const dateValue = type==="livraison"
      ? this.formatDate(commande.dateLivraison || commande.dateCommande)
      : this.formatDate(commande.dateCommande);

  // totaux/TVA
  const T = this.computeTotals(rows);

  // TVA table rows
  const tvaRows = [...T.tvaMap.entries()].sort((a,b)=>a[0]-b[0]).map(([t,{base,montant}])=>`
    <tr><td class="tc">${this.f2(t)}%</td><td class="tr">${this.f2(base)}</td><td class="tr">${this.f2(montant)}</td></tr>
  `).join('') || `<tr><td class="tc">—</td><td class="tr">0</td><td class="tr">0</td></tr>`;

  // phrase "Arrêté ..."
  const phrase = `Arrêté la présente ${type==="facture"?"Facture":type==="livraison"?"Livraison":"Commande"} à la somme de — ${this.montantEnLettres(T.ttcTotal)} —`;

  return `
  <div class="doc">
    <div class="paper" style="position:relative;">

      ${type==="livraison" ? `<div class="stamp ${this.getStampClass(commande.statut)}">${this.formatStatut(commande.statut)}</div>` : ""}

      <!-- Header -->
      <div class="top">
        <div class="brand">
    <div class="logo">${this.getCompanyLogoHTML()}</div>


          <div class="h">
            <div class="title">${this.safe(societeNom)}</div>
            <div class="addr">${this.safe(societeAdresse)}</div>
             ${societeMF ? `<div class="tax">MF : ${this.safe(societeMF)}</div>` : ""}
          </div>
        </div>
        <div class="client-box">
          <div class="client-name">${this.safe(clientNom)}</div>
          <div class="client-addr">${this.safe(clientAdresse)}</div>
        </div>
      </div>

      <!-- Title line -->
      <div class="doc-title"><div class="rule"></div><div class="t">${titre}</div><div class="rule"></div></div>

      <!-- Mini infos -->
      <div class="mini">
        <div class="box">
          <h4>Client</h4>
          <div class="kv"><b>Nom :</b><span>${this.safe(clientNom)}</span></div>
          <div class="kv"><b>Adresse :</b><span style="white-space:pre-line">${this.safe(clientAdresse) || "—"}</span></div>
        </div>
        <div class="box">
          <h4>${blocDroitTitre}</h4>
          <div class="kv"><b>${dateLabel} :</b><span>${dateValue}</span></div>
          <div class="kv"><b>N° :</b><span>${this.safe(commande.numero)}</span></div>
          <div class="kv"><b>Code Client :</b><span>${this.safe(commande.codeClient) || "—"}</span></div>
          <div class="kv"><b>Code TVA :</b><span>${this.safe(commande.codeTVA) || "—"}</span></div>
        </div>
      </div>

      <!-- Tableau produits -->
      <div class="table-wrap">
        <table>
          <colgroup>
            <col class="code"/><col class="des"/><col class="qte"/><col class="pu"/>
            <col class="rem"/><col class="mht"/><col class="tva"/><col class="ttc"/>
          </colgroup>
          <thead>
            <tr>
              <th class="tl">Code</th>
              <th class="tl">Désignation</th>
              <th class="tc">Qté</th>
              <th class="tr">P.U.HT</th>
              <th class="tc">Remise</th>
              <th class="tr">Montant HT</th>
              <th class="tc">TVA%</th>
              <th class="tr">Montant TTC</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows.map(l=>{
                    const code = l.code || l.produit?.reference || "";
                    const des  = l.designation || l.produit?.designation || "";
                    const q    = Number(l.quantite ?? l.qty ?? 0);
                    const pu   = Number(l.prixHT ?? l.prixUnitaire ?? 0);
                    const r    = Number(l.remise ?? 0);
                    const t    = Number(l.tva ?? l.produit?.tva ?? 0);
                    const htBrut = q*pu, htNet = htBrut*(1 - r/100), ttc = htNet*(1+t/100);
                    return `<tr>
                      <td class="tl">${this.safe(code)}</td>
                      <td class="tl">${this.safe(des)}</td>
                      <td class="tc">${q}</td>
                      <td class="tr">${this.f2(pu)}</td>
                      <td class="tc">${this.f2(r)}%</td>
                      <td class="tr">${this.f2(htNet)}</td>
                      <td class="tc">${this.f2(t)}%</td>
                      <td class="tr">${this.f2(ttc)}</td>
                    </tr>`;
                  }).join('')
                : `<tr><td class="tc" colspan="8">Aucune ligne.</td></tr>`
            }
          </tbody>
        </table>
      </div>

      <!-- TVA + Totaux -->
      <div class="recap">
        <div class="tva">
          <table>
            <thead>
              <tr><th class="tc">T.V.A. %</th><th class="tr">Assiette</th><th class="tr">Montant</th></tr>
            </thead>
            <tbody>${tvaRows}</tbody>
          </table>
        </div>
        <div class="tot">
          <div class="row"><span>Total HT Brut</span><b>${this.f2(T.brut)}</b></div>
          <div class="row"><span>Remise</span><b>${this.f2(T.remiseTotal)}</b></div>
          <div class="row"><span>Total HT Net</span><b>${this.f2(T.net)}</b></div>
          <div class="row"><span>Total TVA</span><b>${this.f2(T.tvaTotal)}</b></div>
          <div class="row"><span>Net à Payer</span><b>${this.f2(T.ttcTotal)}</b></div>
        </div>
      </div>

      <div class="amount-line">${this.safe(phrase)}</div>

      <div class="signs">
        <div class="sign"><label>Notes</label></div>
        <div class="sign"><label>Signature Client</label></div>
        <div class="sign"><label>Signature & Cachet</label></div>
      </div>

    </div>
  </div>`;
}


// 📄 FACTURE avec la même structure visuelle que le Bon de Commande
// ---------- FACTURE ----------
static getContenuFacture(commande){
  // reprend la même structure que commande + wording facture
  const html = this.getContenuBonCommande(commande)
    .replaceAll("Bon de Commande", "Facture")
    .replace('Informations commande','Informations facture');
  return html;
}


  // ---------------------------
  // Bon de commande basé sur facture
  // ---------------------------
// ---------------------------
// 🔷 Logo corporate (vectoriel = net à l’impression)
static getCompanyLogoSVG() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="130" height="56" viewBox="0 0 260 112" aria-label="STCI">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0ea5ff"/>
        <stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
    </defs>
    <rect x="4" y="8" rx="10" ry="10" width="100" height="100" fill="url(#g)" opacity="0.14"></rect>
    <circle cx="54" cy="58" r="30" fill="none" stroke="url(#g)" stroke-width="6"/>
    <circle cx="54" cy="58" r="16" fill="none" stroke="#0ea5ff" stroke-width="4" opacity="0.85"/>
    <text x="118" y="66" font-family="Inter, ui-sans-serif, system-ui" font-weight="800" font-size="42" fill="#0f172a">STCI</text>
    <text x="118" y="88" font-family="Inter, ui-sans-serif, system-ui" font-size="14" fill="#334155" letter-spacing=".04em">
      SOCIÉTÉ TUNISIENNE DE COMMERCE INTERNATIONAL
    </text>
  </svg>
  `;
}

// juste au-dessus de getCompanyLogoSVG ou à la place
static getCompanyLogoHTML() {
  const src = ImpressionService.LOGO_URL;
  return `
    <img src="${src}" alt="Logo" class="logo-img"
         crossOrigin="anonymous" referrerpolicy="no-referrer" />
  `;
}


static getStylesBonCommande() {
  return `
    @page { size: A4; margin: 14mm; }
    :root{
      --ink:#0f172a; --sub:#475569; --line:#e5e7eb; --muted:#f3f4f6; --brand:#0ea5ff;
    }
    *{ box-sizing:border-box; }
    html,body{ font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial; color:var(--ink); background:#fff; }
    .doc{ width:100%; max-width:794px; margin:0 auto; }
    .paper{ background:#fff; border:1px solid #eef2f7; border-radius:10px; padding:22px; }

    /* EN-TÊTE */
    .header{ display:grid; grid-template-columns: 1fr 1fr; gap:18px; align-items:center; }
    .logo{ display:flex; align-items:center; }
    .logo svg{ display:block; width:130px; height:auto; }
    .client-card{ border:1.5px solid #d8dee6; border-radius:6px; padding:12px 14px; background:#fff; }
    .client-name{ font-weight:800; text-transform:uppercase; font-size:13.5px; margin-bottom:2px; color:#0b1324; }
    .client-addr{ font-size:12.5px; color:var(--sub); white-space:pre-line; }

    /* TITRE double filet */
    .title-wrap{ margin-top:16px; display:flex; align-items:center; gap:14px; }
    .title-wrap .lines{ flex:1 1 auto; position:relative; height:12px; }
    .title-wrap .lines::before,.title-wrap .lines::after{ content:""; position:absolute; left:0; right:0; background:#cfd6df; }
    .title-wrap .lines::before{ top:2px; height:2px; }
    .title-wrap .lines::after{ top:7px; height:2px; }
    .title{ font-weight:800; white-space:nowrap; letter-spacing:.005em; color:#0b1324; }

    /* BLOCS INFOS */
    .info-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:18px; margin-top:12px; }
    .box{ border:1.5px solid var(--line); border-radius:6px; padding:12px 14px; background:#fff; }
    .kv{ font-size:12.5px; line-height:1.3; margin:3px 0; display:flex; gap:8px; align-items:baseline; }
    .kv b{ min-width:120px; color:var(--sub); font-weight:600; }
    .kv .value{ font-weight:700; color:var(--brand); }
    .ack{ display:flex; align-items:center; font-size:12.5px; color:#475569; }

    /* TABLE */
    .table-wrap{ margin-top:18px; }
    table{ width:100%; border-collapse:collapse; font-size:12.5px; }
    colgroup col.code{ width:12%; } colgroup col.des{ width:auto; } colgroup col.qte{ width:7%; }
    colgroup col.pu{ width:11%; } colgroup col.rem{ width:10%; } colgroup col.mht{ width:13%; }
    colgroup col.tva{ width:8%; } colgroup col.ttc{ width:13%; }

    thead th{ background:#f4f6fa; color:#0b1324; text-align:left; padding:9px 8px; border:1px solid #dfe5ec; font-weight:700; }
    tbody td{ padding:8px; border:1px solid #e4e9f0; vertical-align:top; color:#111827; }
    tbody tr:nth-child(odd) td{ background:#fafbfc; }

    .tl{text-align:left;} .tc{text-align:center;} .tr{text-align:right;} .code{white-space:nowrap;}
    .note{ font-size:12px; color:#64748b; margin-top:14px; }

    @media print { .no-print{ display:none !important; } }
  `;
}






// ---------------------------
// 📄 Contenu du BON DE COMMANDE (structure comme la capture)
// Utilitaires
static _safe = (v)=> (v ?? "") + "";
static _fmt  = (n)=> Number(n||0).toFixed(2);
static _pct  = (n)=> Number(n||0).toFixed(0);

// ---------- BON DE COMMANDE ----------
static getContenuBonCommande(commande){
  const safe=this._safe, fmt=this._fmt;
  const rows=(commande.produits?.length?commande.produits:commande.lignes)||[];
  const s=commande.societe||{};
  const societeNom=s.nom||commande.societeNom||"TERCHICH DISTRIBUTIO";
  const societeAdresse=s.adresse||commande.societeAdresse||"Adresse : GREMDA KM 13\nSFAX 3074";
   const societeMF      = s.mf || s.matriculeFiscale || s.matricule || commande.societeMF || "MF:1860471/x";

  const c=commande.client||{};
  const clientNom=c.raisonSociale||c.nom||[c.nom,c.prenom].filter(Boolean).join(" ")||"—";
  const clientAdresse=(c.adresse&&(c.adresse.rue||c.adresse.ville||c.adresse.pays)
    ? [c.adresse.rue,c.adresse.ville,c.adresse.pays].filter(Boolean).join("\n") : (c.adresse||""))||"";

  return `
  <div class="doc">
    <div class="paper">
      <div class="header">
     <div class="logo">${this.getCompanyLogoHTML()}</div>


        <div class="company-card">
          <div class="company-title">${safe(societeNom)}</div>
          <div class="company-addr">${safe(societeAdresse)}</div>
            ${societeMF ? `<div class="company-tax">MF : ${safe(societeMF)}</div>` : ""}
        </div>
      </div>

      <div class="title-wrap"><div class="lines"></div><div class="title">Bon de Commande N° ${safe(commande.numero)}</div><div class="lines"></div></div>

      <div class="info-grid">
        <div class="box">
          <h4>Client</h4>
          <div class="kv"><b>Nom :</b><span>${safe(clientNom)}</span></div>
          <div class="kv"><b>Adresse :</b><span style="white-space:pre-line">${safe(clientAdresse)||"—"}</span></div>
        </div>
        <div class="box">
          <h4>Informations commande</h4>
          <div class="kv"><b>Date :</b><span>${this.formatDate(commande.dateCommande)}</span></div>
          <div class="kv"><b>N° :</b><span>${safe(commande.numero)}</span></div>
          <div class="kv"><b>Code Client :</b><span class="value">${safe(commande.codeClient)||"—"}</span></div>
          <div class="kv"><b>Code TVA :</b><span class="value">${safe(commande.codeTVA)||"—"}</span></div>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <colgroup>
            <col class="code"/><col class="des"/><col class="qte"/><col class="pu"/>
            <col class="rem"/><col class="mht"/><col class="tva"/><col class="ttc"/>
          </colgroup>
          <thead>
            <tr><th class="tl">Code</th><th class="tl">Désignation</th><th class="tc">Qté</th><th class="tr">P.U.HT</th><th class="tc">Remise</th><th class="tr">Montant HT</th><th class="tc">TVA%</th><th class="tr">Montant TTC</th></tr>
          </thead>
          <tbody>
            ${
              rows.length
                ? rows.map(l=>{
                    const code=l.code||l.produit?.reference||"";
                    const des=l.designation||l.produit?.designation||"";
                    const qte=l.quantite ?? l.qty ?? 0;
                    const pu =l.prixHT ?? l.prixUnitaire ?? 0;
                    const remise=(l.remise ?? 0);
                    const htNet=l.montantHTNet ?? (qte*pu*(1-remise/100));
                    const tva =l.tva ?? l.produit?.tva ?? 0;
                    const ttc  =l.montantTTC ?? (htNet*(1+tva/100));
                    return `<tr>
                      <td class="code tl">${safe(code)}</td>
                      <td class="tl">${safe(des)}</td>
                      <td class="tc">${qte}</td>
                      <td class="tr">${fmt(pu)} DT</td>
                      <td class="tc">${this._pct(remise)}%</td>
                      <td class="tr">${fmt(htNet)} DT</td>
                      <td class="tc">${this._pct(tva)}%</td>
                      <td class="tr">${fmt(ttc)} DT</td>
                    </tr>`;
                }).join("")
                : `<tr><td class="tc" colspan="8">Aucune ligne.</td></tr>`
            }
          </tbody>
        </table>
      </div>

      <div class="totaux">
        <div class="note">Nous avons bien reçu votre demande. Merci pour votre confiance.</div>
        <div class="tot-box">
          <div class="tot-row"><span>Total HT :</span><b>${fmt(commande.totalHTBrut ?? 0)} DT</b></div>
          <div class="tot-row"><span>Total TVA :</span><b>${fmt(commande.totalTVA ?? 0)} DT</b></div>
          <div class="tot-row"><span>Net à Payer :</span><b>${fmt(commande.netAPayer ?? 0)} DT</b></div>
        </div>
      </div>

      <div class="signs">
        <div class="sign"><label>Notes</label></div>
        <div class="sign"><label>Signature Client</label></div>
        <div class="sign"><label>Signature & Cachet</label></div>
      </div>
    </div>
  </div>`;
}







// Style : on réutilise le style commun
static getStylesBonLivraison() { return this.getStylesDoc(); }

// ---------- BON DE LIVRAISON ----------
static getContenuBonLivraison(livraison){
  const cmd = livraison.commande || {};
  const html = `
    <div class="doc">
      <div class="paper" style="position:relative;">
        <div class="stamp ${this.getStampClass(livraison.statut)}">${this.formatStatut(livraison.statut)}</div>
        ${this.getContenuBonCommande(cmd)
            .replace('<div class="title">Bon de Commande', `<div class="title">Bon de Livraison`)
            .replace('Informations commande','Informations livraison')
        }
      </div>
    </div>`;
  return html;
}

  // ---------------------------
  // Impression (⚠️ sans nouvel onglet)
  // ---------------------------
// ---------------------------
// Impression avec aperçu centré (sidebar/header restent visibles)
// --- Helper: récupère le contenu du <body> si on lui passe un HTML complet
static __extractBody(html) {
  try {
    const styles = (html.match(/<style[^>]*>[\s\S]*?<\/style>/gi) || []).join("");
    const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const body = m ? m[1] : html;
    return styles + body; // ⬅️ on préfixe les styles
  } catch {
    return html;
  }
}


// ---------------------------
// Impression SANS iframe : panneau fixe à droite (header + sidebar restent visibles)
// ---------------------------
static imprimerHTML(html) {
  // 1) Nettoyage si déjà ouvert
  const existing = document.getElementById("___print_panel_wrap");
  if (existing) existing.remove();

  // 2) Panneau wrapper (positionné à droite et plus bas que le header)
  const wrap = document.createElement("div");
  wrap.id = "___print_panel_wrap";
  wrap.style.position = "fixed";
  wrap.style.top ="70px";         // ↓ décalé sous le header
  wrap.style.right = "80px";
  wrap.style.zIndex = "9999";
  wrap.style.width = "min(900px, calc(100vw - 420px))"; // garde un espace pour la sidebar
  wrap.style.maxWidth = "900px";
  wrap.style.height = "calc(100vh - 120px)";
  wrap.style.display = "flex";
  wrap.style.flexDirection = "column";
  wrap.style.background = "#fff";
  wrap.style.border = "1px solid #e5e7eb";
  wrap.style.borderRadius = "12px";
  wrap.style.boxShadow = "0 12px 40px rgba(0,0,0,.18)";
  wrap.style.overflow = "hidden";

  // 3) Barre d’actions
  const bar = document.createElement("div");
  bar.style.display = "flex";
  bar.style.alignItems = "center";
  bar.style.justifyContent = "space-between";
  bar.style.gap = "12px";
  bar.style.padding = "10px 14px";
  bar.style.borderBottom = "1px solid #e5e7eb";
  bar.style.background = "#fff";

  const title = document.createElement("div");
  title.textContent = "Aperçu d'impression";
  title.style.fontWeight = "600";

  const right = document.createElement("div");
  right.style.display = "flex";
  right.style.gap = "8px";

  const btnPrint = document.createElement("button");
  btnPrint.textContent = "Imprimer";
  btnPrint.style.padding = "8px 12px";
  btnPrint.style.borderRadius = "8px";
  btnPrint.style.border = "1px solid #2563eb";
  btnPrint.style.background = "#2563eb";
  btnPrint.style.color = "white";
  btnPrint.style.fontWeight = "600";
  btnPrint.style.cursor = "pointer";

  const btnClose = document.createElement("button");
  btnClose.textContent = "Fermer";
  btnClose.style.padding = "8px 12px";
  btnClose.style.borderRadius = "8px";
  btnClose.style.border = "1px solid #e5e7eb";
  btnClose.style.background = "white";
  btnClose.style.cursor = "pointer";

  right.appendChild(btnPrint);
  right.appendChild(btnClose);
  bar.appendChild(title);
  bar.appendChild(right);

  // 4) Contenu scrollable (on insère TON HTML ici)
  const scroller = document.createElement("div");
  scroller.style.flex = "1 1 auto";
  scroller.style.overflow = "auto";
  scroller.style.padding = "20px";
  scroller.style.background = "#f8fafc";

  const panel = document.createElement("div");
  panel.id = "___print_panel";            // <- cible pour le print sélectif
  panel.style.background = "#fff";
  panel.style.margin = "0 auto";
  panel.style.width = "100%";
  panel.style.maxWidth = "794px";         // largeur A4 approximative @96dpi
  panel.style.boxShadow = "0 2px 18px rgba(0,0,0,.06)";
  panel.style.borderRadius = "10px";
  panel.style.overflow = "hidden";

  // On n’insère que le contenu du <body> si html est un document complet
  panel.innerHTML = this.__extractBody(html);

  scroller.appendChild(panel);
  wrap.appendChild(bar);
  wrap.appendChild(scroller);
  document.body.appendChild(wrap);

  // 5) Règles d’impression : on cache tout sauf le panneau
  const printCSS = document.createElement("style");
  printCSS.id = "___print_panel_css";
  printCSS.textContent = `
    @media print {
      /* Ne montrer que le panneau */
      body * { visibility: hidden !important; }
      #___print_panel_wrap, #___print_panel_wrap * { visibility: visible !important; }
      #___print_panel_wrap { position: fixed !important; inset: 0 !important; width: auto !important; height: auto !important; border: 0 !important; box-shadow: none !important; }
      #___print_panel_wrap > div:first-child { display: none !important; } /* cache la barre (Imprimer/Fermer) à l'impression */
      #___print_panel { width: auto !important; max-width: none !important; box-shadow: none !important; border-radius: 0 !important; }
      /* A4 propre */
      @page { size: A4; margin: 0; }
      html, body { background: #fff; }
    }
  `;
  document.head.appendChild(printCSS);

  // 6) Actions
  btnPrint.onclick = () => window.print();
  btnClose.onclick = () => {
    wrap.remove();
    const css = document.getElementById("___print_panel_css");
    if (css) css.remove();
  };
}


static telechargerPDF(commande, type="facture") {
  const base = (type==="livraison" ? { ...commande.commande, ...commande } : commande) || {};
  const client = (base && base.client) || {};
  const { codeClient, codeTVA } = this.getOrCreateCodesForClient(client);
  const withCodes = { ...base, codeClient: base.codeClient ?? codeClient, codeTVA: base.codeTVA ?? codeTVA };

  const html = `
    <div id="doc-root">
      <style>${this.getStylesDoc()}</style>
      ${this.getContenuDocument(withCodes, type)}
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);

  html2pdf()
    .set({
      margin: 0, // tu peux mettre [10,10,10,10] si tu veux un liseré
      filename: (type==="facture" ? `Facture_` :
                 type==="livraison" ? `Bon_Livraison_` : `Bon_Commande_`) + (commande.numero || "doc") + ".pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },     // net sans alourdir
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ['css','legacy'] }
    })
    .from(container.querySelector('#doc-root'))     // ⬅️ cible le nœud, pas un <html> imbriqué
    .save()
    .then(() => container.remove());
}
}

export default ImpressionService;
