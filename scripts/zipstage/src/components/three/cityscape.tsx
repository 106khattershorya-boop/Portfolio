"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Seeded PRNG so the city is deterministic and art-directed, not random noise */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const TOWER_POS = new THREE.Vector3(-12, 0, -26);

/* ---------------- window textures ---------------- */

type Variant = "mixed" | "cyan" | "warm" | "sparse";

function makeWindowTexture(variant: Variant, seed: number): THREE.CanvasTexture {
  const rng = mulberry32(seed);
  const c = document.createElement("canvas");
  c.width = 192;
  c.height = 384;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#080c13";
  ctx.fillRect(0, 0, 192, 384);

  const cols = 10;
  const rows = 24;
  const cw = 192 / cols;
  const rh = 384 / rows;
  const litProb =
    variant === "sparse" ? 0.26 : variant === "cyan" ? 0.48 : variant === "warm" ? 0.5 : 0.42;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = x * cw + cw * 0.18;
      const py = y * rh + rh * 0.22;
      const wpx = cw * 0.6;
      const hpx = rh * 0.52;
      if (rng() < litProb) {
        const roll = rng();
        let color: string;
        if (variant === "warm") {
          color = roll < 0.82 ? "#ffd9a0" : "#ffc36e";
        } else if (variant === "cyan") {
          color = roll < 0.62 ? "#8feeff" : "#d8f6ff";
        } else {
          if (roll < 0.5) color = "#ffdfae";
          else if (roll < 0.78) color = "#9fefff";
          else if (roll < 0.92) color = "#d5e8ff";
          else color = "#ff9fd0";
        }
        const b = 0.72 + rng() * 0.28;
        ctx.globalAlpha = b;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;
        ctx.fillStyle = color;
        ctx.fillRect(px, py, wpx, hpx);
        ctx.shadowBlur = 0;
      } else {
        ctx.globalAlpha = 0.5 + rng() * 0.4;
        ctx.fillStyle = rng() < 0.5 ? "#0b1119" : "#0d1420";
        ctx.fillRect(px, py, wpx, hpx);
      }
    }
  }
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ---------------- building generation ---------------- */

interface BuildingSpec {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  variant: number;
  tint: THREE.Color;
  rotY: number;
}

function generateBuildings(count: number): BuildingSpec[] {
  const rng = mulberry32(2077);
  const specs: BuildingSpec[] = [];
  const CELL = 21;
  const range = Math.ceil(Math.sqrt(count));
  for (let gx = -range; gx <= range; gx++) {
    for (let gz = -range; gz <= range; gz++) {
      if (specs.length >= count) break;
      const x = gx * CELL + (rng() - 0.5) * 9;
      const z = gz * CELL - 60 + (rng() - 0.5) * 9;
      // keep the boulevard to the tower clear
      if (Math.abs(x) < 11 && z > -52) continue;
      // keep the camera fore-ground open
      if (z > 66) continue;
      // tower plaza
      const dx = x - TOWER_POS.x;
      const dz = z - TOWER_POS.z;
      if (Math.sqrt(dx * dx + dz * dz) < 23) continue;
      if (rng() < 0.12) continue;

      const roll = rng();
      const h = roll < 0.58 ? 9 + rng() * 17 : roll < 0.9 ? 26 + rng() * 22 : 48 + rng() * 38;
      const w = 4.5 + rng() * 6.5;
      const d = 4.5 + rng() * 6.5;
      const tintRoll = rng();
      const tint =
        tintRoll < 0.12
          ? new THREE.Color(0.85, 1.0, 1.15)
          : tintRoll < 0.22
            ? new THREE.Color(1.15, 1.0, 0.82)
            : new THREE.Color(
                0.88 + rng() * 0.27,
                0.88 + rng() * 0.27,
                0.92 + rng() * 0.25
              );
      specs.push({
        x,
        z,
        w,
        d,
        h,
        variant: Math.floor(rng() * 4),
        tint,
        rotY: (rng() - 0.5) * 0.5,
      });
    }
  }
  return specs;
}

