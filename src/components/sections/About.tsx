"use client";

import { motion } from "framer-motion";
import { aboutSection, principles } from "@/data/profile";

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

/** Rooftop frame — a quiet architectural crop of the city below */
function RooftopFrame() {
  return (
    <div className="relative border border-edge bg-gradient-to-b from-midnight/60 to-obsidian/40 p-1.5">
      <div className="relative aspect-[4/5] overflow-hidden">
        {/* sky */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #0a1120 0%, #0a0f1a 45%, #101a2c 100%)",
          }}
        />
        {/* distant glows */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle 130px at 72% 26%, rgba(255,198,109,0.16), transparent 70%), radial-gradient(circle 170px at 20% 55%, rgba(255,45,149,0.10), transparent 70%), radial-gradient(circle 200px at 60% 80%, rgba(0,229,255,0.10), transparent 70%)",
          }}
        />
        {/* moon */}
        <div className="absolute right-[22%] top-[14%] h-10 w-10 rounded-full bg-[#e7edf7]/85 shadow-[0_0_36px_rgba(231,237,247,0.45)]" />
        {/* rooftop parapet silhouette */}
        <svg
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <g fill="#030509">
            <rect x="-20" y="360" width="440" height="30" />
            <rect x="-20" y="390" width="440" height="120" />
            {/* balustrade */}
            {Array.from({ length: 21 }).map((_, i) => (
              <rect key={i} x={i * 20 + 2} y="332" width="4" height="30" />
            ))}
            <rect x="-20" y="328" width="440" height="8" />
            {/* antenna + dish props */}
            <rect x="290" y="270" width="3" height="60" />
            <circle cx="291" cy="266" r="5" fill="#ff2d95" opacity="0.85" />
            <path d="M60 330 a26 26 0 0 1 52 0 Z" />
          </g>
        </svg>
        {/* city glow above parapet */}
        <div className="absolute inset-x-0 bottom-[34%] h-24 bg-gradient-to-t from-[#0e2233]/70 to-transparent" />
        {/* scanline caption */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-edge/60 bg-obsidian/70 px-4 py-2.5">
          <span className="label-mono text-[8px]">FRAME 07 — ROOFTOP, DISTRICT NOIR</span>
          <span className="label-mono text-[8px] text-neon">03:14 AM</span>
        </div>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section
      id="about"
      aria-label="About me"
      className="relative z-10"
    >
      {/* readability scrim above the observatory view */}
      <div aria-hidden className="scene-scrim pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <motion.p
          {...reveal}
          transition={{ duration: 0.7 }}
          className="label-mono mb-4"
        >
          FILE / IDENTITY — DISTRICT 03
        </motion.p>

        <div className="grid items-start gap-12 md:grid-cols-12 md:gap-16">
          {/* left: text */}
          <div className="glass-panel p-6 md:col-span-7 md:p-10">
            <motion.h2
              {...reveal}
              transition={{ duration: 0.8, delay: 0.05 }}
              className="h-section text-[clamp(2rem,5vw,4rem)] text-bone"
            >
              {aboutSection.heading.split(" ").slice(0, 3).join(" ")}
              <br />
              <span className="text-glow-flux text-flux">
                {aboutSection.heading.split(" ").slice(3).join(" ")}
              </span>
            </motion.h2>

            <motion.p
              {...reveal}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="mt-8 max-w-xl text-[16px] leading-relaxed text-bone/85 md:text-lg"
            >
              {aboutSection.body}
            </motion.p>

            {/* principles */}
            <div className="mt-12 space-y-0 border-t border-edge">
              {principles.map((p, i) => (
                <motion.div
                  key={p.index}
                  {...reveal}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }}
                  className="group flex items-start gap-6 border-b border-edge py-6"
                >
                  <span className="label-mono pt-1 text-neon">{p.index}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-wide text-bone transition-colors group-hover:text-neon md:text-xl">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-dim">{p.line}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* right: rooftop frame */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="md:col-span-5"
          >
            <div className="glass-panel p-2">
              <RooftopFrame />
            </div>
            <p className="label-mono mt-4 text-right text-[8px]">
              QUIET LOOKOUT — VIEWING THE CITY BETWEEN BUILDS
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
