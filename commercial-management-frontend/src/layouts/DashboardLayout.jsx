// src/layouts/DashboardLayout.jsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconDashboard, IconClients, IconProduits, IconCommandes, IconLivraisons,
  IconDossiers, IconFournisseurs, IconUsers, IconFactures, IconSettings
} from "../ui/icons"; // adapte le chemin si besoin


export default function DashboardLayout() {

  const menu = [
  { id: "dashboard",   to: "/dashboard",             label: "Tableau de bord", icon: IconDashboard },
  { id: "clients",     to: "/dashboard/clients",     label: "Clients",          icon: IconClients },
  { id: "produits",    to: "/dashboard/produits",    label: "Produits",         icon: IconProduits },
  { id: "commandes",   to: "/dashboard/commandes",   label: "Commandes",        icon: IconCommandes },
  { id: "livraisons",  to: "/dashboard/livraisons",  label: "Livraisons",       icon: IconLivraisons },
  { id: "dossiers",    to: "/dashboard/dossiers",    label: "Dossiers",         icon: IconDossiers },
  { id: "fournisseurs",to: "/dashboard/fournisseurs",label: "Fournisseurs",     icon: IconFournisseurs },
  { id: "utilisateurs",to: "/dashboard/users",       label: "Utilisateurs",     icon: IconUsers },
  { id: "parametres",  to: "/dashboard/parametres",  label: "Paramètres",       icon: IconSettings },
];

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const initials = `${user?.prenom?.[0] ?? "U"}${user?.nom?.[0] ?? ""}`;
  const [sidebarState, setSidebarState] = useState("expanded"); // "closed" | "open" | "expanded"
  const isMobileOpen = sidebarState === "open";
  const isExpanded = sidebarState === "expanded";

  // Dropdown profil
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const onDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ESC ferme la sidebar en mobile
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSidebarState("closed");
    if (isMobileOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileOpen]);



  const handleLogout = () => { logout(); navigate("/login"); };

  const activeId =
    pathname.startsWith("/dashboard/clients") ? "clients" :
    pathname === "/dashboard" ? "dashboard" :
    menu.find(m => pathname.startsWith(m.to))?.id ?? "dashboard";

  /* ---------------------- NEW: Command Search Component --------------------- */
  function CommandSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const inputRef = useRef(null);
    const listRef = useRef(null);
    const [highlight, setHighlight] = useState(0);


    const IconBox = ({ children, active }) => (
  <span
    className={[
      "w-7 h-7 grid place-items-center rounded-lg border shadow-sm",
      active
        ? "border-blue-400 bg-blue-50 text-blue-600"
        : "border-neutral-200 bg-white text-neutral-700",
    ].join(" ")}
  >
    {children}
  </span>
);

    // Items = menu + actions
    const items = useMemo(() => {
      const base = menu.map(m => ({ type: "route", id: m.id, label: m.label, to: m.to, icon: m.icon }));
      const actions = [
        { type: "action", id: "toggleSidebar", label: isExpanded ? "Réduire la sidebar" : "Étendre la sidebar", icon: "↔️",
          run: () => setSidebarState(s => s === "expanded" ? "closed" : "expanded") },
        { type: "action", id: "logout", label: "Déconnexion", icon: "🚪", run: handleLogout },
        { type: "action", id: "profile", label: "Mon profil", icon: "👤", run: () => navigate("/dashboard/profile") },
        { type: "action", id: "settings", label: "Paramètres", icon: "⚙️", run: () => navigate("/dashboard/parametres") },
      ];
      return [...base, ...actions];
    }, [menu, isExpanded]);

    const filtered = useMemo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return items;
      return items.filter(i =>
        i.label.toLowerCase().includes(q) ||
        (i.type === "route" && i.id.toLowerCase().includes(q))
      );
    }, [items, query]);

    // Global shortcut ⌘K / Ctrl+K
    useEffect(() => {
      const onKey = (e) => {
        const isK = e.key?.toLowerCase() === "k";
        const mod = e.metaKey || e.ctrlKey;
        if (isK && mod) {
          e.preventDefault();
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
        if (e.key === "Escape") setOpen(false);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Close on outside click (desktop dropdown)
    const containerRef = useRef(null);
    useEffect(() => {
      const onDown = (e) => {
        if (!open) return;
        if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      return () => document.removeEventListener("mousedown", onDown);
    }, [open]);

    // Keyboard navigation
    const onKeyDown = (e) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => (h + 1) % Math.max(filtered.length, 1));
        listRef.current?.scrollTo({ top: (highlight + 1) * 44 - 176, behavior: "smooth" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => (h - 1 + filtered.length) % Math.max(filtered.length, 1));
        listRef.current?.scrollTo({ top: (highlight - 1) * 44 - 176, behavior: "smooth" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        const chosen = filtered[highlight];
        if (!chosen) return;
        if (chosen.type === "route") {
          navigate(chosen.to);
        } else {
          chosen.run?.();
        }
        setOpen(false);
        setQuery("");
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
 


    // Render
    return (
      <>
        {/* Input visible dans le header (desktop) */}
        <div
          ref={containerRef}
          className="hidden sm:block relative w-full max-w-xl"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <div
            className={[
              "group flex items-center gap-2 rounded-xl border border-neutral-200 bg-white/80 backdrop-blur px-3 py-2",
              "shadow-[0_8px_24px_rgba(0,0,0,.06)] focus-within:ring-2 focus-within:ring-blue-300 transition",
            ].join(" ")}
            onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0); }}
          >
            <span className="text-neutral-500">⌘K</span>
            <input
              ref={inputRef}
              role="combobox"
              aria-controls="command-list"
              aria-activedescendant={filtered[highlight]?.id ?? ""}
              aria-expanded={open}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
              onKeyDown={onKeyDown}
              placeholder="Search or type a command…"
              className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-400"
            />
            <span className="text-neutral-400">🔎</span>
          </div>

          {/* Dropdown results (desktop) */}
          <div
            data-open={open ? "" : undefined}
            className={[
              "absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white",
              "shadow-xl ring-1 ring-black/5",
              "data-[open]:opacity-100 data-[open]:translate-y-0 data-[open]:pointer-events-auto",
              "opacity-0 -translate-y-1 pointer-events-none transition duration-150",
            ].join(" ")}
          >
            <ul
              id="command-list"
              ref={listRef}
              role="listbox"
              className="max-h-64 overflow-auto py-1"
            >
              {filtered.length === 0 && (
                <li className="px-3 py-3 text-sm text-neutral-500">Aucun résultat</li>
              )}
              {filtered.map((i, idx) => {
                const active = idx === highlight;
                 const isComponent = typeof i.icon === "function";
  const Icon = i.icon; // si c’est un composant
                return (
                  <li
                    id={i.id}
                    key={i.id}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHighlight(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      if (i.type === "route") navigate(i.to);
                      else i.run?.();
                      setOpen(false); setQuery("");
                    }}
                    className={[
                      "flex items-center gap-3 px-3 h-11 cursor-pointer text-sm",
                      active ? "bg-neutral-100" : "hover:bg-neutral-50",
                    ].join(" ")}
                  >
                      <span className="w-7 h-7 grid place-items-center rounded-lg bg-neutral-50">
        {isComponent ? <Icon className="w-5 h-5" /> : i.icon}
      </span>
      <span className="truncate">{i.label}</span>
      {i.type === "route" && (
        <span className="ml-auto text-xs text-neutral-400">{i.to}</span>
      )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Overlay plein écran (mobile) */}
        {open && (
          <div
            className="sm:hidden fixed inset-0 z-[60] bg-black/30 backdrop-blur-[2px] animate-[fade_.15s_ease]"
            onClick={() => setOpen(false)}
          >
            <div
              className="absolute inset-x-3 top-10 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2">
                <span>🔎</span>
                <input
                  autoFocus
                  ref={inputRef}
                  role="combobox"
                  aria-controls="command-list-mobile"
                  aria-expanded
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setHighlight(0); }}
                  onKeyDown={onKeyDown}
                  placeholder="Search or type a command…"
                  className="w-full bg-transparent outline-none text-sm placeholder:text-neutral-400"
                />
                <button className="text-sm text-neutral-500" onClick={() => setOpen(false)}>Fermer</button>
              </div>
              <ul
                id="command-list-mobile"
                ref={listRef}
                role="listbox"
                className="mt-2 max-h-[60vh] overflow-auto rounded-xl border border-neutral-200"
              >
                {filtered.length === 0 && (
                  <li className="px-3 py-3 text-sm text-neutral-500">Aucun résultat</li>
                )}
                {filtered.map((i, idx) => {
                  const active = idx === highlight;
                  return (
                    <li
                      id={i.id}
                      key={i.id}
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setHighlight(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (i.type === "route") navigate(i.to);
                        else i.run?.();
                        setOpen(false); setQuery("");
                      }}
                      className={[
                        "flex items-center gap-3 px-3 h-12 cursor-pointer text-sm",
                        active ? "bg-neutral-100" : "hover:bg-neutral-50",
                      ].join(" ")}
                    >
                      <span className="w-7 h-7 grid place-items-center rounded-lg bg-neutral-50">{i.icon}</span>
                      <span className="truncate">{i.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </>
    );
  }
  /* -------------------- END: Command Search Component ---------------------- */

  return (
    <div className="relative min-h-dvh bg-neutral-50 text-neutral-900 lg:grid lg:grid-cols-[auto_1fr]">
      {/* Overlay mobile */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition ${isMobileOpen ? "bg-black/40 backdrop-blur-sm opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setSidebarState("closed")}
        aria-hidden={!isMobileOpen}
      />

      {/* SIDEBAR */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-72 overflow-x-clip h-dvh flex flex-col",
          "bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70",
          "border-r border-neutral-200 shadow-[0_15px_45px_rgba(0,0,0,.08)]",
          "transition-transform duration-300 will-change-transform",
          isMobileOpen ? "translate-x-0" : "translate-x-[-100%]",
          "lg:sticky lg:top-0 lg:self-start lg:h-[100dvh]",
          isExpanded ? "lg:w-64" : "lg:w-[72px]",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Toggle desktop */}
        <button
          className="hidden lg:grid place-items-center w-9 h-9 rounded-full border border-neutral-200 bg-white
                     shadow-[0_8px_24px_rgba(0,0,0,.08)] hover:bg-neutral-100 active:scale-95 transition
                     absolute top-2 left-2 z-10"
          onClick={() => setSidebarState((s) => (s === "expanded" ? "closed" : "expanded"))}
          aria-label={isExpanded ? "Réduire la sidebar" : "Étendre la sidebar"}
          title={isExpanded ? "Réduire" : "Étendre"}
        >
          <span className="text-base">{isExpanded ? "☰" : "⟨"}</span>
        </button>

        {/* Brand */}
        <div className="hidden lg:flex items-center h-14 border-b border-neutral-200 px-3 pl-16">
          <div className={`transition-all duration-200 ${isExpanded ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <div className="text-xs text-neutral-500 leading-none">Gestion</div>
            <div className="font-semibold leading-none mt-0.5">Commerciale</div>
          </div>
          {isExpanded && (
            <div className="ml-auto size-9 grid place-items-center rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10">
              🏢
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1">
            {menu.map((item) => {
              const active = activeId === item.id;
              const IconComp = item.icon; 
              return (
                <li key={item.id}>
                  <div className="relative group">
                    <span
                      className={[
                        "absolute left-0 top-1/2 -translate-y-1/2 h-8 rounded-r-full",
                        "transition-all duration-200",
                        active ? "w-1.5 bg-blue-500" : "w-0 bg-transparent group-hover:w-1.5 group-hover:bg-blue-400",
                      ].join(" ")}
                    />
                    <NavLink
                      to={item.to}
                      className={[
                        "w-full flex items-center gap-3 rounded-xl mx-2 px-3 py-2 transition-all duration-200",
                        "hover:bg-neutral-100 group-hover:translate-x-[2px]",
                        active ? "bg-neutral-100 font-medium ring-1 ring-neutral-200" : "",
                      ].join(" ")}
                      end={item.id === "dashboard"}
                    >
       

<span
  className={[
    "w-7 h-7 grid place-items-center rounded-lg border shadow-sm",
    active
      ? "border-blue-400 bg-blue-50 text-blue-600"
      : "border-neutral-200 bg-white text-neutral-700",
  ].join(" ")}
>
  <IconComp className="w-5 h-5" />
</span>


                      <span
                        className={[
                          "text-sm whitespace-nowrap overflow-hidden transition-[opacity,transform]",
                          isExpanded ? "lg:opacity-100 lg:translate-x-0" : "lg:opacity-0 lg:-translate-x-2 lg:sr-only",
                        ].join(" ")}
                      >
                        {item.label}
                      </span>
                    </NavLink>

                    {!isExpanded && (
                      <span
                        className="pointer-events-none absolute left-[76px] top-1/2 -translate-y-1/2 origin-left scale-95 opacity-0
                                   group-hover:opacity-100 group-hover:scale-100 rounded-md border border-neutral-200 bg-white
                                   px-2 py-1 text-xs text-neutral-700 shadow-[0_10px_30px_rgba(0,0,0,.08)] transition"
                        role="tooltip"
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="flex flex-col min-h-dvh">
        {/* Header */}
        <header className="fixed inset-x-0 top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-neutral-200 lg:sticky">
          <div className="flex items-center justify-between px-4 sm:px-6 h-14 gap-3">
            <button
              className="lg:hidden inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-100 transition"
              aria-label="Ouvrir/fermer la navigation"
              onClick={() => setSidebarState((s) => (s === "open" ? "closed" : "open"))}
            >
              <span aria-hidden>☰</span>
              <span className="sr-only">Menu</span>
            </button>

            {/* ⬇️ NEW: à la place du titre */}
            <div className="flex-1 flex justify-center sm:justify-start">
              <CommandSearch />
            </div>

            <div className="relative flex items-center gap-2 sm:gap-3">
              {/* Profil */}
              <button
                onClick={() => setShowDropdown((v) => !v)}
                onKeyDown={(e) => e.key === "Escape" && setShowDropdown(false)}
                className="hidden sm:flex items-center gap-2 rounded-full border border-neutral-200 bg-white ps-1 pe-2 py-1 hover:bg-neutral-100 active:scale-[.98] transition group"
                title="Ouvrir le menu profil"
                aria-haspopup="menu"
                aria-expanded={showDropdown}
              >
                <span className="relative">
                  <span className="absolute inset-0 rounded-full ring-2 ring-transparent group-hover:ring-blue-200 transition" />
                  <span className="w-9 h-9 grid place-items-center rounded-full bg-neutral-100 text-sm font-semibold">
                    {initials || "👤"}
                  </span>
                </span>
                <span className="hidden md:flex flex-col text-left leading-tight">
                  <span className="text-sm font-medium truncate max-w-[160px]">
                    {user?.prenom} {user?.nom}
                  </span>
                  <span className="text-[11px] text-neutral-500 capitalize">{user?.role || "utilisateur"}</span>
                </span>
                <span className={`ms-1 text-neutral-400 transition ${showDropdown ? "rotate-180" : ""}`}>▾</span>
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 hover:bg-neutral-100 active:scale-[.98] transition"
                title="Déconnexion"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Déconnexion</span>
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div
                  ref={dropdownRef}
                  role="menu"
                  className="absolute right-0 top-[46px] sm:top-[48px] w-64 rounded-2xl border bg-white p-2 shadow-xl ring-1 ring-black/5 animate-[pop_.18s_ease] z-50"
                >
                  <div className="px-2 py-2 flex items-center gap-2">
                    <div className="w-9 h-9 grid place-items-center rounded-full bg-neutral-100 text-sm font-semibold">
                      {initials || "👤"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {user?.prenom} {user?.nom}
                      </div>
                      <div className="text-xs text-neutral-500 truncate">{user?.email || "—"}</div>
                    </div>
                  </div>
                  <div className="my-2 h-px bg-neutral-200" />
                  <button onClick={() => { setShowDropdown(false); navigate("/dashboard/profile"); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-neutral-50">👤 Mon profil</button>
                  <button onClick={() => { setShowDropdown(false); navigate("/dashboard/parametres"); }} className="w-full text-left rounded-lg px-3 py-2 hover:bg-neutral-50">⚙️ Paramètres</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Contenu (Outlet rend la page enfant) */}
        <div className="mt-14 lg:mt-0">
          <main className="p-4 sm:p-6 lg:p-8 ">
            <div className="mx-auto max-w-7xl rounded-2xl border border-neutral-200 bg-white shadow-[0_8px_24px_rgba(0,0,0,.06)] p-4 sm:p-6 lg:p-8">
            <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
