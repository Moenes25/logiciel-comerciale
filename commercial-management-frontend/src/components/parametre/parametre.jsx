import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

function clsx(...xs){ return xs.filter(Boolean).join(" "); }

export default function Parametres() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("profil");
  const [toast, setToast] = useState(null);

  const tabs = useMemo(() => ([
    { id: "profil", label: "Profil", icon: "👤" },
    { id: "societe", label: "Société", icon: "🏢" },
    { id: "preferences", label: "Préférences", icon: "✨" },
    { id: "securite", label: "Sécurité", icon: "🔒" },
  ]), []);

  const onSave = (e) => {
    e.preventDefault();
    // TODO: appeler tes services ici
    setToast("Paramètres enregistrés ✅");
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="min-h-[60vh] relative">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-4 z-50 rounded-xl border bg-white px-4 py-2 shadow-xl ring-1 ring-black/5 animate-[pop_.18s_ease]">
          <span className="text-sm">{toast}</span>
        </div>
      )}

      {/* Header local */}
      <div className="sticky -top-6 z-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 mb-4
                      bg-white/70 backdrop-blur border-b border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 grid place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-inner">
              <span>⚙️</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold">Paramètres</h1>
              <p className="text-xs sm:text-sm text-neutral-500 -mt-0.5">Personnalisez votre espace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-neutral-50 active:scale-[.98] transition"
            >
              ← Retour
            </button>
            <button
              form="form-global"
              type="submit"
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 active:scale-[.98] transition"
            >
              💾 Enregistrer tout
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={clsx(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition",
                tab === t.id ? "bg-neutral-100 border-neutral-300" : "hover:bg-neutral-50"
              )}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenu */}
      <form id="form-global" onSubmit={onSave} className="space-y-6">
        {/* PROFIL */}
        <Section active={tab==="profil"} title="Profil utilisateur" hint="👤 Infos personnelles">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Prénom" />
            <Field label="Nom" />
            <Field label="Email" type="email" />
            <Field label="Téléphone" />
          </div>
        </Section>

        {/* SOCIETE */}
        <Section active={tab==="societe"} title="Informations société" hint="🏢 Identité & TVA">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Raison sociale" />
            <Field label="TVA" />
            <div className="sm:col-span-2"><Field label="Adresse" /></div>
          </div>
        </Section>

        {/* PREFERENCES */}
        <Section active={tab==="preferences"} title="Préférences" hint="✨ App & UI">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Toggle label="Mode sombre automatique" />
            <Toggle label="Notifications email" />
            <Select label="Langue" options={["Français","English","العربية"]} />
            <Select label="Devise" options={["TND","EUR","USD"]} />
          </div>
        </Section>

        {/* SECURITE */}
        <Section active={tab==="securite"} title="Sécurité" hint="🔒 Mots de passe & sessions">
          <Accordion title="Changer le mot de passe">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Ancien mot de passe" type="password" />
              <Field label="Nouveau" type="password" />
              <Field label="Confirmer" type="password" />
            </div>
          </Accordion>
          <Accordion title="Sessions & appareils">
            <div className="space-y-2">
              {["Chrome • Windows","Safari • iPhone","Edge • Office"].map((s,i)=>(
                <div key={i} className="flex items-center justify-between rounded-xl border px-3 py-2">
                  <span className="text-sm">{s}</span>
                  <button className="rounded-lg border px-2.5 py-1.5 text-sm hover:bg-neutral-50">Déconnecter</button>
                </div>
              ))}
            </div>
          </Accordion>
        </Section>
      </form>
    </div>
  );
}

/* ---------- petits composants réutilisables ---------- */
function Section({active, title, hint, children}) {
  return (
    <section
      data-active={active ? "" : undefined}
      className="rounded-2xl border p-4 sm:p-5 shadow-sm
                 data-[active]:opacity-100 data-[active]:translate-y-0
                 opacity-0 -translate-y-1 pointer-events-none data-[active]:pointer-events-auto
                 transition"
    >
      <header className="flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {hint && <span className="text-sm text-neutral-500">{hint}</span>}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function Field({label, type="text"}) {
  return (
    <div>
      <label className="text-xs text-neutral-500">{label}</label>
      <input type={type} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
    </div>
  );
}
function Toggle({label}) {
  return (
    <label className="flex items-center justify-between rounded-xl border px-3 py-2">
      <span className="text-sm">{label}</span>
      <input type="checkbox" className="size-4" />
    </label>
  );
}
function Select({label, options=[]}) {
  return (
    <div>
      <label className="text-xs text-neutral-500">{label}</label>
      <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  const id = title.replace(/\s+/g,"-").toLowerCase();
  return (
    <div className="mt-4 rounded-xl border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(v=>!v)}
        className="w-full flex items-center justify-between px-3 py-2 text-left"
      >
        <span className="font-medium">{title}</span>
        <span className={clsx("transition-transform", open && "rotate-180")}>▾</span>
      </button>
      <div
        id={id}
        className={clsx(
          "px-3 pb-3 overflow-hidden transition-all duration-300 ease-out",
          open ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}
