"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { sceneTime } from "@/lib/scene-time";

/**
 * LANDMARKS — cinematic set pieces the camera journey interacts with:
 *  - CityGate: monumental portal on the boulevard (flown through)
 *  - Observatory: rooftop deck the "About" chapter rests on
 *  - Beams: restrained volumetric light columns for depth
 */

/* ---------------- shared glow texture ---------------- */

function radialGlow(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ================= CITY GATE ================= */

export function CityGate({ reduced }: { reduced: boolean }) {
  const beacon = useRef<THREE.Mesh>(null);

  const darkMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0d1017",
        roughness: 0.6,
        metalness: 0.55,
      }),
    []
  );
  const cyanMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#00e5ff", toneMapped: false }),
    []
  );
  const beamMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#00e5ff",
        transparent: true,
        opacity: 0.045,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    []
  );

  useFrame(() => {
    if (reduced || !beacon.current) return;
    const m = beacon.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 1.4 + Math.sin(sceneTime.t * 1.7) * 0.9;
  });

  return (
    <group position={[20, 0, 40]} rotation={[0, -0.22, 0]}>
      {/* pylons */}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 7.5, 0]} material={darkMat}>
            <boxGeometry args={[1.7, 15, 1.7]} />
          </mesh>
          {/* edge light strips */}
          <mesh position={[x > 0 ? -0.95 : 0.95, 7.5, 0]} material={cyanMat}>
            <boxGeometry args={[0.08, 13.6, 0.18]} />
          </mesh>
          <mesh position={[0, 7.5, 0.9]} material={cyanMat}>
            <boxGeometry args={[0.1, 13.6, 0.06]} />
          </mesh>
        </group>
      ))}

      {/* crossbar + underglow strip */}
      <mesh position={[0, 14.6, 0]} material={darkMat}>
        <boxGeometry args={[19.6, 1.3, 1.5]} />
      </mesh>
      <mesh position={[0, 13.85, 0]} material={cyanMat}>
        <boxGeometry args={[18.6, 0.1, 0.5]} />
      </mesh>

      {/* beacon */}
      <mesh ref={beacon} position={[0, 15.9, 0]}>
        <sphereGeometry args={[0.3, 10, 10]} />
        <meshStandardMaterial color="#3d0a24" emissive="#ff2d95" emissiveIntensity={1.6} />
      </mesh>
      <pointLight position={[0, 14, 0]} color="#00e5ff" intensity={40} distance={34} decay={1.8} />

      {/* volumetric column rising from the crossbar */}
      <mesh position={[0, 31, 0]} material={beamMat}>
        <cylinderGeometry args={[0.45, 0.75, 33, 12, 1, true]} />
      </mesh>

      {/* approach guidance lights on the road */}
      {[-6, -3, 3, 6].map((x) => (
        <mesh key={x} position={[x, 0.1, 7]} material={cyanMat}>
          <boxGeometry args={[0.5, 0.04, 0.5]} />
        </mesh>
      ))}
    </group>
  );
}

/* ================= ROOFTOP OBSERVATORY ================= */

