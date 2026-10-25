"use client";

import type { LucideIcon } from "lucide-react";
import {
  Atom,
  Braces,
  FileCode2,
  Zap,
  Database,
  Table2,
  Binary,
  GitBranch,
  Github,
  Brain,
  Sparkles,
  FileSearch,
  MessagesSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { stackGroups, explorations, sectionHeadings } from "@/data/profile";

const iconMap: Record<string, LucideIcon> = {
  atom: Atom,
  braces: Braces,
  filecode: FileCode2,
  zap: Zap,
  database: Database,
  table: Table2,
  binary: Binary,
  gitbranch: GitBranch,
  github: Github,
  brain: Brain,
  sparkles: Sparkles,
  filesearch: FileSearch,
  messages: MessagesSquare,
};

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

export default function TechStack() {
  return (
    <section
      id="stack"
      aria-label="Tech stack"
      className="relative z-10"
    >
      {/* readability scrim above the overpass */}
      <div aria-hidden className="scene-scrim pointer-events-none absolute inset-0" />

      <div className="relative mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
        <motion.p {...reveal} transition={{ duration: 0.7 }} className="label-mono mb-4">
          FILE / ARSENAL — DISTRICT 04
        </motion.p>
        <motion.h2
          {...reveal}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="h-section text-[clamp(2rem,5vw,4rem)] text-bone"
        >
          {sectionHeadings.stack.split(".")[0]}
          <span className="text-neon">.</span>
        </motion.h2>

        {/* grouped grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stackGroups.map((group, i) => (
            <motion.div
              key={group.label}
              {...reveal}
              transition={{ duration: 0.7, delay: 0.05 * i }}
              className="glass-panel group p-6 transition-all duration-500 hover:border-neon/50"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="label-mono">{group.label}</p>
                <span className="label-mono text-[8px] text-neon/70">
                  IN USE
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => {
                  const Icon = iconMap[item.icon] ?? Braces;
                  return (
                    <li
                      key={item.name}
                      className="flex items-center gap-3 border border-edge/60 bg-obsidian/50 px-4 py-3 transition-all duration-300 hover:border-neon/60 hover:shadow-[0_0_18px_rgba(0,229,255,0.08)]"
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.5}
                        className="shrink-0 text-neon"
                        aria-hidden
                      />
                      <span className="font-technical text-[12px] tracking-[0.12em] text-bone">
                        {item.name}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          ))}

          {/* exploration panel spans the remaining cell */}
          <motion.div
            {...reveal}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="glass-panel p-6 transition-colors duration-500 hover:border-flux sm:col-span-2 lg:col-span-1 border-dashed !border-flux/50 bg-flux/[0.03] hover:!border-flux hover:bg-flux/[0.06]"
          >
            <div className="mb-5 flex items-center justify-between">
              <p className="label-mono text-flux">AREAS OF EXPLORATION</p>
              <span className="label-mono text-[8px] text-flux/80">DEEP DIVE</span>
            </div>
            <ul className="flex flex-col gap-2">
              {explorations.map((item) => {
                const Icon = iconMap[item.icon] ?? Sparkles;
                return (
                  <li
                    key={item.name}
                    className="flex items-center gap-3 border border-flux/25 bg-obsidian/50 px-4 py-3 transition-all duration-300 hover:border-flux/70 hover:shadow-[0_0_18px_rgba(255,45,149,0.08)]"
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.5}
                      className="shrink-0 text-flux"
                      aria-hidden
                    />
                    <span className="font-technical text-[12px] tracking-[0.12em] text-bone">
                      {item.name}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 font-technical text-[10px] leading-relaxed text-dim">
              Actively studying — not yet claimed as production experience.
            </p>
          </motion.div>
        </div>

        <motion.p
          {...reveal}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="label-mono mt-10 text-[8px]"
        >
          NO PERCENTAGE BARS. NO PRETEND RATINGS — TOOLS I USE, AND TOOLS I&apos;M LEARNING.
        </motion.p>
      </div>
    </section>
  );
}
