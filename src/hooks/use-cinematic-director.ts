"use client";

import { useEffect } from "react";
import {
  cinematic,
  SHOTS,
  INTRO_DURATION,
  clamp01,
  smootherstep,
} from "@/lib/cinematic";

/**
 * CINEMATIC DIRECTOR (DOM side)
 *
 * - Measures the real DOM sections and converts every shot into a
 *   normalized scroll stop, so the camera always lands exactly on a
 *   section no matter how tall the content is.
 * - Publishes scroll progress + pointer position into the shared
 *   cinematic store at rAF cadence (read inside the 3D render loop).
 * - Drives the letterbox phase (intro → live) on <html data-cinema>.
 *
 * Renders nothing.
 */
export function useCinematicDirector(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let scrollDirty = true;
    let start = performance.now();
    let live = false;

    /* ---------- measurement ---------- */

    const measure = () => {
      const doc = document.documentElement;
      const vh = window.innerHeight || 1;
      const maxScroll = Math.max(doc.scrollHeight - vh, 1);
      cinematic.maxScroll = maxScroll;

      const stops: number[] = [];
      for (const shot of SHOTS) {
        const el = document.getElementById(shot.id);
        let stop: number;
        if (!el) {
          stop = (stops.length ? stops[stops.length - 1] : 0);
        } else {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          // shot is "reached" when its anchor line crosses viewport centre
          stop = top + rect.height * shot.anchor - vh * 0.5;
        }
        stops.push(stop);
      }

      // clamp into [0, maxScroll] and force monotonic growth
      let prev = 0;
      for (let i = 0; i < stops.length; i++) {
        let s = Math.min(Math.max(stops[i], 0), maxScroll);
        if (i === 0) s = 0; // hero shot is the top of the page
        if (i === stops.length - 1) s = maxScroll; // overlook = page end
        s = Math.max(s, prev + 0.001);
        stops[i] = s / maxScroll;
        prev = s;
      }
      cinematic.stops = stops;
      cinematic.measured = true;
      scrollDirty = true;
    };

    /* ---------- frame publisher (continuous — intro + progress + chapter) ---------- */

    const publish = () => {
      raf = requestAnimationFrame(publish);

      // intro clock (eased) — skipped for reduced motion by the camera
      const elapsed = (performance.now() - start) / 1000;
      if (!live && (elapsed >= INTRO_DURATION || window.scrollY > 60)) {
        live = true;
        cinematic.phase = "live";
        document.documentElement.setAttribute("data-cinema", "live");
      }
      cinematic.intro = live ? 1 : smootherstep(clamp01(elapsed / INTRO_DURATION));

      // scroll progress
      const max = cinematic.maxScroll;
      const p = clamp01((window.scrollY || 0) / max);
      cinematic.progress = p;

      // active shot = nearest stop
      const stops = cinematic.stops;
      if (stops.length) {
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i < stops.length; i++) {
          const d = Math.abs(stops[i] - p);
          if (d < bestD) {
            bestD = d;
            best = i;
          }
        }
        cinematic.activeShot = best;
      }

      if (scrollDirty) {
        scrollDirty = false;
        measure();
      }
    };

    const kick = () => {
      scrollDirty = true;
    };

    const onPointer = (e: MouseEvent) => {
      cinematic.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      cinematic.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    /* ---------- wiring ---------- */

    document.documentElement.setAttribute("data-cinema", "intro");
    measure();

    // debug handle (harmless in production, invaluable for shot tuning)
    (window as unknown as { __cine?: unknown }).__cine = cinematic;

    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    window.addEventListener("mousemove", onPointer, { passive: true });
    window.addEventListener("load", measure);
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    const remeasure = window.setTimeout(measure, 1600); // late layout shifts

    raf = requestAnimationFrame(publish);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(remeasure);
      window.removeEventListener("scroll", kick);
      window.removeEventListener("resize", kick);
      window.removeEventListener("mousemove", onPointer);
      window.removeEventListener("load", measure);
      document.documentElement.removeAttribute("data-cinema");
    };
  }, [enabled]);
}
