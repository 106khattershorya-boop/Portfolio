"use client";

import * as THREE from "three";
import { useMemo, useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { sceneTime } from "@/lib/scene-time";

/**
 * Procedural Eiffel Tower — lattice struts, arches, platforms,
 * warm golden illumination. Height H = 64 units.
 */

const H = 64;
// Eiffel-like exponential silhouette
const profile = (t: number) => 12.4 * Math.exp(-3.2 * t) + 1.0;
const hAt = (t: number) => t * H;

const UP = new THREE.Vector3(0, 1, 0);

interface Strut {
  a: THREE.Vector3;
  b: THREE.Vector3;
  r: number;
}

function buildStruts(): Strut[] {
  const struts: Strut[] = [];
  const LEVELS = 26;
  const corner = (w: number, h: number, i: number) => {
    const sx = i === 0 || i === 3 ? -1 : 1;
    const sz = i === 0 || i === 1 ? -1 : 1;
    return new THREE.Vector3(w * sx, h, w * sz);
  };

  for (let i = 0; i < LEVELS; i++) {
    const t0 = i / LEVELS;
    const t1 = (i + 1) / LEVELS;
    const h0 = hAt(t0);
    const h1 = hAt(t1);
    const w0 = profile(t0);
    const w1 = profile(t1);
    const r = 0.34 - 0.27 * t0;

    // vertical corner struts
    for (let c = 0; c < 4; c++) {
      struts.push({ a: corner(w0, h0, c), b: corner(w1, h1, c), r });
    }
    // horizontal ring at top of this segment
    for (let c = 0; c < 4; c++) {
      struts.push({
        a: corner(w1, h1, c),
        b: corner(w1, h1, (c + 1) % 4),
        r: r * 0.75,
      });
    }
    // face diagonals (alternating, every other level)
    if (i % 2 === 0) {
      for (let c = 0; c < 4; c++) {
        const flip = (i / 2) % 2 === 0;
        struts.push({
          a: corner(w0, h0, flip ? c : (c + 1) % 4),
          b: corner(w1, h1, flip ? (c + 1) % 4 : c),
          r: r * 0.5,
        });
      }
    }
  }
  return struts;
}

function strutTransform(s: Strut) {
  const dir = new THREE.Vector3().subVectors(s.b, s.a);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(s.a, s.b).multiplyScalar(0.5);
  const quat = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
  const mat = new THREE.Matrix4().compose(
    mid,
    quat,
    new THREE.Vector3(s.r, len, s.r)
  );
  return mat;
}

export function EiffelTower({ position }: { position: [number, number, number] }) {
  const strutRef = useRef<THREE.InstancedMesh>(null);
  const lampRef = useRef<THREE.InstancedMesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);

  const strutData = useMemo(() => buildStruts(), []);
  const lampData = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const LEVELS = 26;
    for (let i = 1; i <= LEVELS; i++) {
      const t = i / LEVELS;
      const w = profile(t);
      const h = hAt(t);
      for (let c = 0; c < 4; c++) {
        const sx = c === 0 || c === 3 ? -1 : 1;
        const sz = c === 0 || c === 1 ? -1 : 1;
        pts.push(new THREE.Vector3(w * sx, h, w * sz));
      }
    }
    return pts;
  }, []);

  const unitCyl = useMemo(
    () => new THREE.CylinderGeometry(1, 1, 1, 6, 1),
    []
  );
  const strutMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a130b",
        roughness: 0.55,
        metalness: 0.75,
        emissive: "#241505",
        emissiveIntensity: 0.5,
      }),
    []
  );
  const lampMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffd28a" }),
    []
  );
  const lampGeo = useMemo(() => new THREE.SphereGeometry(0.19, 6, 6), []);
  const platformMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#141017",
        roughness: 0.7,
        metalness: 0.4,
      }),
    []
  );
  const goldEdgeMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#ffc66d" }),
    []
  );

  useLayoutEffect(() => {
    if (strutRef.current) {
      strutData.forEach((s, i) => {
        strutRef.current!.setMatrixAt(i, strutTransform(s));
      });
      strutRef.current.instanceMatrix.needsUpdate = true;
    }
    if (lampRef.current) {
      lampData.forEach((p, i) => {
        const m = new THREE.Matrix4().setPosition(p);
        lampRef.current!.setMatrixAt(i, m);
      });
      lampRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [strutData, lampData]);

  useFrame(() => {
    const t = sceneTime.t;
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 1.6 + Math.sin(t * 2.2) * 1.3;
    }
  });

  const w1 = profile(0.17);
  const w2 = profile(0.35);
  const w3 = profile(0.86);
  const archR = profile(0.1) * 0.92;

  return (
    <group position={position}>
      {/* lattice */}
      <instancedMesh
        ref={strutRef}
        args={[unitCyl, strutMat, strutData.length]}
        frustumCulled={false}
      />
      {/* golden edge lamps */}
      <instancedMesh
        ref={lampRef}
        args={[lampGeo, lampMat, lampData.length]}
        frustumCulled={false}
      />

      {/* central core (solid mass between 2nd and 3rd platform) */}
      <mesh
        position={[0, (hAt(0.35) + hAt(0.86)) / 2, 0]}
        rotation={[0, Math.PI / 4, 0]}
        material={strutMat}
      >
        <cylinderGeometry
          args={[profile(0.86) * 0.62, profile(0.35) * 0.62, hAt(0.86) - hAt(0.35), 4, 1]}
        />
      </mesh>

      {/* platforms with gold edge strips */}
      {(
        [
          [0.17, w1, 2.6],
          [0.35, w2, 2.0],
          [0.86, w3, 0.9],
        ] as [number, number, number][]
      ).map(([t, w, margin]) => (
        <group key={t} position={[0, hAt(t), 0]}>
          <mesh material={platformMat}>
            <boxGeometry args={[2 * w + margin, 0.5, 2 * w + margin]} />
          </mesh>
          <mesh position={[0, 0.3, 0]} material={goldEdgeMat}>
            <boxGeometry args={[2 * w + margin + 0.3, 0.1, 2 * w + margin + 0.3]} />
          </mesh>
        </group>
      ))}

      {/* four decorative arches */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot, i) => (
        <mesh
          key={i}
          position={[Math.sin(rot) * profile(0.1), hAt(0.1) * 0.96, Math.cos(rot) * profile(0.1)]}
          rotation={[0, rot, 0]}
          material={strutMat}
        >
          <torusGeometry args={[archR, 0.15, 6, 24, Math.PI]} />
        </mesh>
      ))}

      {/* antenna + pulsing beacon */}
      <mesh position={[0, H + 1.2, 0]} material={strutMat}>
        <cylinderGeometry args={[0.05, 0.09, 2.4, 6]} />
      </mesh>
      <mesh ref={beaconRef} position={[0, H + 2.5, 0]}>
        <sphereGeometry args={[0.24, 8, 8]} />
        <meshStandardMaterial color="#3d0a24" emissive="#ff2d95" emissiveIntensity={2} />
      </mesh>

      {/* golden illumination */}
      <pointLight position={[0, hAt(0.17) + 2, 0]} color="#ffb85c" intensity={330} distance={70} decay={1.6} />
      <pointLight position={[0, hAt(0.35) + 2, 0]} color="#ffc66d" intensity={240} distance={62} decay={1.6} />
      <pointLight position={[0, 6, 0]} color="#ff9d3d" intensity={180} distance={40} decay={1.7} />
    </group>
  );
}
