"use client";

import { motion } from "framer-motion";
import { ArrowDown, ChevronRight } from "lucide-react";
import { profile, hero } from "@/data/profile";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.7 + i * 0.14, duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  const goTo = (href: string) =>
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* readability scrims — keep text legible over the city */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-obsidian/65 to-transparent" />

      {/* decorative technical coordinates */}
      <ul
        aria-hidden
        className="label-mono absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-6 text-right lg:flex"
      >
        {hero.coords.map((c, i) => (
          <motion.li
            key={c}
            custom={i}
            variants={fadeUp}
            initial="hidden"
            animate="show"
            style={{ writingMode: "vertical-rl" }}
            className="tracking-[0.4em]"
          >
            {c}
          </motion.li>
        ))}
        <motion.li
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto h-16 w-px bg-gradient-to-b from-neon/60 to-transparent"
        />
      </ul>

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-24 pt-40 md:px-10 md:pb-28">
        {/* status indicator */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mb-6 flex items-center gap-3"
        >
          <span className="blink-dot inline-block h-1.5 w-1.5 rounded-full bg-neon" />
          <span className="label-mono-neon">{hero.status}</span>
          <span className="hidden h-px w-24 bg-gradient-to-r from-neon/50 to-transparent sm:block" />
        </motion.div>

        {/* name */}
        <h1 className="font-display max-w-[13ch] text-[clamp(3rem,10vw,8.25rem)] font-bold leading-[0.94] tracking-[-0.03em] text-bone">
          <span className="block overflow-hidden">
            <motion.span
              className="block"
              initial={{ y: "108%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.45, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              SHORYA
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-glow-neon text-neon"
              initial={{ y: "108%" }}
              animate={{ y: 0 }}
              transition={{ delay: 0.58, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              KHATTER
            </motion.span>
          </span>
        </h1>

        {/* role + tagline */}
        <motion.p
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-technical mt-7 text-[11px] uppercase tracking-[0.34em] text-aurum md:text-xs"
        >
          {profile.role}
        </motion.p>
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-display mt-2.5 text-lg font-medium text-bone/90 md:text-2xl"
        >
          {profile.tagline.toUpperCase()}
        </motion.p>
        <motion.p
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim md:text-base"
        >
          {profile.description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <button
            onClick={() => goTo("#projects")}
            className="group inline-flex items-center gap-2 bg-neon px-6 py-3.5 font-technical text-[11px] font-bold uppercase tracking-[0.22em] text-obsidian transition-all duration-300 hover:shadow-[0_0_32px_rgba(0,229,255,0.45)]"
          >
            {hero.primaryCta}
            <ChevronRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
          <button
            onClick={() => goTo("#contact")}
            className="inline-flex items-center gap-2 border border-edge bg-obsidian/40 px-6 py-3.5 font-technical text-[11px] uppercase tracking-[0.22em] text-bone backdrop-blur-sm transition-all duration-300 hover:border-neon hover:text-neon"
          >
            {hero.secondaryCta}
          </button>
        </motion.div>
      </div>

      {/* scroll indicator */}
      <motion.button
        onClick={() => goTo("#projects")}
        aria-label="Scroll to projects"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="label-mono absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 transition-colors hover:text-neon"
      >
        SCROLL
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ArrowDown size={13} />
        </motion.span>
      </motion.button>
    </section>
  );
}
