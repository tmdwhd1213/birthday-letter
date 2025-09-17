import React, { useEffect, useMemo, useRef, useState } from "react";
import { hsl } from "../utils/util";

interface BalloonsLayerProps {
  enabled?: boolean;
  count?: number;
}

export default function BalloonsLayer({
  enabled = true,
  count = 14,
}: BalloonsLayerProps) {
  const reduce = useMemo(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const items = useMemo(() => {
    if (!enabled || reduce) return [] as ReturnType<typeof makeBalloonProps>[];
    return Array.from({ length: count }, () => makeBalloonProps());
  }, [enabled, reduce, count]);

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden>
      {items.map((b) => (
        <Balloon key={b.id} {...b} />
      ))}
      <style>{`
        @keyframes rise {
        0%   { transform: translate3d(var(--x,50vw), 110vh, 0)  scale(var(--s,1)); opacity: 0; }
        5%   { opacity: 1; } 
        95%  { opacity: 1; } 
        100% { transform: translate3d(var(--x,50vw), -140vh, 0) scale(var(--s,1)); opacity: 0; }
        }
        @keyframes sway {
        0%,100% { transform: translateX(-6px); }
        50% { transform: translateX(6px); }
        }
`}</style>
    </div>
  );
}

function makeBalloonProps() {
  const id = Math.random().toString(36).slice(2, 9);
  const x = Math.round(Math.random() * 100); // vw
  const s = (0.9 + Math.random() * 0.9).toFixed(2); // scale
  const hue = Math.floor(Math.random() * 360);
  const dur = (16 + Math.random() * 12).toFixed(1) + "s";
  const delay = (Math.random() * -20).toFixed(2) + "s";
  return { id, x, s, hue, dur, delay } as const;
}

interface BalloonProps {
  id: string;
  x: number;
  s: string;
  hue: number;
  dur: string;
  delay: string;
}

function Balloon({ id, x, s, hue, dur, delay }: BalloonProps) {
  const grad1 = `grad-${id}`;
  const gradHL = `hl-${id}`;
  const shadowId = `shadow-${id}`;

  return (
    <div
      className="absolute left-0 top-0"
      style={
        {
          "--x": `${x}vw`,
          "--s": s,
          animation: `rise ${dur} linear ${delay} infinite`,
          willChange: "transform, opacity",
        } as React.CSSProperties
      }>
      <svg
        className="[animation:sway_2.8s_ease-in-out_infinite_alternate]"
        width={72}
        height={110}
        viewBox="0 0 72 110"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,.15))" }}>
        <defs>
          <linearGradient id={grad1} x1="10" y1="0" x2="62" y2="78">
            <stop offset="0%" stopColor={hsl(hue, 85, 70)} />
            <stop offset="100%" stopColor={hsl(hue + 25, 75, 55)} />
          </linearGradient>
          <radialGradient
            id={gradHL}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(22 22) rotate(45) scale(22 18)">
            <stop offset="0%" stopColor="#fff" stopOpacity=".9" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="off" />
            <feMerge>
              <feMergeNode in="off" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 끈 */}
        <path
          d="M36 82 C 28 94, 44 98, 34 110"
          stroke="rgba(0,0,0,.25)"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />

        {/* 몸체 */}
        <g filter={`url(#${shadowId})`}>
          <path
            d="M36 6C22 6 10 18 10 36c0 22 16 36 26 36s26-14 26-36C62 18 50 6 36 6z"
            fill={`url(#${grad1})`}
            stroke="rgba(0,0,0,.15)"
          />
          {/* 하이라이트 */}
          <ellipse cx="26" cy="22" rx="10" ry="8" fill={`url(#${gradHL})`} />
          {/* 매듭 */}
          <path d="M36 72 l-6 6 h12 z" fill={hsl(hue, 60, 35)} opacity=".9" />
        </g>
      </svg>
    </div>
  );
}
