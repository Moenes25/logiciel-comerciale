// KpiCard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/** Compteur animé sans lib */
function useCountUp(value, { duration = 800, fps = 60 } = {}) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef();
  useEffect(() => {
    const start = performance.now();
    const from = display;
    const delta = value - from;
    const frameTime = 1000 / fps;
    let last = 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      if (now - last > frameTime) {
        setDisplay(Math.round(from + delta * ease(t)));
        last = now;
      }
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, fps]);
  return display;
}

/** Petit bump à chaque changement de valeur */
function useBump(dep, ms = 250) {
  const [bump, setBump] = useState(false);
  useEffect(() => {
    setBump(true);
    const id = setTimeout(() => setBump(false), ms);
    return () => clearTimeout(id);
  }, [dep, ms]);
  return bump;
}

/** Tilt 3D sans lib */
function useTilt() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (x - 0.5).toFixed(3));
      el.style.setProperty("--my", (y - 0.5).toFixed(3));
    };
    const reset = () => {
      el.style.setProperty("--mx", 0);
      el.style.setProperty("--my", 0);
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);
  return ref;
}

export default function KpiCard({
  buyers = 156,
  visitors = 2345,
  products = 89,
  live = true,
  title = "Store KPIs",
  className = "",
}) {
  const [targets, setTargets] = useState({ buyers, visitors, products });
  const [ripple, setRipple] = useState(null); // ripple click

  // variations continues (live)
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setTargets((t) => ({
        buyers: Math.max(0, t.buyers + (Math.random() > 0.5 ? 1 : -1)),
        visitors: Math.max(0, t.visitors + (Math.random() > 0.5 ? 3 : -2)),
        products: Math.max(0, t.products + (Math.random() > 0.5 ? 1 : 0)),
      }));
    }, 1500);
    return () => clearInterval(id);
  }, [live]);

  // valeurs affichées + tendances
  const buyersDisplay = useCountUp(targets.buyers);
  const visitorsDisplay = useCountUp(targets.visitors);
  const productsDisplay = useCountUp(targets.products);

  const trend = useMemo(() => {
    // simple tendance: signe du “pas” courant
    return {
      buyers: Math.sign(targets.buyers - buyersDisplay),
      visitors: Math.sign(targets.visitors - visitorsDisplay),
      products: Math.sign(targets.products - productsDisplay),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targets, buyersDisplay, visitorsDisplay, productsDisplay]);

  // sparkline “vivante”
  const spark = useMemo(() => {
    const pts = Array.from({ length: 28 }, (_, i) => {
      const x = (i / 27) * 100;
      const base = 52 + 18 * Math.sin(i * 0.55);
      const noise = (Math.random() - 0.5) * 7;
      const y = Math.max(6, Math.min(94, base + noise));
      return [x, y];
    });
    return "M " + pts.map(([x, y]) => `${x},${y}`).join(" L ");
  }, [targets.buyers, targets.visitors, targets.products]);

  const progress = Math.max(8, Math.min(100, Math.round((targets.visitors % 1000) / 10)));

  // tilt ref
  const tiltRef = useTilt();

  // ripple handler
  const onClick = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - box.left, y: e.clientY - box.top, t: Date.now() });
  };

  return (
    <article
      ref={tiltRef}
      onClick={onClick}
      className={[
        "kpi-card group rounded-2xl border border-neutral-200 p-4 bg-white overflow-hidden",
        "will-change-transform cursor-pointer",
        className,
      ].join(" ")}
      style={{
        transform:
          "perspective(1000px) rotateX(calc(var(--my) * -6deg)) rotateY(calc(var(--mx) * 6deg)) translateZ(0)",
      }}
    >
      {/* shiny sweep au hover */}
      <span className="kpi-sweep" />

      {/* Ripple */}
      {ripple && (
        <span
          key={ripple.t}
          className="kpi-ripple"
          style={{ left: ripple.x, top: ripple.y }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="fx-title text-sm font-semibold text-neutral-700">{title}</h3>
        <div className="kpi-chip">
          <span className="kpi-live-pulse" />
          Live
        </div>
      </div>

      {/* KPIs (stagger) */}
      <div className="grid grid-cols-3 gap-3 mb-[18px]">
        <KpiItem
          label="Clients"
          value={buyersDisplay}
          icon="🛍️"
          iconClass="kpi-icon--green"
          trend={trend.buyers}
          delay={0}
        />
        <KpiItem
          label="Visiteurs"
          value={visitorsDisplay}
          icon="👀"
          iconClass="kpi-icon--blue"
          trend={trend.visitors}
          delay={0.07}
        />
        <KpiItem
          label="Produits"
          value={productsDisplay}
          icon="📦"
          iconClass="kpi-icon--amber"
          trend={trend.products}
          delay={0.14}
        />
      </div>

      {/* Sparkline */}
      <div className="mt-[6px] mb-[18px]">
        <div className="kpi-sparkline">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-16">
            <defs>
              <linearGradient id="kpiFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="rgba(59,130,246,0.25)" />
                <stop offset="100%" stopColor="rgba(59,130,246,0.0)" />
              </linearGradient>
              <filter id="kpiGlow">
                <feDropShadow dx="0" dy="0" stdDeviation="1.6" floodColor="rgba(59,130,246,.6)" />
              </filter>
            </defs>
            <path d={`${spark} L 100,100 L 0,100 Z`} fill="url(#kpiFill)" className="kpi-area" />
            <path d={spark} vectorEffect="non-scaling-stroke" filter="url(#kpiGlow)" />
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-[6px]">
        <div className="kpi-progress">
          <div className="kpi-progress__bar" style={{ width: `${progress}%` }} />
          <div className="kpi-progress__shine" />
        </div>
        <div className="mt-1 text-xs text-neutral-500">Load {progress}%</div>
      </div>
    </article>
  );
}

function KpiItem({ label, value, icon, iconClass = "", trend = 0, delay = 0 }) {
  const bump = useBump(value);
  const up = trend > 0;
  const down = trend < 0;
  return (
    <div
      className="kpi-item"
      style={{ animationDelay: `${delay}s` }}
      title={up ? "En hausse" : down ? "En baisse" : "Stable"}
    >
      <div className={["kpi-icon", iconClass].join(" ")}>{icon}</div>
      <div className="leading-tight">
        <div className={["kpi-number", bump ? "kpi-number--bump" : ""].join(" ")}>
          {value.toLocaleString()}
          <span
            className={[
              "kpi-trend",
              up ? "kpi-trend--up" : "",
              down ? "kpi-trend--down" : "",
            ].join(" ")}
          >
            {up ? "↑" : down ? "↓" : "•"}
          </span>
        </div>
        <div className="kpi-label">{label}</div>
      </div>
    </div>
  );
}
