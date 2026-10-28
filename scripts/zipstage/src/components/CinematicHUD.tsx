"use client";

import { useEffect, useRef } from "react";
import { cinematic, chapters, SHOTS } from "@/lib/cinematic";

/**
 * CINEMATIC HUD — chapter rail, progress hairline and shot label.
 * Reads the shared cinematic store inside a rAF loop and patches
 * the DOM directly, so scrolling costs zero React renders.
 */
export default function CinematicHUD() {
  const barRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const ticksRef = useRef<(HTMLButtonElement | null)[]>([]);
  const chapterList = chapters();

  useEffect(() => {
    let raf = 0;
    let lastChapter = "";

    const tick = () => {
      raf = requestAnimationFrame(tick);

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${cinematic.progress})`;
      }

      const shot = SHOTS[cinematic.activeShot];
      if (shot && shot.chapter !== lastChapter) {
        lastChapter = shot.chapter;
        if (numRef.current) numRef.current.textContent = shot.chapter;
        if (labelRef.current) labelRef.current.textContent = shot.label;
        ticksRef.current.forEach((el, i) => {
          if (!el) return;
          const on = chapterList[i]?.chapter === shot.chapter;
          el.dataset.active = on ? "true" : "false";
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chapterList]);

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      {/* scroll progress hairline */}
      <div aria-hidden className="fixed inset-x-0 top-0 z-[46] h-px bg-edge/30">
        <div
          ref={barRef}
          className="h-full w-full origin-left bg-neon/80 shadow-[0_0_8px_rgba(0,229,255,0.7)]"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* chapter marker — bottom left */}
      <div
        aria-hidden
        className="label-mono fixed bottom-6 left-5 z-30 hidden items-center gap-3 md:left-10 lg:flex"
      >
        <span className="text-neon">CH.</span>
        <span ref={numRef} className="text-bone">
          01
        </span>
        <span className="h-px w-8 bg-edge" />
        <span ref={labelRef} className="text-dim">
          MIDNIGHT APPROACH
        </span>
      </div>

      {/* chapter rail — right edge */}
      <nav
        aria-label="Chapters"
        className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-5 lg:flex"
      >
        {chapterList.map((c, i) => (
          <button
            key={c.id}
            ref={(el) => {
              ticksRef.current[i] = el;
            }}
            data-active={i === 0 ? "true" : "false"}
            onClick={() => goTo(c.id)}
            aria-label={`Go to chapter ${c.chapter} — ${c.label}`}
            className="hud-tick group flex items-center gap-2.5"
          >
            <span className="hud-tick-label">{c.label}</span>
            <span className="hud-tick-num font-technical">{c.chapter}</span>
            <span className="hud-tick-line" />
          </button>
        ))}
      </nav>
    </>
  );
}
