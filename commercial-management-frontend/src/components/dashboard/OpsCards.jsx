// OpsCards.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/* -------- hooks utilitaires -------- */
function useCountUp(value, { duration = 900, fps = 60 } = {}) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = display;
    const delta = value - from;
    const frameTime = 1000 / fps;
    let last = 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      if (now - last > frameTime) {
        setDisplay(Math.round(from + delta * ease(t)));
        last = now;
      }
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, fps]);
  return display;
}

function usePrev(v) {
  const ref = useRef(v);
  useEffect(() => void (ref.current = v), [v]);
  return ref.current;
}

function useTilt() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e) => {
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
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
    };
  }, []);
  return ref;
}

/* -------- composants internes -------- */
function Delta({ value }) {
  const positive = value >= 0;
  return (
    <span
      aria-label={positive ? `Hausse de ${value}%` : `Baisse de ${Math.abs(value)}%`}
      className={["ops-delta", positive ? "ops-delta--up" : "ops-delta--down"].join(" ")}
    >
      {positive ? "▲" : "▼"} {Math.abs(value)}%
    </span>
  );
}

function MetricCard({
  title,
  icon,
  color = "#60a5fa",
  value,
  delta = 0,
  progress = 65, // 0..100
  className = "",
  iconAnim = "spin", // 'spin' | 'bounce' | 'wiggle'
}) {
  const display = useCountUp(value);
  const prev = usePrev(display);
  const increased = display > (prev ?? display);

  // ripple & confetti
  const [ripple, setRipple] = useState(null);
  const [boom, setBoom] = useState(0);

  useEffect(() => {
    if (increased) setBoom((b) => b + 1); // déclenche confetti à chaque hausse
  }, [increased]);

  const onClick = (e) => {
    const box = e.currentTarget.getBoundingClientRect();
    setRipple({ x: e.clientX - box.left, y: e.clientY - box.top, t: Date.now() });
  };

  // jauge circulaire (SVG)
  const size = 56;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const dash = (progress / 100) * C;

  // tilt ref
  const tiltRef = useTilt();

  // CSS variables
  const styleVars = useMemo(
    () => ({
      "--ops-c": C,
      "--ops-dash": dash,
      "--ops-color": color,
    }),
    [C, dash, color]
  );

  return (
    <article
      ref={tiltRef}
      onClick={onClick}
      className={[
        "ops-card w-full rounded-2xl border border-neutral-200 p-4 bg-white overflow-hidden",
        "will-change-transform",
        className,
      ].join(" ")}
      style={{
        ...styleVars,
        transform:
          "perspective(1000px) rotateX(calc(var(--my) * -6deg)) rotateY(calc(var(--mx) * 6deg))",
      }}
      role="group"
      aria-label={title}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick(e)}
    >
      {/* shimmer au mount */}
      <span className="ops-shimmer" />
      {/* halo gradient on hover */}
      <span className="ops-halo" />

      {/* Ripple click */}
      {ripple && (
        <span
          key={ripple.t}
          className="ops-ripple"
          style={{ left: ripple.x, top: ripple.y, background: color + "33" }}
          onAnimationEnd={() => setRipple(null)}
        />
      )}

      {/* Confetti subtil quand ça monte */}
      <div className="ops-confetti" data-burst={boom} aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <i key={`${boom}-${i}`} />
        ))}
      </div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={[
              "ops-icon",
              iconAnim === "spin" ? "ops-icon--spin" : iconAnim === "bounce" ? "ops-icon--bounce" : "ops-icon--wiggle",
            ].join(" ")}
            style={{ background: `${color}15`, color }}
            aria-hidden
          >
            <span className="text-lg">{icon}</span>
          </div>
          <div className="leading-tight">
            <div className="text-xs text-neutral-500">{title}</div>
            <div className="ops-value" aria-live="polite">
              {display.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Gauge */}
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="ops-gauge">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="#eef2f7" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--ops-color)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            className="ops-gauge__progress"
          />
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Delta value={delta} />
        <span className="text-xs text-neutral-500">vs période précédente</span>
      </div>

      {/* barre de progression subtile */}
      <div className="mt-3 ops-bar" aria-hidden>
        <div className="ops-bar__fill" style={{ width: `${Math.max(10, progress)}%` }} />
        <div className="ops-bar__shine" />
      </div>
    </article>
  );
}

/* --- group: Factures / Dossiers / Fournisseurs --- */
export default function OpsCards({ factures = 38, dossiers = 67, fournisseurs = 23 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <MetricCard
        title="Factures"
        icon="🧾"
        color="#f97316"
        value={factures}
        delta={+12}
        progress={72}
        iconAnim="spin"
      />
      <MetricCard
        title="Dossiers"
        icon="📁"
        color="#8b5cf6"
        value={dossiers}
        delta={-4}
        progress={58}
        iconAnim="wiggle"
      />
      <MetricCard
        title="Fournisseurs"
        icon="🏢"
        color="#06b6d4"
        value={fournisseurs}
        delta={+7}
        progress={41}
        iconAnim="bounce"
      />
    </div>
  );
}