function boxWithWindows(spec: BuildingSpec, texIndex: number): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(spec.w, spec.h, spec.d);
  geo.translate(spec.x, spec.h / 2, spec.z);
  if (spec.rotY) geo.rotateY(spec.rotY);

  // scale UVs so windows keep a believable physical size on every building
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const repX = Math.max(1, Math.round(spec.w / 3.2));
  const repY = Math.max(1, Math.round(spec.h / 4.4));
  const colors = new Float32Array(geo.attributes.position.count * 3);
  for (let i = 0; i < uv.count; i++) {
    // sides keep window grid; top/bottom (faces 2,3) map flat dark
    const face = Math.floor(i / 4);
    const isCap = face === 2 || face === 3;
    const mult = isCap ? 0.05 : 1;
    uv.setXY(i, uv.getX(i) * (isCap ? 1 : repX) * mult, uv.getY(i) * (isCap ? 1 : repY));
    colors[i * 3] = spec.tint.r;
    colors[i * 3 + 1] = spec.tint.g;
    colors[i * 3 + 2] = spec.tint.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  void texIndex;
  return geo;
}

/* ---------------- neon signs ---------------- */

function neonSignGeometries(specs: BuildingSpec[], rng: () => number) {
  const byColor: Record<string, THREE.BufferGeometry[]> = {
    magenta: [],
    cyan: [],
    gold: [],
  };
  const palette = ["magenta", "cyan", "gold", "cyan", "magenta"];
  const shuffled = [...specs].sort(() => rng() - 0.5).slice(0, Math.min(64, specs.length));
  for (const b of shuffled) {
    if (b.h < 10) continue;
    const color = palette[Math.floor(rng() * palette.length)];
    const vertical = rng() < 0.72;
    const sw = vertical ? 1.3 : 3.5 + rng() * 3.5;
    const sh = vertical ? 6 + rng() * 8 : 1.7;
    const geo = new THREE.PlaneGeometry(sw, sh);
    const faceRoll = rng();
    let px = b.x;
    let pz = b.z;
    let rotY = b.rotY;
    if (faceRoll < 0.4) {
      pz = b.z + b.d / 2 + 0.18;
    } else if (faceRoll < 0.7) {
      px = b.x + b.w / 2 + 0.18;
      rotY += Math.PI / 2;
    } else {
      px = b.x - b.w / 2 - 0.18;
      rotY += Math.PI / 2;
    }
    const py = Math.min(b.h * (0.35 + rng() * 0.5), b.h - sh / 2 - 0.5);
    geo.rotateY(rotY);
    geo.translate(px, Math.max(py, sh / 2 + 1), pz);
    byColor[color].push(geo);
  }
  return byColor;
}

/* ---------------- component ---------------- */

