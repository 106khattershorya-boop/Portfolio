# Worklog — NEON NOIR Portfolio

Project: Personal developer portfolio for Shorya Khatter — Next.js 16 + TypeScript + React Three Fiber (NEON NOIR: Paris × NYC cyberpunk).

---
Task ID: 1
Agent: main
Task: Initialize environment, verify GitHub repos, install dependencies

Work Log:
- Ran fullstack init script (Next.js 16 scaffold, port 3000, auto dev server)
- Inspected GitHub API: repos = canteen-chaos2, CodeFlux (SIH 2026), Oiltrace (SIH 2026-2), QuantNova (live: quantnova.in), README-Generator
- Inspected CodeFlux repo tree: OCR pipeline (extractor/preprocess/crop/test_ocr), compliance.py + rules.json, chatbot.py, db_integration.py + sih_schema.sql, api.py, React+Vite frontend
- Inspected Oiltrace repo tree: unet.py, train.py, dataset.py, spill_detection.py, spectral_analysis.py, ml_pipeline.py, behaviour_analysis.py, detect_loitering.py, ais_integration.py, api.py
- SyncFit: NO public repo found → GitHub action will link to profile, data file has editable placeholder
- Installed: three, @types/three, @react-three/fiber@9.8.2, @react-three/drei@10.7.9, @react-three/postprocessing@3.2.2, framer-motion@14.6.0

Stage Summary:
- Verified project data only (no invented metrics). Stack: Next.js 16 (sandbox requirement, replaces Vite) + TS + R3F + Drei + Framer Motion + Lucide
- Architecture: single page (`/` only per sandbox), project details in modal, terminal easter egg, fixed 3D city backdrop with quality tiers

---
Task ID: 2-14
Agent: main
Task: Build complete NEON NOIR portfolio + E2E verification

Work Log:
- Design system: Space Grotesk / Inter / JetBrains Mono, obsidian-midnight palette, cyan/magenta/gold accents, grain overlay, custom scrollbar/selection/focus
- Central data file src/data/profile.ts (identity, projects w/ verified repo modules, stack groups, principles, education, footer)
- 3D scene: procedural Eiffel Tower (26-level lattice, arches, platforms, gold lamps, pulsing beacon), merged-geometry city (~210 window-lit towers, 4 texture variants), Haussmann blocks, neon signage, GPU rain shader (LineSegments), mist planes, flying vehicles, elevated highway w/ instanceColor traffic, horizon glow, moon+stars, MeshReflectorMaterial wet ground
- Camera rig: 3.4s intro dolly, pointer parallax, scroll drift; fixed canvas dims on scroll; quality tiers (high/low) + reduced-motion static mode; WebGL/CSS fallback + SceneErrorBoundary
- UI: Nav (scroll-spy, mobile menu, Escape), Terminal (help/about/projects/skills/github/linkedin/contact/education/clear + history + graceful unknown), CustomCursor (pointer:fine only), Hero, Projects (3 editorial rows + concept visuals labeled as such + verified-sourced modal), About (rooftop frame + principles), TechStack (uses vs exploring), Education (timeline, no invented dates), Contact (validated form -> honest mailto draft), Footer
- Fixed during verification: R3F primitive material reuse crash (-> material props), Rain ref crash (mesh.material.uniforms via ref in useFrame), instanceColor attach target, JSX typo, mobile menu click interception (pointer-events-none), fog/bloom/window-density tuning for cinematic readability
- Verified via agent-browser: hero desktop+mobile, projects, modal, terminal commands, form errors+valid mailto flow, sections scroll-spy, mobile menu nav, no horizontal overflow, 0 console errors, dev.log clean

Stage Summary:
- Site fully functional on / with verified-only content; all links live or honestly labeled; editable config in src/data/profile.ts; SyncFit repo placeholder per instructions

---
Task ID: 15 (cinematic transformation)
Agent: main
Task: Transform NEON NOIR portfolio from "website over 3D backdrop" into a scroll-driven cinematic camera journey (user escalation request)

Work Log:
- Architecture: real scroll drives a shot-listed camera path. New src/lib/cinematic.ts = shared zero-render store + SHOTS (7 keyframes / 6 chapters: Midnight Approach, Project District x2, Rooftop Observatory, Overpass, Axis, Final Overlook) + INTRO_SHOT establishing frame + catmull/smootherstep sampling
- src/hooks/use-cinematic-director.ts: measures real DOM sections (data by section id + anchor fraction) -> normalized stops; publishes progress/pointer/phase at rAF; letterbox phase on <html data-cinema>; window.__cine debug handle
- CinematicCamera.tsx: scroll-scrubbed Catmull-Rom path, 4.6s intro dolly (skips on early scroll/keeps working under reduced-motion at 1:1 damping), camera-local pointer parallax, per-shot FOV blending, own performance.now() dt
- Set pieces: ProjectDistrict.tsx (3 floating holo panels w/ custom scanline+fresnel shader, canvas glyph textures 01/02/03, plaza pads, conduits, beams), Landmarks.tsx (CityGate flown through on the boulevard, rooftop Observatory the About chapter rests on, 4 volumetric beam columns w/ gradient shader), SceneClock.tsx (single clock reader; avoids THREE.Clock.getElapsedTime/getDelta sharing pitfalls)
- cityscape.tsx: flight-corridor exclusion (r15) + landmark plazas (observatory r24, panels r19, gate r17) so the camera never clips buildings
- Sections: opaque blocks -> transparent stages (scene-scrim + glass-panel/glass-panel-strong), Projects rows -> alternating floating glass panels, taller py for dwell; NeonCity: removed old scroll-fade, frameloop always, fallback releases letterbox
- CinematicHUD.tsx: progress hairline, CH.xx shot label, clickable chapter rail (rAF DOM patching, no re-renders); letterbox + hud-tick + glass CSS in globals.css w/ reduced-motion guards
- Verified via agent-browser (desktop 1440x900 + mobile 390x844): intro dolly+bars, convergence at every stop, terminal help/projects/unknown/Escape, PackSure modal, HUD chapter jump, form empty->3 alerts / valid->honest mailto draft status, mobile menu, overflowX 0, 0 console/page errors, eslint + tsc clean
- Fixed during verification: (1) publish loop was scroll-only -> intro never completed without scrolling; (2) camera damping appeared broken in headless — root causes: headless rAF throttling + html scroll-behavior:smooth intercepting eval scrollTo (use behavior:'instant' in tests); (3) react-hooks/immutability violations (mutate via mesh refs / useEffect); (4) hero/observatory/02b/axis art direction pass (look shifts, pullbacks, plaza clearings, gate beam slimming)

Stage Summary:
- The 3D city is now the main attraction: scroll IS the camera dolly. All prior features preserved (nav scroll-spy, terminal, modal, verified-only content, fallbacks, reduced-motion). Shot list lives in src/lib/cinematic.ts (SHOTS) for easy art direction; debug handle window.__cine.camPos for future tuning
