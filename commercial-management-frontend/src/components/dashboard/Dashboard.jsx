import React, { useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const initials = `${user?.prenom?.[0] ?? "U"}${user?.nom?.[0] ?? ""}`;

  // --- Période sélectionnée
  const [period, setPeriod] = useState("mois"); // "semaine" | "mois" | "annee"

  // --- Données mockées par période (branche tes vraies données ici)
  const kpisByPeriod = useMemo(() => ({
    semaine: {
      cards: [
        { label: "Clients", value: 42, delta: +12, icon: "👥" },
        { label: "Commandes", value: 19, delta: +8, icon: "🛒" },
        { label: "Produits", value: 12, delta: -3, icon: "📦" },
        { label: "Factures", value: 11, delta: +15, icon: "🧾", meta: "2 impayées" },
        { label: "Fournisseurs", value: 5, delta: +2, icon: "🏢" },
        { label: "Dossiers", value: 7, delta: 0, icon: "📁" },
      ],
    },
    mois: {
      cards: [
        { label: "Clients", value: 156, delta: +12, icon: "👥" },
        { label: "Commandes", value: 42, delta: +8, icon: "🛒" },
        { label: "Produits", value: 89, delta: -3, icon: "📦" },
        { label: "Factures", value: 38, delta: +15, icon: "🧾", meta: "5 impayées" },
        { label: "Fournisseurs", value: 23, delta: +4, icon: "🏢" },
        { label: "Dossiers", value: 23, delta: +1, icon: "📁" },
      ],
    },
    annee: {
      cards: [
        { label: "Clients", value: 1240, delta: +6, icon: "👥" },
        { label: "Commandes", value: 612, delta: +4, icon: "🛒" },
        { label: "Produits", value: 112, delta: -1, icon: "📦" },
        { label: "Factures", value: 580, delta: +9, icon: "🧾", meta: "12 impayées" },
        { label: "Fournisseurs", value: 41, delta: +2, icon: "🏢" },
        { label: "Dossiers", value: 208, delta: +3, icon: "📁" },
      ],
    },
  }), []);

  const kpis = kpisByPeriod[period].cards;

  const periodTab = (id, label) => (
    <button
      key={id}
      onClick={() => setPeriod(id)}
      aria-pressed={period === id}
      className={`rounded-xl px-3 py-1.5 text-sm transition
        ${period === id
          ? "bg-blue-600 text-white shadow"
          : "bg-white border text-neutral-700 hover:bg-neutral-50"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-dvh bg-neutral-50">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {/* Header + filtres */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Tableau de Bord</h1>
            <p className="text-sm text-neutral-600">Vue d’ensemble de votre activité commerciale</p>
          </div>
          <div className="flex items-center gap-1.5">
            {periodTab("semaine", "Semaine")}
            {periodTab("mois", "Mois")}
            {periodTab("annee", "Année")}
          </div>
        </div>

        {/* Hero soft + décor */}
        <section className="welcome-hero relative rounded-2xl border border-neutral-200 p-6">
          <div className="welcome-hero__bg" aria-hidden />
          <span className="welcome-hero__ring" aria-hidden />
          <span className="welcome-hero__shine" aria-hidden />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 backdrop-blur px-2.5 py-1 text-[11px] text-neutral-600 shadow-sm">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Espace sécurisé
              </div>
              <h2 className="mt-2 text-xl sm:text-2xl font-extrabold">Bienvenue {user?.prenom ?? ""} {user?.nom ?? ""} 👋</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="badge-soft">Temps réel</span>
                <span className="badge-soft">Stocks & commandes</span>
                <span className="badge-soft">Facturation</span>
              </div>
            </div>
            <div className="shrink-0">
              <div className="grid place-items-center size-16 rounded-full bg-gradient-to-br from-blue-500/15 to-emerald-500/15 ring-2 ring-white">
                <span className="font-bold">{initials}</span>
              </div>
            </div>
          </div>
        </section>



<section className="rounded-2xl border bg-white/70 backdrop-blur p-4 shadow-sm ring-1 ring-black/5" aria-labelledby="actions-rapides-title">
  <div className="mb-3 flex items-center justify-between">
    <h3 id="actions-rapides-title" className="text-sm font-semibold text-neutral-800">
      ⚡ Actions rapides
    </h3>
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] text-neutral-600">
      Nouveau
    </span>
  </div>
  <div className="h-px w-full bg-gradient-to-r from-neutral-200/80 to-transparent mb-3" />
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
    <QuickAction className="w-full" icon="👤"  tone="blue"    label="Nouveau Client"    onClick={() => navigate("/dashboard/clients/nouveau")} />
       <QuickAction className="w-full" icon="📦"  tone="amber"   label="Nouveau Produit"   onClick={() => navigate("/dashboard/produits/nouveau")} />
    <QuickAction className="w-full" icon="🛒"  tone="violet"  label="Nouvelle Commande" onClick={() => navigate("/dashboard/commandes/nouveau")} />
    <QuickAction className="w-full" icon="🚚"  tone="emerald" label="Nouvelle Livraison"  onClick={() => navigate("/dashboard/livraisons")} />
   
  </div>
</section>




        {/* KPIs grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
          {kpis.map((k, i) => (
            <KpiCard key={k.label} index={i} {...k} />
          ))}
        </section>

        {/* Panels secondaires */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Panel title="Activités Récentes" right={<ChipLive />}>
            <div className="space-y-2">
              {[
                ["📁", "Nouveau dossier", "Projet Alpha — il y a 2 h"],
                ["👤", "Nouveau client", "SARL Technologie — il y a 3 h"],
                ["🧾", "Facture générée", "F-2024-001 — il y a 1 j"],
                ["📦", "Produit mis à jour", "Stock ajusté — il y a 2 j"],
              ].map(([ic, title, meta], i) => (
                <article key={i} className="timeline__item">
                  <div className="timeline__bullet">{ic}</div>
                  <div className="min-w-0 flex-1">
                    <p className="timeline__title">{title}</p>
                    <p className="timeline__meta">{meta}</p>
                  </div>
                  <button className="rounded-lg border px-2 py-1 text-sm hover:bg-neutral-50">👁️</button>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="Dossiers Récents" right={<Chip text="Mises à jour" />}>
            <div className="space-y-2">
              {[
                ["📁", "Projet Alpha", "Client: ABC Entreprise • En cours"],
                ["📁", "Contrat Beta", "Client: XYZ Corp • En attente"],
                ["📁", "Devis Gamma", "Client: Services Plus • Validé"],
              ].map(([ic, title, meta], i) => (
                <div key={i} className="listcard tilt-on-hover">
                  <div className="listcard__icon">{ic}</div>
                  <div className="min-w-0 flex-1">
                    <p className="listcard__title">{title}</p>
                    <p className="listcard__meta">{meta}</p>
                  </div>
                  <button className="rounded-lg border px-2 py-1 text-sm hover:bg-neutral-50">👁️</button>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Informations Rapides" right={<Chip text="Aujourd’hui" />}>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Dossiers actifs", "15"],
                ["En attente", "8"],
                ["Impayées", "5"],
                ["Messages non lus", "3"],
              ].map(([l, v]) => (
                <div key={l} className="quick-kpi">
                  <div className="quick-kpi__label">{l}</div>
                  <div className="quick-kpi__value">{v}</div>
                  <span className="quick-kpi__shine" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
};

/* ---------- petits composants ---------- */

function QuickAction({ icon = "＋", label, onClick, tone = "blue" }) {
  const tones = {
    blue:    { from:"from-blue-500/15",    to:"to-blue-500/5",    ring:"ring-blue-200/60" },
    violet:  { from:"from-violet-500/15",  to:"to-violet-500/5",  ring:"ring-violet-200/60" },
    emerald: { from:"from-emerald-500/15", to:"to-emerald-500/5", ring:"ring-emerald-200/60" },
    amber:   { from:"from-amber-500/15",   to:"to-amber-500/5",   ring:"ring-amber-200/60" },
  }[tone];

  return (
    <button onClick={onClick} className="qa-btn inline-flex items-center gap-2 px-3.5 py-2 text-sm text-neutral-800 group">
      <span className={`qa-icon grid size-7 place-items-center rounded-lg bg-gradient-to-br ${tones.from} ${tones.to} ring-1 ${tones.ring}`}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      <span className="qa-shine" aria-hidden />
    </button>
  );
}


function KpiCard({ label, value, delta, icon, meta, index }) {
  const positive = delta >= 0;
  const deltaClasses = positive
    ? "text-emerald-600 border-emerald-200 bg-emerald-50/60"
    : "text-rose-600 border-rose-200 bg-rose-50/60";

  return (
    <article
      className="kpi-pro kpi-stagger"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="kpi-pro__icon">{icon}</div>
        <span className={`kpi-pro__delta ${deltaClasses}`}>
          {positive ? "↑" : "↓"} {Math.abs(delta)}%
        </span>
      </div>

      <div className="mt-3">
        <div className="text-3xl font-extrabold leading-none tracking-tight">{value}</div>
        <div className="text-sm text-neutral-600">{label}</div>
        {meta && <div className="mt-1 text-xs text-neutral-500">{meta}</div>}
      </div>

      {/* mini sparkline décorative (SVG fixe, pas de lib) */}
      <svg className="kpi-pro__spark" width="76" height="24" viewBox="0 0 76 24" fill="none">
        <defs>
          <linearGradient id="gk" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={positive ? "#10B981" : "#EF4444"} stopOpacity="0.35" />
            <stop offset="100%" stopColor={positive ? "#10B981" : "#EF4444"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M1,16 C10,12 18,18 26,10 C32,4 40,16 48,9 C55,3 62,11 75,6"
          stroke={positive ? "#10B981" : "#EF4444"}
          strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M1,24 L1,16 C10,12 18,18 26,10 C32,4 40,16 48,9 C55,3 62,11 75,6 L75,24 Z"
          fill="url(#gk)"
        />
      </svg>
    </article>
  );
}

function Chip({ text }) {
  return <span className="chip inline-flex items-center rounded-full border px-2.5 py-1 text-xs bg-white">{text}</span>;
}
function ChipLive() {
  return (
    <span className="chip chip--live inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs bg-white">
      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Flux
    </span>
  );
}

function Panel({ title, right, children }) {
  return (
    <section className="panel tilt-on-hover rounded-2xl border bg-white p-5 shadow-sm">
      <header className="panel__header mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-neutral-800">{title}</h3>
        {right}
      </header>
      {children}
    </section>
  );
}


export default Dashboard;
