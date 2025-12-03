// Icônes 24x24, style outline (stroke=1.8)
import { FaWarehouse } from 'react-icons/fa';

const Svg = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p} />;

export const IconDashboard   = (p)=>(<Svg {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></Svg>);
export const IconClients     = (p)=>(<Svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="3"/><path d="M22 21v-2a4 4 0 0 0-3-3"/><path d="M16 3.1a3 3 0 0 1 0 5.8"/></Svg>);
export const IconProduits    = (p)=>(<Svg {...p}><path d="M21 16V8l-9-5-9 5v8l9 5 9-5Z"/><path d="m3.3 7.5 8.7 5 8.7-5"/></Svg>);
export const IconCommandes   = (p)=>(<Svg {...p}><path d="M3 7h18"/><path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 13h8"/><path d="M8 17h6"/></Svg>);
export const IconLivraisons  = (p)=>(<Svg {...p}><rect x="3" y="7" width="13" height="10" rx="2"/><path d="M16 11h4l2 3v3h-6"/><circle cx="7" cy="19" r="2"/><circle cx="19" cy="19" r="2"/></Svg>);
export const IconDossiers    = (p)=>(<Svg {...p}><path d="M3 7h6l2 2h10v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7V5a2 2 0 0 1 2-2h4l2 2"/></Svg>);
export const IconFournisseurs= (p)=>(<Svg {...p}><path d="M3 21h18"/><path d="M6 21V7l6-3 6 3v14"/><path d="M6 10h12"/></Svg>);
export const IconUsers       = (p)=>(<Svg {...p}><path d="M18 21v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="3"/></Svg>);
export const IconFactures    = (p)=>(<Svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16l3-2 3 2 3-2 3 2V8z"/><path d="M14 2v6h6"/></Svg>);
export const IconSettings    = (p)=>(<Svg {...p}><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.9 1.9 0 0 0 .38 2.09l.05.05a2 2 0 1 1-2.83 2.83l-.05-.05A1.9 1.9 0 0 0 15 19.4a1.9 1.9 0 0 0-1 .28 1.9 1.9 0 0 0-1 .28l-.1.06a1.9 1.9 0 0 0-2.09.38l-.05.05a2 2 0 1 1-2.83-2.83l.05-.05A1.9 1.9 0 0 0 5 15a1.9 1.9 0 0 0-.28-1 1.9 1.9 0 0 0-.28-1l-.06-.1A1.9 1.9 0 0 0 4 9.5a1.9 1.9 0 0 0-.38-2.09l-.05-.05a2 2 0 1 1 2.83-2.83l.05.05A1.9 1.9 0 0 0 9 4.6c.33 0 .66-.09 1-.28l.1-.06a1.9 1.9 0 0 0 2.09-.38l.05-.05a2 2 0 1 1 2.83 2.83l-.05.05A1.9 1.9 0 0 0 19 9c0 .33.09.66.28 1l.06.1c.19.34.28.67.28 1s-.09.66-.28 1l-.06.1c-.19.34-.28.67-.28 1Z"/></Svg>);
export const IconStock = FaWarehouse;

const IconBox = ({ children, active }) => (
  <span
    className={[
      "w-7 h-7 grid place-items-center rounded-lg border",
      active ? "border-blue-400 bg-blue-50 text-blue-600" : "border-neutral-200 bg-white text-neutral-700",
      "shadow-sm"
    ].join(" ")}
  >
    {children}
  </span>
);
