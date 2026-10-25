"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

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

/* ================= GPU rain (LineSegments, zero CPU per frame) ================= */

const RAIN_VERT = /* glsl */ `
  attribute float aTip;
  attribute float aSpeed;
  attribute float aLen;
  uniform float uTime;
  uniform float uHeight;
  void main() {
    vec3 p = position;
    float y = mod(p.y - uTime * aSpeed, uHeight);
    p.y = y + aTip * aLen;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;
const RAIN_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

export function Rain({ count = 2400 }: { count?: number }) {
  const meshRef = useRef<THREE.LineSegments>(null);

  const geo = useMemo(() => {
    const rng = mulberry32(31415);
    const H = 95;
    const positions = new Float32Array(count * 2 * 3);
    const tips = new Float32Array(count * 2);
    const speeds = new Float32Array(count * 2);
    const lens = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const x = -95 + rng() * 190;
      const y = rng() * H;
      const z = -70 + rng() * 170;
      const speed = 26 + rng() * 26;
      const len = 0.9 + rng() * 1.3;
      const b = i * 2;
      positions[b * 3] = x;
      positions[b * 3 + 1] = y;
      positions[b * 3 + 2] = z;
      positions[b * 3 + 3] = x;
      positions[b * 3 + 4] = y;
      positions[b * 3 + 5] = z;
      tips[b] = 0;
      tips[b + 1] = 1;
      speeds[b] = speed;
      speeds[b + 1] = speed;
      lens[b] = len;
      lens[b + 1] = len;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aTip", new THREE.BufferAttribute(tips, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aLen", new THREE.BufferAttribute(lens, 1));
    return { g, H };
  }, [count]);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: RAIN_VERT,
        fragmentShader: RAIN_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uHeight: { value: 95 },
          uColor: { value: new THREE.Color("#5d7f9c") },
          uOpacity: { value: 0.3 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (mesh) {
      const m = mesh.material as THREE.ShaderMaterial;
      if (m?.uniforms?.uTime) {
        m.uniforms.uTime.value = clock.getElapsedTime();
      }
    }
  });

  return (
    <lineSegments
      geometry={geo.g}
      material={mat}
      ref={meshRef}
      frustumCulled={false}
    />
  );
}

/* ================= mist / volumetric-looking fog planes ================= */

function makeGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext("2d")!;
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function Mist({ reduced = false }: { reduced?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeGlowTexture("rgba(140,170,205,0.55)", "rgba(140,170,205,0)"), []);

  const planes = useMemo(() => {
    const rng = mulberry32(777);
    return Array.from({ length: 7 }, (_, i) => ({
      pos: [
        -110 + rng() * 220,
        5 + rng() * 16,
        -60 + rng() * 120,
      ] as [number, number, number],
      size: 60 + rng() * 90,
      opacity: 0.05 + rng() * 0.06,
      phase: i * 1.7,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (reduced || !group.current) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      child.position.x = planes[i].pos[0] + Math.sin(t * 0.03 + planes[i].phase) * 7;
    });
  });

  return (
    <group ref={group}>
      {planes.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[p.size, p.size]} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={p.opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= flying vehicles ================= */

export function FlyingVehicles({ count = 8, reduced = false }: { count?: number; reduced?: boolean }) {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  const paths = useMemo(() => {
    const rng = mulberry32(2024);
    return Array.from({ length: count }, (_, i) => ({
      y: 26 + rng() * 26,
      z: -40 + rng() * 110,
      speed: (7 + rng() * 10) * (rng() < 0.5 ? 1 : -1),
      offset: rng() * 320 - 160,
      color: i % 4 === 0 ? "#ff2d95" : i % 4 === 1 ? "#9fefff" : "#e8f4ff",
    }));
  }, [count]);

  useFrame((_, delta) => {
    if (reduced) return;
    meshes.current.forEach((m, i) => {
      if (!m) return;
      const p = paths[i];
      m.position.x += p.speed * delta;
      if (m.position.x > 170) m.position.x = -170;
      if (m.position.x < -170) m.position.x = 170;
    });
  });

  return (
    <group>
      {paths.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          position={[p.offset, p.y, p.z]}
        >
          <boxGeometry args={[1.7, 0.12, 0.3]} />
          <meshBasicMaterial color={p.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* ================= elevated highway with traffic ================= */

export function ElevatedHighway({ reduced = false }: { reduced?: boolean }) {
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-180, 15, -14),
        new THREE.Vector3(-95, 18, 6),
        new THREE.Vector3(0, 13.5, 22),
        new THREE.Vector3(95, 17, 4),
        new THREE.Vector3(180, 15, -10),
      ]),
    []
  );
  const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 80, 2.4, 6, false), [curve]);
  const tubeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0b0e14",
        roughness: 0.7,
        metalness: 0.35,
      }),
    []
  );

  const pylonGeo = useMemo(() => {
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i <= 14; i++) {
      const p = curve.getPointAt(i / 14);
      const g = new THREE.CylinderGeometry(0.5, 0.7, p.y, 6);
      g.translate(p.x, p.y / 2, p.z);
      geos.push(g);
    }
    return geos.length ? geos : [];
  }, [curve]);

  const pylonsMerged = useMemo(
    () => (pylonGeo.length ? mergeGeometries(pylonGeo, false) : null),
    [pylonGeo]
  );

  const carCount = 18;
  const carsRef = useRef<THREE.InstancedMesh>(null);
  const carState = useMemo(() => {
    const rng = mulberry32(606);
    return Array.from({ length: carCount }, (_, i) => ({
      t: rng(),
      speed: 0.014 + rng() * 0.012,
      dir: i % 2 === 0 ? 1 : -1,
    }));
  }, []);
  const carColors = useMemo(() => {
    const arr = new Float32Array(carCount * 3);
    for (let i = 0; i < carCount; i++) {
      const c =
        carState[i].dir === 1
          ? new THREE.Color("#dff4ff")
          : new THREE.Color("#ff5964");
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [carState]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!carsRef.current) return;
    if (!reduced) {
      carState.forEach((c) => {
        c.t = (c.t + c.speed * delta) % 1;
      });
    }
    carState.forEach((c, i) => {
      const t = c.dir === 1 ? c.t : 1 - c.t;
      const p = curve.getPointAt(t);
      dummy.position.copy(p);
      dummy.position.y += 1.4;
      dummy.updateMatrix();
      carsRef.current!.setMatrixAt(i, dummy.matrix);
    });
    carsRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={tubeGeo} material={tubeMat} />
      {pylonsMerged && (
        <mesh geometry={pylonsMerged}>
          <meshStandardMaterial color="#0a0d12" roughness={0.8} />
        </mesh>
      )}
      <instancedMesh
        ref={carsRef}
        args={[undefined, undefined, carCount]}
        frustumCulled={false}
      >
        <boxGeometry args={[1.1, 0.14, 0.4]} />
        <meshBasicMaterial toneMapped={false} />
        <instancedBufferAttribute attach="instanceColor" args={[carColors, 3]} />
      </instancedMesh>
    </group>
  );
}

/* ================= window light pulses ================= */

export function WindowPulses({ reduced = false }: { reduced?: boolean }) {
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const spots: [number, number, number, number][] = [
    [26, 22, -18, 0],
    [-48, 30, -44, 1.6],
    [58, 34, -60, 3.1],
    [-92, 24, -6, 4.4],
  ];
  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.getElapsedTime();
    mats.current.forEach((m, i) => {
      if (!m) return;
      m.opacity = 0.12 + 0.22 * (Math.sin(t * 1.1 + spots[i][3]) * 0.5 + 0.5);
    });
  });
  return (
    <group>
      {spots.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <planeGeometry args={[2.4, 1.6]} />
          <meshBasicMaterial
            ref={(el) => {
              mats.current[i] = el;
            }}
            color={i % 2 === 0 ? "#00e5ff" : "#ffc66d"}
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= horizon city glow ================= */

export function HorizonGlow() {
  const tex = useMemo(
    () => makeGlowTexture("rgba(120,170,210,0.5)", "rgba(120,170,210,0)"),
    []
  );
  const glows: { pos: [number, number, number]; size: number; color: string; opacity: number }[] =
    [
      { pos: [-90, 26, -190], size: 300, color: "#00e5ff", opacity: 0.13 },
      { pos: [90, 30, -200], size: 340, color: "#ff2d95", opacity: 0.1 },
      { pos: [-12, 34, -170], size: 220, color: "#ffc66d", opacity: 0.12 },
    ];
  return (
    <group>
      {glows.map((g, i) => (
        <mesh key={i} position={g.pos}>
          <planeGeometry args={[g.size, g.size * 0.5]} />
          <meshBasicMaterial
            map={tex}
            color={g.color}
            transparent
            opacity={g.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ================= sky: moon + stars ================= */

export function NightSky() {
  const moonTex = useMemo(
    () => makeGlowTexture("rgba(235,240,250,0.9)", "rgba(235,240,250,0)"),
    []
  );
  const starGeo = useMemo(() => {
    const rng = mulberry32(4242);
    const positions = new Float32Array(320 * 3);
    for (let i = 0; i < 320; i++) {
      const theta = rng() * Math.PI * 2;
      const phi = rng() * Math.PI * 0.42;
      const r = 480;
      positions[i * 3] = Math.cos(theta) * Math.sin(phi + 0.15) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r * 0.6 + 60;
      positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi + 0.15) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  return (
    <group>
      <mesh position={[120, 150, -300]}>
        <planeGeometry args={[46, 46]} />
        <meshBasicMaterial map={moonTex} transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <points geometry={starGeo}>
        <pointsMaterial size={1.1} color="#9fb4cc" transparent opacity={0.55} sizeAttenuation={false} />
      </points>
    </group>
  );
}
