/**
 * ============================================================
 *  NEON NOIR — CINEMATIC DIRECTOR CORE
 *
 *  The scroll position drives a camera journey through the 3D
 *  city. Each DOM section owns one or more "shots" (keyframes:
 *  camera position + look target + fov). The camera flies a
 *  smooth Catmull-Rom path between shots as the reader scrolls.
 *
 *  This module is framework-agnostic and mutation-based on
 *  purpose: it is written every frame by the director and read
 *  every frame inside the R3F render loop — zero React
 *  re-renders, zero allocations.
 * ============================================================
 */

export interface SceneShot {
  /** DOM section id this shot belongs to */
  id: string;
  /** chapter label shown in the HUD */
  label: string;
  /** chapter number for the HUD */
  chapter: string;
  /** 0..1 position within the section where this shot is "reached" */
  anchor: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

/*
 *  THE SHOT LIST — the film, in order.
 *
 *  City geography (see cityscape.tsx):
 *    - Eiffel Tower at (-12, 0, -26), height 64, gold lit
 *    - boulevard kept clear along x ∈ [-11, 11] for z > -52
 *    - towers fill x ∈ [-230, 230], z ∈ [-230, 66]
 *    - elevated highway sweeps across at y ≈ 13–18
 */
export const SHOTS: SceneShot[] = [
  // 01 — HERO: low on the boulevard, tower rising right-of-frame
  {
    id: "home",
    chapter: "01",
    label: "MIDNIGHT APPROACH",
    anchor: 0.5,
    pos: [17, 11.5, 88],
    look: [-24, 27, -26],
    fov: 42,
  },
  // 02 — PROJECTS: dive into the hologram district (two shots)
  {
    id: "projects",
    chapter: "02",
    label: "THE PROJECT DISTRICT",
    anchor: 0.14,
    pos: [25, 12.5, -6],
    look: [46, 13, -34],
    fov: 46,
  },
  {
    id: "projects",
    chapter: "02",
    label: "THE PROJECT DISTRICT",
    anchor: 0.78,
    pos: [28, 14.5, -18],
    look: [58, 14.5, -58],
    fov: 47,
  },
  // 03 — ABOUT: the rooftop observatory, city + tower beyond
  {
    id: "about",
    chapter: "03",
    label: "THE ROOFTOP OBSERVATORY",
    anchor: 0.5,
    pos: [64, 44.5, 18],
    look: [-12, 34, -26],
    fov: 44,
  },
  // 04 — TECH STACK: gliding above the overpass across the grid
  {
    id: "stack",
    chapter: "04",
    label: "THE OVERPASS",
    anchor: 0.5,
    pos: [-34, 24, 26],
    look: [-96, 15, -100],
    fov: 50,
  },
  // 05 — EDUCATION: one-point perspective straight down the axis
  {
    id: "education",
    chapter: "05",
    label: "THE AXIS",
    anchor: 0.5,
    pos: [-2, 7, 52],
    look: [-12, 26, -30],
    fov: 40,
  },
  // 06 — CONTACT: the final overlook, skyline glowing in the distance
  {
    id: "contact",
    chapter: "06",
    label: "THE FINAL OVERLOOK",
    anchor: 0.55,
    pos: [-92, 56, 58],
    look: [-8, 24, -70],
    fov: 48,
  },
];

/** Wide establishing frame used by the opening dolly (before shot 01) */
export const INTRO_SHOT = {
  pos: [38, 48, 196] as [number, number, number],
  look: [-12, 30, -26] as [number, number, number],
  fov: 46,
};

/** Opening dolly duration (seconds) — shared by camera + letterbox + HUD */
export const INTRO_DURATION = 4.6;

/** XZ flight corridor (cleared of buildings in cityscape.tsx) */
export const CORRIDOR_POINTS: [number, number][] = SHOTS.flatMap((s, i) => {
  const pts: [number, number][] = [[s.pos[0], s.pos[2]]];
  // segment midpoints so straight runs stay clear too
  if (i > 0) {
    const p = SHOTS[i - 1].pos;
    pts.push([(p[0] + s.pos[0]) / 2, (p[2] + s.pos[2]) / 2]);
    pts.push([(p[0] + 2 * s.pos[0]) / 3, (p[2] + 2 * s.pos[2]) / 3]);
  }
  return pts;
}).concat([
  [INTRO_SHOT.pos[0], INTRO_SHOT.pos[2]],
  // plaza + observatory + gate approaches
  [46, -32],
  [58, -46],
  [70, -60],
  [64, 18],
  [20, 40],
]);

/* ---------------- shared frame store ---------------- */

export const cinematic = {
  /** global scroll progress 0..1 */
  progress: 0,
  /** normalized stop position (0..1) for every shot, measured from DOM */
  stops: [] as number[],
  /** pointer in NDC (-1..1) */
  pointer: { x: 0, y: 0 },
  /** intro dolly progress 0..1 (1 = finished) */
  intro: 0,
  /** capability flags, mirrored from useSceneQuality */
  reduced: false,
  low: false,
  /** id of the chapter currently nearest the viewer */
  activeShot: 0,
  /** measured page metrics */
  maxScroll: 1,
  /** letterbox state: "intro" during the opening, "live" afterwards */
  phase: "intro" as "intro" | "live",
  /** true once the DOM measurements have run at least once */
  measured: false,
  /** live camera readout (written by CinematicCamera, for debugging) */
  camPos: [0, 0, 0] as [number, number, number],
  camLook: [0, 0, 0] as [number, number, number],
};

/* ---------------- math ---------------- */

/** smootherstep — ease with zero velocity at both ends */
export function smootherstep(u: number): number {
  const x = Math.min(Math.max(u, 0), 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function clamp01(u: number): number {
  return Math.min(Math.max(u, 0), 1);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Uniform Catmull-Rom on 4 control points (p0..p3) at parameter u ∈ [0,1]
 * between p1 and p2. Keeps the flight path C1-smooth across shots.
 */
export function catmull(
  p0: number, p1: number, p2: number, p3: number, u: number
): number {
  const u2 = u * u;
  const u3 = u2 * u;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * u +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * u2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * u3)
  );
}

/**
 * Sample the camera state at global progress p (0..1).
 * Writes into the provided target objects; returns the interpolated fov.
 */
export function sampleCamera(
  p: number,
  outPos: { x: number; y: number; z: number },
  outLook: { x: number; y: number; z: number }
): number {
  const shots = SHOTS;
  const stops = cinematic.stops;
  const n = shots.length;
  if (n === 0) return 42;

  // clamp to ends
  if (p <= stops[0]) {
    const s = shots[0];
    outPos.x = s.pos[0]; outPos.y = s.pos[1]; outPos.z = s.pos[2];
    outLook.x = s.look[0]; outLook.y = s.look[1]; outLook.z = s.look[2];
    return s.fov;
  }
  if (p >= stops[n - 1]) {
    const s = shots[n - 1];
    outPos.x = s.pos[0]; outPos.y = s.pos[1]; outPos.z = s.pos[2];
    outLook.x = s.look[0]; outLook.y = s.look[1]; outLook.z = s.look[2];
    return s.fov;
  }

  // find segment [i, i+1] containing p
  let i = 0;
  while (i < n - 2 && p > stops[i + 1]) i++;
  const a = shots[i];
  const b = shots[i + 1];
  const t0 = stops[i];
  const t1 = stops[i + 1];
  const u = smootherstep((p - t0) / Math.max(t1 - t0, 1e-5));

  // neighbour control points for the spline
  const pa = shots[Math.max(0, i - 1)];
  const pb = shots[Math.min(n - 1, i + 2)];

  outPos.x = catmull(pa.pos[0], a.pos[0], b.pos[0], pb.pos[0], u);
  outPos.y = catmull(pa.pos[1], a.pos[1], b.pos[1], pb.pos[1], u);
  outPos.z = catmull(pa.pos[2], a.pos[2], b.pos[2], pb.pos[2], u);
  outLook.x = catmull(pa.look[0], a.look[0], b.look[0], pb.look[0], u);
  outLook.y = catmull(pa.look[1], a.look[1], b.look[1], pb.look[1], u);
  outLook.z = catmull(pa.look[2], a.look[2], b.look[2], pb.look[2], u);

  return lerp(a.fov, b.fov, u);
}

/** unique chapter list for the HUD (deduped by section id) */
export function chapters() {
  const seen = new Set<string>();
  const out: { id: string; chapter: string; label: string }[] = [];
  for (const s of SHOTS) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push({ id: s.id, chapter: s.chapter, label: s.label });
  }
  return out;
}
