"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  cinematic,
  sampleCamera,
  INTRO_SHOT,
  lerp,
  clamp01,
} from "@/lib/cinematic";
export interface RigFlags {
  reduced: boolean;
  low: boolean;
}

/**
 * CINEMATIC CAMERA
 *
 * The camera flies a shot-listed path through the city. Scroll
 * progress (published by the DOM-side director) samples the shot
 * list; a critically-damped follower turns it into motion. Pointer
 * parallax rides on top, and the opening dolly blends from a wide
 * establishing frame down into shot 01.
 */
export function CinematicCamera({ reduced, low }: RigFlags) {
  // mirror capability flags for the rest of the scene graph
  useEffect(() => {
    cinematic.reduced = reduced;
    cinematic.low = low;
  }, [reduced, low]);

  const mouse = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const lookSmooth = useRef(new THREE.Vector3(-13, 26, -26));
  const fovRef = useRef(46);
  const lastNow = useRef(0);

  const idealPos = useMemo(() => new THREE.Vector3(), []);
  const idealLook = useMemo(() => new THREE.Vector3(), []);
  const pathPos = useMemo(() => new THREE.Vector3(), []);
  const pathLook = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const upv = useMemo(() => new THREE.Vector3(), []);
  const UP = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  useFrame(({ camera }) => {
    // own real-time dt — immune to clock-sharing side effects
    const now = performance.now();
    const dt = lastNow.current ? Math.min((now - lastNow.current) / 1000, 0.05) : 0.016;
    lastNow.current = now;

    // 1 — sample the scroll-driven path
    const fovPath = sampleCamera(cinematic.progress, pathPos, pathLook);

    // 2 — opening dolly: establishing frame → shot 01
    let fovTarget = fovPath;
    if (reduced || cinematic.intro >= 1) {
      idealPos.copy(pathPos);
      idealLook.copy(pathLook);
    } else {
      const k = clamp01(cinematic.intro);
      idealPos.set(
        lerp(INTRO_SHOT.pos[0], pathPos.x, k),
        lerp(INTRO_SHOT.pos[1], pathPos.y, k),
        lerp(INTRO_SHOT.pos[2], pathPos.z, k)
      );
      idealLook.set(
        lerp(INTRO_SHOT.look[0], pathLook.x, k),
        lerp(INTRO_SHOT.look[1], pathLook.y, k),
        lerp(INTRO_SHOT.look[2], pathLook.z, k)
      );
      fovTarget = lerp(INTRO_SHOT.fov, fovPath, k);
    }

    // 3 — pointer parallax, in camera-local axes
    if (!reduced) {
      const f = Math.min(dt * 2.4, 0.12);
      smooth.current.x += (cinematic.pointer.x - smooth.current.x) * f;
      smooth.current.y += (cinematic.pointer.y - smooth.current.y) * f;

      dir.subVectors(idealLook, idealPos).normalize();
      right.crossVectors(dir, UP).normalize();
      upv.crossVectors(right, dir);

      const amp = low ? 1.7 : 2.6;
      idealPos.addScaledVector(right, smooth.current.x * amp);
      idealPos.addScaledVector(upv, -smooth.current.y * (low ? 0.8 : 1.3));
    }

    // 4 — damped follow (reduced motion ≈ 1:1 with scroll input)
    const speed = reduced ? 9 : 3.4;
    const damp = 1 - Math.exp(-speed * dt);
    camera.position.lerp(idealPos, damp);
    lookSmooth.current.lerp(idealLook, damp);
    camera.lookAt(lookSmooth.current);

    // 5 — focal length breathes between shots
    const fov = camera as THREE.PerspectiveCamera;
    const nf = fovRef.current + (fovTarget - fovRef.current) * damp;
    if (Math.abs(nf - fov.fov) > 0.01) {
      fovRef.current = nf;
      fov.fov = nf;
      fov.updateProjectionMatrix();
    }

    // debug readout
    cinematic.camPos[0] = camera.position.x;
    cinematic.camPos[1] = camera.position.y;
    cinematic.camPos[2] = camera.position.z;
    cinematic.camLook[0] = lookSmooth.current.x;
    cinematic.camLook[1] = lookSmooth.current.y;
    cinematic.camLook[2] = lookSmooth.current.z;
  });

  return null;
}
