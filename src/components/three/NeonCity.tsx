"use client";

import * as THREE from "three";
import React, { Component, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { CityScene } from "./CityScene";
import { useSceneQuality } from "@/hooks/use-scene-quality";

/* ---------- static CSS/SVG fallback (no WebGL or scene failure) ---------- */

export function StaticCityFallback() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #04060b 0%, #070c16 42%, #0b1220 78%, #0e1626 100%)",
      }}
    >
      {/* moon glow */}
      <div
        className="absolute rounded-full"
        style={{
          right: "12%",
          top: "12%",
          width: 130,
          height: 130,
          background:
            "radial-gradient(circle, rgba(220,232,248,0.5) 0%, rgba(220,232,248,0.08) 45%, transparent 70%)",
        }}
      />
      {/* neon horizon glows */}
      <div
        className="absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background:
            "radial-gradient(ellipse 60% 45% at 22% 62%, rgba(255,198,109,0.13), transparent 65%), radial-gradient(ellipse 55% 40% at 78% 55%, rgba(255,45,149,0.10), transparent 60%), radial-gradient(ellipse 70% 50% at 45% 75%, rgba(0,229,255,0.10), transparent 65%)",
        }}
      />
      {/* skyline silhouette with Eiffel Tower */}
      <svg
        viewBox="0 0 1440 420"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-[62%] w-full"
      >
        <g fill="#030509">
          {/* skyline blocks */}
          {[
            [0, 150, 70, 270], [70, 200, 55, 220], [125, 120, 80, 300],
            [205, 180, 60, 240], [265, 90, 70, 330], [335, 160, 85, 260],
            [420, 210, 50, 210], [470, 130, 75, 290], [545, 190, 65, 230],
            [700, 140, 80, 280], [780, 200, 60, 220], [840, 100, 72, 320],
            [912, 170, 64, 250], [976, 210, 58, 210], [1034, 120, 84, 300],
            [1118, 180, 62, 240], [1180, 90, 76, 330], [1256, 160, 80, 260],
            [1336, 200, 60, 220], [1396, 130, 44, 290],
          ].map(([x, y, w, h], i) => (
            <rect key={i} x={x} y={y + 60} width={w} height={h} />
          ))}
          {/* Eiffel tower silhouette */}
          <path d="M600 420 L614 300 Q604 292 596 268 L606 262 Q612 240 616 208 L610 204 Q618 170 620 120 L626 120 Q628 170 636 204 L630 208 Q634 240 640 262 L650 268 Q642 292 632 300 L646 420 L634 420 L623 320 L612 320 L601 420 Z" />
          <rect x="608" y="286" width="30" height="6" />
          <rect x="612" y="212" width="22" height="5" />
        </g>
        {/* window lights */}
        <g fill="#ffd9a0" opacity="0.5">
          {Array.from({ length: 90 }).map((_, i) => {
            const x = 8 + (i * 137) % 1420;
            const y = 120 + ((i * 71) % 260);
            return <rect key={i} x={x} y={y} width={2.4} height={3.4} opacity={0.25 + ((i * 13) % 10) / 14} />;
          })}
        </g>
        <g fill="#9fefff" opacity="0.45">
          {Array.from({ length: 60 }).map((_, i) => {
            const x = 14 + (i * 199) % 1400;
            const y = 140 + ((i * 83) % 240);
            return <rect key={i} x={x} y={y} width={2.4} height={3.4} opacity={0.2 + ((i * 17) % 10) / 16} />;
          })}
        </g>
      </svg>
      {/* ground reflection tint */}
      <div
        className="absolute inset-x-0 bottom-0 h-[18%]"
        style={{
          background:
            "linear-gradient(to top, rgba(14,22,38,0.9), transparent)",
        }}
      />
    </div>
  );
}

/* ---------- error boundary around the 3D scene ---------- */

class SceneErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[NeonCity] 3D scene failed, using static fallback:", error);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

/* ---------- the fixed 3D backdrop ---------- */

export default function NeonCity() {
  const { ready, tier, reducedMotion, webgl } = useSceneQuality();
  const [sceneOk, setSceneOk] = useState(true);
  const [created, setCreated] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const showCanvas = ready && webgl && sceneOk;
  const showFallback = !showCanvas || !created;

  // no live scene → the film is off; release the letterbox immediately
  useEffect(() => {
    if (!showCanvas) {
      document.documentElement.setAttribute("data-cinema", "live");
    }
  }, [showCanvas]);

  const low = tier === "low";

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-0 pointer-events-none"
    >
      {/* fallback underneath everything (also the pre-canvas backdrop) */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: showFallback ? 1 : 0 }}
      >
        <StaticCityFallback />
      </div>

      {showCanvas && (
        <div ref={canvasRef} className="absolute inset-0">
          <SceneErrorBoundary fallback={null}>
            <Canvas
              frameloop="always"
              dpr={[1, low ? 1.3 : 1.75]}
              gl={{
                antialias: true,
                powerPreference: "high-performance",
                alpha: false,
                stencil: false,
              }}
              camera={{ fov: 46, near: 0.5, far: 1600, position: [38, 48, 196] }}
              onCreated={({ gl }) => {
                gl.toneMapping = THREE.ACESFilmicToneMapping;
                gl.toneMappingExposure = 1.05;
                setCreated(true);
              }}
              onError={() => setSceneOk(false)}
            >
              <CityScene reduced={reducedMotion} low={low} />
              <EffectComposer multisampling={low ? 0 : 2}>
                <Bloom
                  intensity={low ? 0.55 : 0.7}
                  luminanceThreshold={0.52}
                  luminanceSmoothing={0.22}
                  mipmapBlur
                  radius={0.72}
                />
                <Vignette eskil={false} offset={0.24} darkness={0.62} />
                {!low && <Noise opacity={0.045} blendFunction={BlendFunction.OVERLAY} />}
              </EffectComposer>
            </Canvas>
          </SceneErrorBoundary>
        </div>
      )}

      {/* lightweight loading indicator */}
      {showCanvas && !created && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap label-mono animate-pulse">
          CALIBRATING LENSES / RENDERING DISTRICT…
        </div>
      )}
    </div>
  );
}
