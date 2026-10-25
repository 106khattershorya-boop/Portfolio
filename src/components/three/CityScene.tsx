"use client";

import * as THREE from "three";
import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { EiffelTower } from "./EiffelTower";
import { Cityscape, TOWER_POS } from "./cityscape";
import {
  Rain,
  Mist,
  FlyingVehicles,
  ElevatedHighway,
  WindowPulses,
  NightSky,
  HorizonGlow,
} from "./atmosphere";

export interface SceneFlags {
  reduced: boolean;
  low: boolean;
}

/* ---------------- camera rig: intro dolly + pointer parallax + scroll drift ---------------- */

function CameraRig({ reduced }: { reduced: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduced) window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  useFrame(({ camera, clock }, delta) => {
    const t = clock.getElapsedTime();

    // cinematic dolly-in over the first 3.4s
    const introT = Math.min(t / 3.4, 1);
    const ease = 1 - Math.pow(1 - introT, 3);

    // pointer parallax (gentle)
    smooth.current.x += (mouse.current.x - smooth.current.x) * Math.min(delta * 2.2, 0.08);
    smooth.current.y += (mouse.current.y - smooth.current.y) * Math.min(delta * 2.2, 0.08);

    // scroll drift: city recedes as the page unfolds
    const vh = window.innerHeight || 1;
    const scrollT = Math.min(window.scrollY / vh, 2.2);

    const baseZ = reduced ? 96 : 152 - ease * 56;
    const px = reduced ? 0 : smooth.current.x * 3.4;
    const py = reduced ? 0 : smooth.current.y * -1.6;

    camera.position.set(
      2 + px + scrollT * 1.5,
      15 + py + ease * 1.5 + scrollT * 7,
      baseZ - scrollT * 6
    );
    lookTarget.set(-6 - px * 0.5, 22 + scrollT * 3.5, -26);
    camera.lookAt(lookTarget);
  });

  return null;
}

/* ---------------- ground: reflective core + infinite dark surround ---------------- */

function Ground({ low }: { low: boolean }) {
  return (
    <group>
      {/* wet reflective boulevard area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -6]}>
        <planeGeometry args={[380, 300]} />
        {low ? (
          <meshStandardMaterial color="#05070b" roughness={0.35} metalness={0.55} />
        ) : (
          <MeshReflectorMaterial
            blur={[280, 60]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={1.5}
            roughness={0.82}
            depthScale={0.6}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#05070b"
            metalness={0.25}
            mirror={0.55}
          />
        )}
      </mesh>
      {/* far surround blends into fog */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, -100]}>
        <planeGeometry args={[1600, 900]} />
        <meshStandardMaterial color="#04060a" roughness={0.95} metalness={0} />
      </mesh>
      {/* boulevard guide lights */}
      <mesh position={[-7.5, 0.06, 10]}>
        <boxGeometry args={[0.35, 0.02, 130]} />
        <meshBasicMaterial color="#0e4a58" toneMapped={false} />
      </mesh>
      <mesh position={[7.5, 0.06, 10]}>
        <boxGeometry args={[0.35, 0.02, 130]} />
        <meshBasicMaterial color="#0e4a58" toneMapped={false} />
      </mesh>
      <mesh position={[-13.5, 0.06, 24]}>
        <boxGeometry args={[0.22, 0.02, 90]} />
        <meshBasicMaterial color="#43122c" toneMapped={false} />
      </mesh>
      <mesh position={[13.5, 0.06, 24]}>
        <boxGeometry args={[0.22, 0.02, 90]} />
        <meshBasicMaterial color="#43122c" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* ---------------- scene composition ---------------- */

export function CityScene({ reduced, low }: SceneFlags) {
  return (
    <>
      <color attach="background" args={["#05070c"]} />
      <fogExp2 attach="fog" args={["#0b1120", 0.0044]} />

      <CameraRig reduced={reduced} />

      {/* base lighting */}
      <hemisphereLight args={["#0e1626", "#050608", 0.55]} />
      <directionalLight position={[-80, 130, 60]} intensity={0.55} color="#5f7ea6" />
      <pointLight position={[0, 26, 40]} intensity={90} distance={140} decay={1.8} color="#00e5ff" />
      <pointLight position={[70, 20, -20]} intensity={70} distance={110} decay={1.8} color="#ff2d95" />
      <pointLight position={[-70, 16, -60]} intensity={55} distance={100} decay={1.8} color="#00e5ff" />

      <NightSky />
      <HorizonGlow />
      <Cityscape density={low ? 0.55 : 1} />
      <EiffelTower position={[TOWER_POS.x, 0, TOWER_POS.z]} />
      <Ground low={low} />
      <ElevatedHighway reduced={reduced} />
      <FlyingVehicles count={low ? 4 : 9} reduced={reduced} />
      <WindowPulses reduced={reduced} />
      <Mist reduced={reduced} />
      {!reduced && !low && <Rain count={2400} />}
      {!reduced && low && <Rain count={800} />}
    </>
  );
}
