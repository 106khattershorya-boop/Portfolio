"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { sceneTime } from "@/lib/scene-time";

/**
 * PROJECT DISTRICT — three holographic architectural displays
 * floating above plaza pads in the city. The camera flies past
 * them during the projects chapter; the DOM cards are composed
 * around them like HUD glass.
 */

const PANELS: {
  pos: [number, number, number];
  color: string;
  index: string;
  label: string;
  face: [number, number]; // camera XZ the panel faces
}[] = [
  { pos: [46, 11, -32], color: "#00e5ff", index: "01", label: "PACKSURE AI", face: [25, -6] },
  { pos: [58, 13, -46], color: "#ff2d95", index: "02", label: "OILTRACE", face: [36, -28] },
  { pos: [70, 15, -60], color: "#ffc66d", index: "03", label: "SYNCFIT", face: [64, 18] },
];

/* ---------------- holo glass shader ---------------- */

const HOLO_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPosW = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const HOLO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    // fresnel edge
    vec3 viewDir = normalize(cameraPosition - vPosW);
    float fres = pow(1.0 - abs(dot(viewDir, vNormalW)), 2.2);

    // fine scanlines + a slow travelling band
    float scan = 0.5 + 0.5 * sin(vUv.y * 120.0 + uTime * 1.6);
    float band = smoothstep(0.0, 0.5, fract(vUv.y * 0.9 - uTime * 0.045));
    band = smoothstep(0.45, 1.0, band) * 0.22;

    // faint structural grid
    float grid = max(
      step(0.965, fract(vUv.x * 8.0)),
      step(0.955, fract(vUv.y * 10.0))
    ) * 0.10;

    float a = uOpacity * (0.30 + scan * 0.14 + band + grid) + fres * 0.38;
    gl_FragColor = vec4(uColor * (0.75 + fres * 0.9 + scan * 0.12), a);
  }
`;

/* ---------------- index glyph texture ---------------- */

function makeGlyphTexture(index: string, label: string, color: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 512);

  // giant chapter digits
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 26;
  ctx.font = "700 250px 'Space Grotesk', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(index, 256, 250);

  // label plate
  ctx.shadowBlur = 12;
  ctx.font = "600 44px 'JetBrains Mono', 'Courier New', monospace";
  ctx.fillText(label, 256, 360);

  // underline
  ctx.fillRect(156, 396, 200, 4);
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* ---------------- one holographic display ---------------- */

function HoloDisplay({
  spec,
  index,
  reduced,
}: {
  spec: (typeof PANELS)[number];
  index: number;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const glassRef = useRef<THREE.Mesh>(null);
  const baseY = spec.pos[1];

  const holoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: HOLO_VERT,
        fragmentShader: HOLO_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(spec.color) },
          uTime: { value: index * 3.1 },
          uOpacity: { value: 0.16 },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    [spec.color, index]
  );

  const glyphTex = useMemo(
    () => makeGlyphTexture(spec.index, spec.label, spec.color),
    [spec]
  );
  const glyphMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glyphTex,
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        opacity: 0.9,
      }),
    [glyphTex]
  );

  const frameMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: spec.color,
        toneMapped: false,
      }),
    [spec.color]
  );
  const padMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#0a0d13",
        roughness: 0.5,
        metalness: 0.6,
      }),
    []
  );
  const conduitMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(spec.color).multiplyScalar(0.35),
        toneMapped: false,
      }),
    [spec.color]
  );
  const beamMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: spec.color,
        transparent: true,
        opacity: 0.05,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [spec.color]
  );

  // face the camera position this display is staged for
  const rotY = useMemo(
    () => Math.atan2(spec.face[0] - spec.pos[0], spec.face[1] - spec.pos[2]),
    [spec]
  );

  useFrame(() => {
    const t = sceneTime.t;
    const glass = glassRef.current?.material as THREE.ShaderMaterial | undefined;
    if (glass?.uniforms?.uTime) glass.uniforms.uTime.value = t + index * 3.1;
    if (reduced || !group.current) return;
    group.current.position.y = baseY + Math.sin(t * 0.45 + index * 1.9) * 0.32;
    group.current.rotation.y = rotY + Math.sin(t * 0.2 + index) * 0.045;
  });

  const W = 7.4;
  const H = 9.6;

  return (
    <group>
      {/* plaza pad + emissive ring */}
      <mesh position={[spec.pos[0], 0.18, spec.pos[2]]} material={padMat}>
        <cylinderGeometry args={[4.6, 5.1, 0.36, 28]} />
      </mesh>
      <mesh
        position={[spec.pos[0], 0.4, spec.pos[2]]}
        rotation={[Math.PI / 2, 0, 0]}
        material={frameMat}
      >
        <torusGeometry args={[4.35, 0.055, 6, 48]} />
      </mesh>

      {/* ground conduits running toward the boulevard */}
      <mesh
        position={[spec.pos[0] - 4.4, 0.07, spec.pos[2] + 4.4]}
        rotation={[0, Math.PI / 4, 0]}
        material={conduitMat}
      >
        <boxGeometry args={[0.16, 0.02, 12]} />
      </mesh>

      {/* rising light columns */}
      {[-2.6, 2.6].map((dx) => (
        <mesh
          key={dx}
          position={[spec.pos[0] + dx, baseY / 2, spec.pos[2]]}
          material={beamMat}
        >
          <cylinderGeometry args={[0.16, 0.16, baseY, 6, 1, true]} />
        </mesh>
      ))}

      {/* tinted local glow */}
      <pointLight
        position={[spec.pos[0], baseY + 3, spec.pos[2] + 2]}
        color={spec.color}
        intensity={26}
        distance={30}
        decay={1.9}
      />

      {/* the floating glass display */}
      <group ref={group} position={[spec.pos[0], baseY, spec.pos[2]]} rotation={[0, rotY, 0]}>
        <mesh ref={glassRef} material={holoMat}>
          <boxGeometry args={[W, H, 0.3]} />
        </mesh>

        {/* emissive frame */}
        {[
          { p: [0, H / 2 + 0.07, 0] as const, s: [W + 0.14, 0.12, 0.42] as const },
          { p: [0, -H / 2 - 0.07, 0] as const, s: [W + 0.14, 0.12, 0.42] as const },
          { p: [-W / 2 - 0.07, 0, 0] as const, s: [0.12, H + 0.14, 0.42] as const },
          { p: [W / 2 + 0.07, 0, 0] as const, s: [0.12, H + 0.14, 0.42] as const },
        ].map((b, i) => (
          <mesh key={i} position={[b.p[0], b.p[1], b.p[2]]} material={frameMat}>
            <boxGeometry args={[b.s[0], b.s[1], b.s[2]]} />
          </mesh>
        ))}

        {/* chapter glyph */}
        <mesh position={[0, 0.6, 0.22]} material={glyphMat}>
          <planeGeometry args={[5.6, 5.6]} />
        </mesh>

        {/* pedestal shadow-catcher beam below the glass */}
        <mesh position={[0, -H / 2 - 0.9, 0]} material={beamMat}>
          <cylinderGeometry args={[0.5, 1.6, 1.7, 10, 1, true]} />
        </mesh>
      </group>
    </group>
  );
}

export function ProjectDistrict({ reduced }: { reduced: boolean }) {
  return (
    <group>
      {PANELS.map((spec, i) => (
        <HoloDisplay key={spec.index} spec={spec} index={i} reduced={reduced} />
      ))}
    </group>
  );
}