export function Observatory({ reduced }: { reduced: boolean }) {
  const mast = useRef<THREE.Mesh>(null);
  const POS: [number, number, number] = [64, 0, 18];
  const DECK_Y = 40;

  const bodyMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0c0f16",
        roughness: 0.72,
        metalness: 0.3,
      }),
    []
  );
  const deckMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#10131b",
        roughness: 0.5,
        metalness: 0.45,
      }),
    []
  );
  const goldMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#b8863f", toneMapped: false }),
    []
  );
  const warmGlowTex = useMemo(() => radialGlow("rgba(255,198,109,0.5)", "rgba(255,198,109,0)"), []);
  const redMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ff5964", toneMapped: false }),
    []
  );

  // railing posts around the rim (instanced)
  const posts = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    const N = 20;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.045, 0.045, 1.15, 5);
      g.translate(Math.cos(a) * 5.05, DECK_Y + 0.85, Math.sin(a) * 5.05);
      geos.push(g);
    }
    return mergeGeometries(geos, false)!;
  }, []);

  useFrame(() => {
    if (reduced || !mast.current) return;
    const m = mast.current.material as THREE.MeshBasicMaterial;
    m.opacity = 0.5 + 0.5 * (Math.sin(sceneTime.t * 2.1) * 0.5 + 0.5);
  });

  return (
    <group position={POS}>
      {/* support core */}
      <mesh position={[0, DECK_Y / 2 - 1, 0]} material={bodyMat}>
        <cylinderGeometry args={[1.7, 2.6, DECK_Y, 10]} />
      </mesh>

      {/* deck */}
      <mesh position={[0, DECK_Y, 0]} material={deckMat}>
        <cylinderGeometry args={[5.3, 5.5, 0.6, 26]} />
      </mesh>
      {/* gold rim */}
      <mesh position={[0, DECK_Y + 0.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
        <torusGeometry args={[5.18, 0.05, 6, 40]} />
      </mesh>
      {/* railing */}
      <mesh geometry={posts} material={goldMat} />
      <mesh position={[0, DECK_Y + 1.4, 0]} rotation={[Math.PI / 2, 0, 0]} material={goldMat}>
        <torusGeometry args={[5.05, 0.035, 5, 40]} />
      </mesh>

      {/* warm under-deck halo */}
      <mesh position={[0, DECK_Y - 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshBasicMaterial
          map={warmGlowTex}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, DECK_Y + 2.4, 0]} color="#ffc66d" intensity={30} distance={26} decay={1.9} />

      {/* antenna mast with beacon */}
      <mesh position={[1.6, DECK_Y + 2.6, -1.2]} material={bodyMat}>
        <cylinderGeometry args={[0.05, 0.09, 4.4, 6]} />
      </mesh>
      <mesh ref={mast} position={[1.6, DECK_Y + 5.0, -1.2]} material={redMat}>
        <sphereGeometry args={[0.17, 8, 8]} />
      </mesh>
    </group>
  );
}

/* ================= VOLUMETRIC BEAMS ================= */

const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uPhase;
  varying vec2 vUv;
  void main() {
    float fade = pow(1.0 - vUv.y, 1.6);          // fade toward the top
    float edge = pow(sin(vUv.x * 3.14159), 1.4); // soft cylinder silhouette
    float flick = 0.9 + 0.1 * sin(uTime * 0.7 + uPhase);
    gl_FragColor = vec4(uColor, uOpacity * fade * edge * flick);
  }
`;

const BEAMS: { pos: [number, number, number]; r: number; h: number; color: string; opacity: number }[] = [
  { pos: [58, 0, -46], r: 1.1, h: 52, color: "#00e5ff", opacity: 0.05 },
  { pos: [-34, 0, -92], r: 1.4, h: 66, color: "#ffc66d", opacity: 0.042 },
  { pos: [118, 0, -118], r: 1.6, h: 78, color: "#ff2d95", opacity: 0.036 },
  { pos: [-142, 0, -66], r: 1.3, h: 60, color: "#00e5ff", opacity: 0.034 },
];

function Beam({ spec, index }: { spec: (typeof BEAMS)[number]; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BEAM_VERT,
        fragmentShader: BEAM_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(spec.color) },
          uOpacity: { value: spec.opacity },
          uTime: { value: 0 },
          uPhase: { value: index * 1.7 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [spec, index]
  );

  useFrame(() => {
    const mesh = meshRef.current;
    const m = mesh?.material as THREE.ShaderMaterial | undefined;
    if (m?.uniforms?.uTime) m.uniforms.uTime.value = sceneTime.t;
  });

  return (
    <mesh ref={meshRef} position={[spec.pos[0], spec.h / 2, spec.pos[2]]} material={mat}>
      <cylinderGeometry args={[spec.r * 0.55, spec.r, spec.h, 12, 1, true]} />
    </mesh>
  );
}

export function Beams() {
  return (
    <group>
      {BEAMS.map((b, i) => (
        <Beam key={i} spec={b} index={i} />
      ))}
    </group>
  );
}
