import React, { useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "../utils/util";

/**
 * Birthday Letter – React + Tailwind (components version)
 * - 분리 컴포넌트: <BalloonsLayer/> (큰 배경 풍선), <HeartsEffect/> (캔버스 하트)
 * - 하트 모양 개선: 파라메트릭 하트(부드러운 곡선) + 라디얼 그라디언트 하이라이트
 * - 풍선 개선: SVG 몸체(그래디언트/하이라이트/매듭/끈) + 그림자, 부드러운 sway
 * - 쿼리파라미터: ?to=이름&from=나&date=YYYY.MM.DD&msg=첫줄|둘째줄
 */

// -------------------------- HeartsEffect -------------------------
interface HeartsEffectProps {
  enabled?: boolean;
  maxHearts?: number; // 화면에 동시에 보이는 최대 하트 수
}

export default function HeartsEffect({
  enabled = true,
  maxHearts = 26,
}: HeartsEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const reduce = useMemo(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  type Heart = {
    x: number;
    y: number;
    s: number;
    vy: number;
    vx: number;
    hue: number;
    a: number;
    life: number;
  };
  const hearts = useRef<Heart[]>([]);
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  // Path2D로 하트 모양 캐싱(파라메트릭 하트)
  const basePath = useMemo(() => {
    const p = new Path2D();
    // 파라메트릭 하트: x = 16 sin^3 t, y = 13 cos t − 5 cos 2t − 2 cos 3t − cos 4t
    // 0..2π를 100등분하여 부드러운 곡선 생성
    let started = false;
    for (let i = 0; i <= 100; i++) {
      const t = (Math.PI * 2 * i) / 100;
      const x = 16 * Math.sin(t) ** 3;
      const y =
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t);
      const X = x; // 0~±16
      const Y = -y; // 위쪽이 -가 되도록 뒤집기
      if (!started) {
        p.moveTo(X, Y);
        started = true;
      } else {
        p.lineTo(X, Y);
      }
    }
    p.closePath();
    return p;
  }, []);

  // 리사이즈
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const onResize = () => {
      c.width = Math.floor(innerWidth * DPR);
      c.height = Math.floor(innerHeight * DPR);
      c.style.width = innerWidth + "px";
      c.style.height = innerHeight + "px";
    };
    onResize();
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, [DPR]);

  // 루프
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const spawn = () => {
      const W = c.width,
        H = c.height;
      const size = (10 + Math.random() * 12) * DPR;
      hearts.current.push({
        x: Math.random() * W,
        y: H + Math.random() * H * 0.2,
        s: size,
        vy: (0.7 + Math.random() * 1.5) * DPR,
        vx: (Math.random() * 1.6 - 0.8) * DPR,
        hue: 330 + Math.random() * 60, // 핑크~퍼플
        a: 0.9,
        life: 0,
      });
    };

    const drawHeart = (h: Heart) => {
      // 하트 그리기: Path2D 스케일 적용
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.rotate(Math.sin((h.y + performance.now() * 0.002) / 30) * 0.18);
      const k = h.s / 32; // 32는 basePath 크기 상수
      ctx.scale(k, k);
      // 그라디언트 하이라이트(좌상단)
      const grad = ctx.createRadialGradient(-6, -6, 2, -6, -6, 22);
      grad.addColorStop(0, `hsla(${h.hue} 90% 75% / ${clamp(h.a, 0, 0.9)})`);
      grad.addColorStop(
        1,
        `hsla(${h.hue} 85% 55% / ${clamp(h.a * 0.9, 0, 0.9)})`
      );
      ctx.fillStyle = grad;
      ctx.fill(basePath);
      // 미세한 윤곽선(부드럽게)
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = `hsla(${h.hue} 70% 40% / ${clamp(h.a * 0.5, 0, 0.6)})`;
      ctx.stroke(basePath);
      ctx.restore();
    };

    const tick = () => {
      if (!enabled || reduce) {
        ctx.clearRect(0, 0, c.width, c.height);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      ctx.clearRect(0, 0, c.width, c.height);
      if (hearts.current.length < maxHearts) spawn();
      hearts.current.forEach((h) => {
        h.y -= h.vy;
        h.x += h.vx;
        h.life += 1;
        h.a = Math.max(0, 0.95 - h.life / 260);
        drawHeart(h);
      });
      hearts.current = hearts.current.filter((h) => h.y > -40 && h.a > 0.04);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, reduce, DPR, basePath, maxHearts]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0"
      aria-hidden
    />
  );
}
