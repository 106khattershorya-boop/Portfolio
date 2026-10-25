"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { MeshReflectorMaterial } from "@react-three/drei";
import { EiffelTower } from "./EiffelTower";
import { Cityscape, TOWER_POS } from "./cityscape";
import { CinematicCamera } from "./CinematicCamera";
import { SceneClock } from "./SceneClock";
import { ProjectDistrict } from "./ProjectDistrict";
import { CityGate, Observatory, Beams } from "./Landmarks";
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
      <fogExp2 attach="fog" args={["#0b1120", 0.0036]} />

      <CinematicCamera reduced={reduced} low={low} />

      {/* single clock reader — everyone else reads sceneTime.t */}
      <SceneClock />

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

      {/* cinematic set pieces */}
      <ProjectDistrict reduced={reduced} />
      <CityGate reduced={reduced} />
      <Observatory reduced={reduced} />
      <Beams />

      <ElevatedHighway reduced={reduced} />
      <FlyingVehicles count={low ? 4 : 9} reduced={reduced} />
      <WindowPulses reduced={reduced} />
      <Mist reduced={reduced} />
      {!reduced && !low && <Rain count={2400} />}
      {!reduced && low && <Rain count={800} />}
    </>
  );
}
