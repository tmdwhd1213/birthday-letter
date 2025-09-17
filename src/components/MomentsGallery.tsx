import React, { useMemo, useState, useEffect, useRef } from "react";

type ImgItem = {
  src: string;
  name: string; // moment1, moment2 ...
  date?: string;
  place?: string;
  note?: string;
};

// 필요 시 여기에 캡션 정보를 채워 넣으세요.
const META: Partial<
  Record<string, { date?: string; place?: string; note?: string }>
> = {
  // 예시:
  // moment1: { date: "2024-05-03", place: "Jeju", note: "첫 여행" },
  // moment2: { date: "2024-06-10", place: "Chuncheon" },
};

export default function MomentsGallery() {
  // /src/assets/img/moment*.{png,jpg,jpeg,webp} 전부 불러오기
  const images = useMemo<ImgItem[]>(() => {
    // import: 'default' → 값 타입은 string(URL)
    const modules = import.meta.glob<string>(
      "/src/assets/img/moment*.{png,jpg,jpeg,webp}",
      { eager: true, import: "default" }
    );

    const items = Object.entries(modules)
      .map(([path, url]) => {
        const base = path
          .split("/")
          .pop()!
          .replace(/\.[^.]+$/, ""); // moment1
        const meta = META[base] ?? {};
        // 파일명에서 date/place를 파싱하고 싶다면 아래 정규식 활용 (선택)
        // moment_2024-09-01_Seoul → date/place 추출
        const m = base.match(/^moment[_-](\d{4}-\d{2}-\d{2})(?:[_-](.+))?$/i);
        const parsed = m
          ? { date: m[1], place: m[2]?.replace(/[_-]/g, " ") }
          : {};

        return {
          src: url,
          name: base,
          date: meta.date ?? parsed.date,
          place: meta.place ?? parsed.place,
          note: meta.note,
        } as ImgItem;
      })
      // 숫자 기준 자연 정렬: moment1 < moment2 < moment10
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );

    return items;
  }, []);

  const [active, setActive] = useState<number | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [intervalMs, setIntervalMs] = useState(3000);
  const [isHover, setIsHover] = useState(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const close = () => setActive(null);
  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (active !== null)
      setActive((active + images.length - 1) % images.length);
  };
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (active !== null) setActive((active + 1) % images.length);
  };

  // 문서 숨김/표시 → 자동재생 일시정지
  useEffect(() => {
    const onVis = () => setIsHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // 자동 슬라이드쇼
  useEffect(() => {
    if (
      active === null ||
      !autoPlay ||
      isHover ||
      isHidden ||
      images.length <= 1
    )
      return;
    const id = setInterval(() => {
      setActive((idx) => (idx === null ? 0 : (idx + 1) % images.length));
    }, intervalMs);
    return () => clearInterval(id);
  }, [active, autoPlay, isHover, isHidden, intervalMs, images.length]);

  // 다음 이미지 프리로드
  useEffect(() => {
    if (active === null || images.length < 2) return;
    const nextIdx = (active + 1) % images.length;
    const img = new Image();
    img.src = images[nextIdx].src;
  }, [active, images]);

  if (images.length === 0) return null;

  return (
    <>
      {/* 썸네일 그리드 */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setActive(i)}
            className="group relative overflow-hidden rounded-xl bg-gray-100"
            title={img.name}>
            <img
              src={img.src}
              alt={img.name}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
            {/* 썸네일 캡션 */}
            {(img.date || img.place) && (
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-2 text-left text-[12px] text-white sm:text-[13px]">
                <div className="font-medium leading-tight">
                  {img.date && <span className="mr-1">{img.date}</span>}
                  {img.place && <span>· {img.place}</span>}
                </div>
                {img.note && <div className="opacity-90">{img.note}</div>}
              </figcaption>
            )}
            <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
          </button>
        ))}
      </div>

      {/* 라이트박스(큰 보기) */}
      {active !== null && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          onMouseEnter={() => setIsHover(true)}
          onMouseLeave={() => setIsHover(false)}>
          <img
            src={images[active].src}
            alt={images[active].name}
            className="max-h-[90vh] max-w-[92vw] rounded-2xl shadow-2xl"
          />

          {/* 캡션 + 컨트롤 바 */}
          <div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-3 text-center text-white"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-sm sm:text-base">
              <strong className="font-semibold">
                {images[active].date || images[active].name}
              </strong>
              {images[active].place && (
                <span className="ml-1">· {images[active].place}</span>
              )}
              {images[active].note && (
                <span className="ml-2 opacity-90">— {images[active].note}</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoPlay((v) => !v)}
                className="rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow"
                aria-pressed={autoPlay}
                title={autoPlay ? "일시정지" : "자동재생"}>
                {autoPlay ? "⏸ 일시정지" : "▶ 자동재생"}
              </button>
              <label className="flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-xs font-medium text-gray-900 shadow">
                속도
                <select
                  className="bg-transparent outline-none"
                  value={intervalMs}
                  onChange={(e) => setIntervalMs(Number(e.target.value))}>
                  <option value={2000}>빠르게 (2s)</option>
                  <option value={3000}>보통 (3s)</option>
                  <option value={5000}>천천히 (5s)</option>
                  <option value={8000}>아주 천천히 (8s)</option>
                </select>
              </label>
            </div>
          </div>

          {/* 닫기/이전/다음 */}
          <button
            onClick={close}
            className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-sm font-semibold text-gray-900 shadow">
            닫기 ✕
          </button>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl font-bold text-gray-900 shadow"
            aria-label="이전">
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-xl font-bold text-gray-900 shadow"
            aria-label="다음">
            ›
          </button>
        </div>
      )}
    </>
  );
}
