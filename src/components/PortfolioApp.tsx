"use client";

import { useState } from "react";
import NeonCity from "@/components/three/NeonCity";
import Nav from "@/components/Nav";
import Terminal from "@/components/Terminal";
import CustomCursor from "@/components/CustomCursor";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import About from "@/components/sections/About";
import TechStack from "@/components/sections/TechStack";
import Education from "@/components/sections/Education";
import Contact, { Footer } from "@/components/sections/Contact";

export default function PortfolioApp() {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <div className="grain relative min-h-screen bg-obsidian">
      {/* skip link for keyboard users */}
      <a
        href="#projects"
        className="label-mono fixed left-4 top-4 z-[90] -translate-y-20 border border-neon bg-obsidian px-4 py-2 text-neon transition-transform focus:translate-y-0"
      >
        SKIP TO CONTENT
      </a>

      {/* fixed 3D city backdrop (with static fallback) */}
      <NeonCity />

      <CustomCursor />
      <Nav
        terminalOpen={terminalOpen}
        onToggleTerminal={() => setTerminalOpen((v) => !v)}
      />
      <Terminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />

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
