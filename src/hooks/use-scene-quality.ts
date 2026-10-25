"use client";

import { useEffect, useState } from "react";

export type SceneTier = "high" | "low";

export interface SceneQuality {
  ready: boolean;
  tier: SceneTier;
  reducedMotion: boolean;
  webgl: boolean;
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") || canvas.getContext("webgl")
    );
  } catch {
    return false;
  }
}

/**
 * Detects device capability for the 3D scene.
 * - low tier: coarse pointer, small screens, few cores, low memory
 * - reducedMotion: prefers-reduced-motion
 * - webgl: whether a WebGL context can be created at all
 */
export function useSceneQuality(): SceneQuality {
  const [quality, setQuality] = useState<SceneQuality>({
    ready: false,
    tier: "high",
    reducedMotion: false,
    webgl: true,
  });

  useEffect(() => {
    const compute = () => {
      const coarse =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(pointer: coarse)").matches;
      const smallScreen = window.innerWidth < 820;
      const cores = navigator.hardwareConcurrency ?? 8;
      const memory = (navigator as unknown as { deviceMemory?: number })
        .deviceMemory ?? 8;
      const low: boolean = (coarse && smallScreen) || cores <= 4 || memory <= 4;
      const reduced =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      setQuality((prev) => ({
        ready: true,
        tier: prev.ready ? prev.tier : low ? "low" : "high",
        reducedMotion: prev.ready ? prev.reducedMotion : reduced,
        webgl: prev.ready ? prev.webgl : detectWebGL(),
      }));
    };

    compute();

    const mqReduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduced = () =>
      setQuality((prev) => ({ ...prev, reducedMotion: mqReduced.matches }));
    mqReduced.addEventListener("change", onReduced);
    return () => mqReduced.removeEventListener("change", onReduced);
  }, []);

  return quality;
}
