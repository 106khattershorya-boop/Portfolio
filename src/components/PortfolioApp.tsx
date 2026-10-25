"use client";

import { useState } from "react";
import NeonCity from "@/components/three/NeonCity";
import Nav from "@/components/Nav";
import Terminal from "@/components/Terminal";
import CustomCursor from "@/components/CustomCursor";
import CinematicHUD from "@/components/CinematicHUD";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import TechStack from "@/components/sections/TechStack";
import Education from "@/components/sections/Education";
import Contact, { Footer } from "@/components/sections/Contact";
import { useSceneQuality } from "@/hooks/use-scene-quality";
import { useCinematicDirector } from "@/hooks/use-cinematic-director";

export default function PortfolioApp() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const { ready, webgl } = useSceneQuality();

  // the scroll-driven camera journey — only when the WebGL scene is live
  useCinematicDirector(ready && webgl);

  return (
    <div className="grain relative min-h-screen bg-obsidian">
      {/* skip link for keyboard users */}
      <a
        href="#projects"
        className="label-mono fixed left-4 top-4 z-[90] -translate-y-20 border border-neon bg-obsidian px-4 py-2 text-neon transition-transform focus:translate-y-0"
      >
        SKIP TO CONTENT
      </a>

      {/* the 3D city — the stage the whole page plays on */}
      <NeonCity />

      {/* cinematic letterbox bars (opening only) */}
      <div aria-hidden className="letterbox letterbox-top" />
      <div aria-hidden className="letterbox letterbox-bottom" />

      <CustomCursor />
      <Nav
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((v) => !v)}
      />
      <Terminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />

      <CinematicHUD />

      <main className="relative">
        <Hero />
        <Projects />
        <About />
        <TechStack />
        <Education />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
