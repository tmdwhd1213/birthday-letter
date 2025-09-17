import React, { useEffect, useMemo, useRef, useState } from "react";
import BalloonsLayer from "./components/BalloonsLayer";
import HeartsEffect from "./components/HeartsEffect";
import MomentsSlideshow from "./components/MomentSildeshow";

export default function App() {
  // 쿼리 파라미터
  const params = new URLSearchParams(location.search);
  const to = params.get("to") || "사랑하는 구러이";
  const from = params.get("from") || "종팔이";
  const date = params.get("date") || "2025. 09. 18. ";
  const msg = params.get("msg");
  const messages = useMemo(
    () =>
      msg
        ? decodeURIComponent(msg).split("|")
        : [
            `히히 안농!`,
            `이번에는 조금 특별한 선물로 준비했어옹. 급하게 만들기도 했고 이런 식으로는 처음해봐서 퀄리티가 많이 떨어져도 이해해줘용 ㅎㅎㅎ`,
            `벌써 우리가 함께한 지 483일째래. 숫자로 쓰면 단순하지만, 하루하루가 쌓여 지금의 우리를 만들었다고 생각해옹. 신기한 건 말이야 나는 울 렁렁이를 매일 보는데도 이상하게 질리지가 않아. 렁러이는 볼수록 새로운 매력이 뿜뿜! 하는 사람이라서`,
            `항상 내 옆에 있어 줘서 고마워. 애기 덕분에 웃게 되고, 버틸 힘이 생겨. 넌 내 에너지 덩어리야! 퇴근해서 힘들어할 때, 기운 없을 때 우울함에 빠질 때마다 툭 건네는 한마디, 웃음, 따뜻한 손이 나를 다시 일으켜줘.`,
            `그리고 구렁이 너처럼, 매일 조금씩이라도 발전하고 더 나은 사람이 되려고 노력할게. 오늘의 나보다 내일의 내가, 내일의 나보다 모레의 내가 더 단단하고 다정해지도록. 구렁이가 자랑스러워할 사람으로 곁에 있을게.`,
            `마지막으로 내일모레 있을 대회가 가까워지니 긴장될 거 알아. 그런데 그 긴장은 애기가 진심으로 준비해 왔다는 증거야. 떨림이 오면 숨을 천천히 들이마시고, 애기가 해온 만큼만 믿어줘. 결과는 순간이지만, 애기의 과정은 전부터 쌓아놓은거니까. 경기장에서는 네 리듬으로, 네 페이스로 천천히, 정확하게, 그리고 당당하게. 무엇보다 실수해도 괜찮아. 그 순간에도 널 제일 먼저 안아줄 사람은 항상 여기 있으니까.`,
            `사랑해. 오늘도, 내일도, 그리고 우리까지 모든 순간에.`,
          ],
    [msg]
  );

  const prefersReduced = useMemo(
    () =>
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );
  const [effectsOn, setEffectsOn] = useState(!prefersReduced);
  const [letterOpen, setLetterOpen] = useState(false);

  const innerRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<number>(0);
  const [collapsedPx, setCollapsedPx] = useState<number>(
    Math.round(window.innerHeight * 0.4) // 40vh과 동일
  );

  // 창 크기 바뀌면 접힌 높이(40vh) 재계산
  useEffect(() => {
    const onResize = () => setCollapsedPx(Math.round(window.innerHeight * 0.4));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // 열림/닫힘에 따라 max-height 목표 설정
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const apply = () => {
      const target = letterOpen ? el.scrollHeight : collapsedPx;
      setMaxH(target);
    };
    apply();

    // 내용/폰트 로드/리플로우 변화 추적 (ResizeObserver)
    const ro = new ResizeObserver(() => {
      if (letterOpen) setMaxH(el.scrollHeight);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [letterOpen, collapsedPx]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      alert("페이지 링크를 복사했어요! 😊");
    } catch {
      alert("복사에 실패했어요. 주소창 링크를 직접 복사해 주세요.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-pink-50 to-indigo-50">
      <BalloonsLayer enabled={effectsOn} count={16} />
      <HeartsEffect enabled={effectsOn} maxHearts={28} />

      <main className="relative z-[1] mx-auto my-10 w-[92vw] max-w-[780px] rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur-md sm:my-16 sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-sm font-bold text-rose-700">
          <span role="img" aria-label="cake">
            🎂
          </span>{" "}
          Happy Birthday
        </div>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight sm:text-5xl">
          <span className="text-pink-500">{to}</span>에게
        </h1>

        <section className="mt-4">
          <div
            className={
              // 컨테이너: max-height 애니메이션 (px), overflow 전환
              `ruled accordion relative rounded-2xl bg-white/90 px-4 py-4 sm:px-6 sm:py-6
       ${letterOpen ? "overflow-visible" : "overflow-hidden"}`
            }
            style={
              {
                // 줄선/행간 유지
                ["--lh" as any]: "2.1em",
                // 높이 애니메이션 대상
                maxHeight: `${maxH}px`,
              } as React.CSSProperties
            }>
            {/* 내용: 페이드 + 살짝 슬라이드 업 */}
            <div
              ref={innerRef}
              className={`accordion-inner font-hand tracking-wide text-gray-800`}
              data-open={letterOpen}>
              {messages.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {/* 하단 페이드 마스크: 서서히 사라짐 */}
            <div
              className={`mask-fade ${
                letterOpen ? "opacity-0 pointer-events-none" : "opacity-100"
              }`}
            />
          </div>

          <div className="mt-3 flex justify-center">
            <button
              onClick={() => setLetterOpen((v) => !v)}
              className="btn inline-flex items-center gap-1">
              {letterOpen ? "편지 접기" : "편지 펼치기"}
              <span
                className={`inline-block transition-transform duration-300 ${
                  letterOpen ? "rotate-180" : "rotate-0"
                }`}>
                ▾
              </span>
            </button>
          </div>
        </section>
        <div className="mt-4 text-gray-500">
          {date} — from <strong>{from}</strong>
        </div>

        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-700">
            우리의 추억 💖
          </h2>
          <MomentsSlideshow intervalMs={3000} /> {/* 3초마다 페이드 전환 */}
        </section>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={copyLink} className="btn">
            🔗 링크 복사
          </button>
          <button
            onClick={() => setEffectsOn((v) => !v)}
            className="btn btn-secondary">
            {effectsOn ? "💖 효과 끄기" : "💖 효과 켜기"}
          </button>
        </div>
      </main>

      <style>{`
.btn { @apply rounded-xl bg-gray-900 px-4 py-2 font-bold text-white shadow-[0_4px_0_rgba(0,0,0,0.25)] transition active:translate-y-[2px] active:shadow-[0_2px_0_rgba(0,0,0,0.2)]; }
.btn.btn-secondary { @apply bg-white text-gray-900 border border-black/15; }

/* max-height 애니메이션 (px 기반) */
.accordion{
  will-change: max-height;
  transition: max-height 560ms cubic-bezier(.2,.7,.1,1);
}

/* 내용 페이드 + 슬라이드 */
.accordion-inner{
  transition: opacity 420ms ease, transform 420ms ease;
}
.accordion-inner[data-open="false"]{
  opacity: .85;
  transform: translateY(6px);
}
.accordion-inner[data-open="true"]{
  opacity: 1;
  transform: translateY(0);
}

/* ✅ 줄과 글자 정확히 맞추기 */
.ruled{
  /* 한 곳에서 행간을 관리 */
  line-height: var(--lh, 2.1em);

  /* 줄(실선) - line-height에 정확히 맞춤 */
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(var(--lh, 2.1em) - 1px),
    rgba(0,0,0,.10) calc(var(--lh, 2.1em) - 1px),
    rgba(0,0,0,.10) var(--lh, 2.1em)
  );
  /* 패딩 영역 안에서 시작하도록 */
  background-origin: content-box;
  background-clip: content-box;
  padding-bottom: .25rem; /* 마지막 줄 노출 여유 */
}

/* 문단 간격도 line-height의 정수배로 → 격자 유지 */
.ruled p{ margin:0; }
.ruled p + p{ margin-top: var(--lh, 2.1em); }

.mask-fade{
  position:absolute; inset-inline:0; bottom:0; height:3.5rem;
  background:linear-gradient(to top, rgba(255,255,255,.95), rgba(255,255,255,0));
  transition: opacity 320ms ease;
}

@media (prefers-reduced-motion: reduce){
  canvas{ display:none; }
}
`}</style>
    </div>
  );
}