export function Cityscape({ density = 1 }: { density?: number }) {
  const count = Math.floor(210 * density);

  const textures = useMemo(
    () => [
      makeWindowTexture("mixed", 11),
      makeWindowTexture("cyan", 23),
      makeWindowTexture("warm", 37),
      makeWindowTexture("sparse", 53),
    ],
    []
  );

  const specs = useMemo(() => generateBuildings(count), [count]);

  const mergedByVariant = useMemo(() => {
    const buckets: THREE.BufferGeometry[][] = [[], [], [], []];
    for (const s of specs) buckets[s.variant].push(boxWithWindows(s, s.variant));
    return buckets.map((bucket, i) => {
      const merged = bucket.length ? mergeGeometries(bucket, false) : new THREE.BufferGeometry();
      bucket.forEach((g) => g.dispose());
      void i;
      return merged;
    });
  }, [specs]);

  const buildingMats = useMemo(
    () =>
      textures.map(
        (tex) =>
          new THREE.MeshBasicMaterial({
            map: tex,
            vertexColors: true,
            toneMapped: false,
          })
      ),
    [textures]
  );

  /* Haussmann blocks around the tower */
  const haussmann = useMemo(() => {
    const rng = mulberry32(404);
    const geos: THREE.BufferGeometry[] = [];
    const geosEdge: THREE.BufferGeometry[] = [];
    const N = 11;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 + rng() * 0.5;
      const rad = 26 + rng() * 16;
      const x = TOWER_POS.x + Math.cos(ang) * rad;
      const z = TOWER_POS.z + Math.sin(ang) * rad;
      if (Math.abs(x) < 13 && z > -20) continue;
      const w = 7 + rng() * 3.5;
      const d = 7 + rng() * 3.5;
      const h = 6 + rng() * 3.5;
      const body = new THREE.BoxGeometry(w, h, d);
      body.translate(x, h / 2, z);
      geos.push(body);
      // mansard roof cap
      const cap = new THREE.BoxGeometry(w * 0.86, 1.1, d * 0.86);
      cap.translate(x, h + 0.55, z);
      geos.push(cap);
      // gold cornice strip
      const strip = new THREE.BoxGeometry(w + 0.4, 0.12, d + 0.4);
      strip.translate(x, h - 0.02, z);
      geosEdge.push(strip);
    }
    return {
      merged: mergeGeometries(geos, false),
      edges: mergeGeometries(geosEdge, false),
    };
  }, []);

  const haussmannMat = useMemo(() => {
    const tex = makeWindowTexture("warm", 99);
    return new THREE.MeshStandardMaterial({
      color: "#2b2118",
      roughness: 0.85,
      metalness: 0.1,
      emissive: new THREE.Color("#ffc66d"),
      emissiveMap: tex,
      map: tex,
      emissiveIntensity: 0.75,
    });
  }, []);
  const haussmannEdgeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#b8863f", toneMapped: false }),
    []
  );

  /* neon signage */
  const signs = useMemo(() => {
    const rng = mulberry32(9001);
    const byColor = neonSignGeometries(specs, rng);
    return [
      { geos: byColor.magenta, color: "#ff2d95" },
      { geos: byColor.cyan, color: "#00e5ff" },
      { geos: byColor.gold, color: "#ffc66d" },
    ].map(({ geos, color }) => ({
      merged: geos.length ? mergeGeometries(geos, false) : null,
      mat: new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    }));
  }, [specs]);

  /* far silhouette skyline for depth */
  const silhouettes = useMemo(() => {
    const rng = mulberry32(1337);
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 34; i++) {
      const x = -260 + rng() * 520;
      const z = -220 - rng() * 90;
      const w = 14 + rng() * 26;
      const d = 14 + rng() * 20;
      const h = 40 + rng() * 90;
      const g = new THREE.BoxGeometry(w, h, d);
      g.translate(x, h / 2, z);
      geos.push(g);
    }
    return mergeGeometries(geos, false);
  }, []);
  const silhouetteMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#04060b" }),
    []
  );

  /* roof warning lights */
  const roofLights = useMemo(() => {
    const rng = mulberry32(555);
    const pts: THREE.Vector3[] = [];
    for (const s of specs) {
      if (s.h > 30 && rng() < 0.4) {
        pts.push(new THREE.Vector3(s.x, s.h + 0.4, s.z));
      }
    }
    return pts;
  }, [specs]);
  const roofLightRef = useMemo(() => new THREE.Object3D(), []);

  return (
    <group>
      {mergedByVariant.map((geo, i) => (
        <mesh key={i} geometry={geo} material={buildingMats[i]} />
      ))}

      <mesh geometry={haussmann.merged} material={haussmannMat} />
      <mesh geometry={haussmann.edges} material={haussmannEdgeMat} />

      {signs.map(
        (s, i) => s.merged && <mesh key={`sign-${i}`} geometry={s.merged} material={s.mat} />
      )}

      <mesh geometry={silhouettes} material={silhouetteMat} />

      <instancedMesh
        args={[undefined, undefined, Math.max(roofLights.length, 1)]}
        frustumCulled={false}
        ref={(mesh) => {
          if (!mesh) return;
          const geo = new THREE.SphereGeometry(0.16, 6, 6);
          mesh.geometry = geo;
          mesh.material = new THREE.MeshBasicMaterial({
            color: "#ff5964",
            toneMapped: false,
          });
          roofLights.forEach((p, i) => roofLightRef.position.set(p.x, p.y, p.z));
          roofLights.forEach((p, i) => {
            roofLightRef.position.copy(p);
            mesh.setMatrixAt(i, roofLightRef.matrix);
          });
          mesh.instanceMatrix.needsUpdate = true;
        }}
      />
    </group>
  );
}
