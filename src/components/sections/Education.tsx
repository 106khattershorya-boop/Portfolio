"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { education } from "@/data/profile";

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function Education() {
  return (
    <section
      id="education"
      aria-label="Education"
      className="relative z-10 border-t border-edge bg-obsidian/85 backdrop-blur-[6px]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-20 md:px-10 md:py-28">
        <motion.p {...reveal} transition={{ duration: 0.7 }} className="label-mono mb-10">
          FILE / EDUCATION — DISTRICT 05
        </motion.p>

        {/* minimal architectural timeline */}
        <div className="relative grid gap-10 md:grid-cols-12">
          <div className="relative md:col-span-8">
            {/* timeline spine */}
            <span
              aria-hidden
              className="absolute -left-4 top-1 h-full w-px bg-gradient-to-b from-neon/70 via-edge to-transparent md:-left-6"
            />
            <motion.div
              {...reveal}
              transition={{ duration: 0.8 }}
              className="relative pl-6 md:pl-10"
            >
              {/* node */}
              <span
                aria-hidden
                className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full border border-neon bg-obsidian shadow-[0_0_12px_rgba(0,229,255,0.5)] md:-left-[30px]"
              />
              <div className="flex items-start gap-5">
                <GraduationCap
                  size={30}
                  strokeWidth={1.25}
                  className="mt-1 shrink-0 text-aurum"
                  aria-hidden
                />
                <div>
                  <h2 className="font-display text-2xl font-bold leading-tight tracking-tight text-bone md:text-3xl">
                    {education.school.toUpperCase()}
                  </h2>
                  <p className="mt-2.5 text-[15px] text-dim md:text-base">
                    {education.degree}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <span className="border border-neon/60 bg-neon/5 px-3.5 py-1.5 font-technical text-[10px] uppercase tracking-[0.22em] text-neon">
                      CURRENT — {education.standing.toUpperCase()}
                    </span>
                    <span className="label-mono text-[8px]">
                      {education.note.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* architectural spec panel */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.8, delay: 0.12 }}
            className="md:col-span-4"
          >
            <div className="border border-edge bg-midnight/40 p-6">
              <p className="label-mono mb-4">STRUCTURE READOUT</p>
              <dl className="space-y-3 font-technical text-[11px]">
                {[
                  ["FIELD", "COMPUTER SCIENCE"],
                  ["LEVEL", "UNDERGRAD — B.TECH"],
                  ["PHASE", "YEAR 2 — SOPHOMORE"],
                  ["FOCUS", "FULL-STACK × GEN-AI"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between border-b border-edge/50 pb-2.5">
                    <dt className="text-dim">{k}</dt>
                    <dd className="text-bone">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 font-technical text-[9px] leading-relaxed text-dim/80">
                Dates, GPA and coursework intentionally omitted — nothing published
                that isn&apos;t verified.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
