"use client";

import { useEffect, useRef } from "react";

/**
 * Desktop-only ambient cursor companion: a soft ring that trails the
 * native pointer and expands over interactive elements. The native
 * cursor stays fully visible — this is decoration, never a replacement.
 * Visibility is CSS-gated (fine pointers + no reduced-motion); the JS
 * loop is only started when those conditions hold.
 */
export default function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const pos = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    let hovering = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      const target = e.target as HTMLElement | null;
      hovering = !!target?.closest("a, button, input, textarea, [role='button']");
    };

    const loop = () => {
      ring.x += (pos.x - ring.x) * 0.18;
      ring.y += (pos.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${hovering ? 1.9 : 1})`;
        ringRef.current.style.borderColor = hovering
          ? "rgba(0,229,255,0.9)"
          : "rgba(0,229,255,0.45)";
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="cursor-companion pointer-events-none fixed left-0 top-0 z-[80] h-9 w-9 rounded-full border transition-[border-color] duration-200 will-change-transform"
      style={{
        transform: "translate3d(-100px, -100px, 0)",
        borderColor: "rgba(0,229,255,0.45)",
      }}
    />
  );
}
