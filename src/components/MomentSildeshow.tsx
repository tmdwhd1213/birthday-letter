import { useEffect, useMemo, useRef, useState } from "react";

type ImgItem = { src: string; name: string };

interface Props {
  /** 자동 전환 간격(ms). 기본 3000 (3초) */
  intervalMs?: number;
  /** 컨테이너 비율. 기본 4:3 */
  aspectClassName?: string;
}

export default function MomentsSlideshow({
  intervalMs = 3000,
  aspectClassName = "aspect-[4/3]",
}: Props) {
  // Vite가 /src 아래 정적 이미지를 번들링해서 URL로 제공
  const images = useMemo<ImgItem[]>(() => {
    const modules = import.meta.glob<string>(
      "/src/assets/img/moment*.{png,jpg,jpeg,webp}",
      { eager: true, import: "default" }
    );
    return Object.entries(modules)
      .map(([path, url]) => ({
        src: url,
        name: path
          .split("/")
          .pop()!
          .replace(/\.[^.]+$/, ""),
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
  }, []);

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false); // 탭 전환 시 일시정지
  const hoverRef = useRef<HTMLDivElement | null>(null);

  // 탭 숨김/표시 감지 → 자동재생 일시정지
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    if (images.length <= 1 || paused || hidden) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, paused, hidden, intervalMs]);

  // 다음 이미지 프리로드
  useEffect(() => {
    if (!images.length) return;
    const next = images[(idx + 1) % images.length];
    const im = new Image();
    im.src = next.src;
  }, [idx, images]);

  if (images.length === 0) return null;

  const prev = () => setIdx((i) => (i + images.length - 1) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);

  return (
    <div
      ref={hoverRef}
      className={`relative w-full overflow-hidden rounded-2xl bg-gray-100 ${aspectClassName}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      {/* 슬라이드 레이어: 절대 배치 + 페이드 전환 */}
      <div className="absolute inset-0">
        {images.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={img.name}
            className={
              "absolute inset-0 h-full w-full object-cover transform-gpu " +
              "transition-opacity duration-700 ease-in-out " +
              (i === idx ? "opacity-100" : "opacity-0")
            }
            draggable={false}
          />
        ))}
      </div>

      {/* 컨트롤(옵션) : 좌/우 넘김 + 재생/일시정지 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl font-bold text-gray-900 shadow"
        aria-label="이전"
        title="이전">
        ‹
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl font-bold text-gray-900 shadow"
        aria-label="다음"
        title="다음">
        ›
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          setPaused((v) => !v);
        }}
        className="absolute bottom-2 right-2 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow"
        aria-pressed={paused}
        title={paused ? "자동재생" : "일시정지"}>
        {paused ? "▶ 자동재생" : "⏸ 일시정지"}
      </button>

      {/* 인디케이터(작은 점) */}
      <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {images.map((_, i) => (
          <span
            key={i}
            className={
              "h-1.5 w-1.5 rounded-full " +
              (i === idx ? "bg-white" : "bg-white/50")
            }
          />
        ))}
      </div>
    </div>
  );
}
