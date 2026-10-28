"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { sceneTime } from "@/lib/scene-time";

/**
 * Reads the THREE clock exactly once per frame and publishes the
 * shared elapsed time. Must be mounted BEFORE any consumer in the
 * scene tree (CityScene renders it first).
 */
export function SceneClock() {
  const acc = useRef(0);
  useFrame(({ clock }) => {
    sceneTime.t = clock.getElapsedTime();
    // guard: some drivers emit identical stamps — keep time monotonic
    if (sceneTime.t < acc.current) sceneTime.t = acc.current;
    acc.current = sceneTime.t;
  });
  return null;
}
