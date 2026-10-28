"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ExternalLink, Github, X } from "lucide-react";
import { profile, projects, sectionHeadings, type Project } from "@/data/profile";
import ProjectVisual from "./ProjectVisual";

/* ============================ project modal ============================ */

function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const githubHref = project.links.github ?? profile.github;
  const isProfileFallback = project.links.github === null;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-obsidian/80 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} details`}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-3xl overflow-y-auto border border-edge bg-midnight"
      >
        {/* header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-edge bg-midnight/95 px-6 py-5 backdrop-blur md:px-8">
          <div>
            <p className="label-mono-neon mb-1.5">
              PROJECT {project.index} — {project.category.toUpperCase()}
            </p>
            <h3 className="font-display text-2xl font-bold tracking-tight text-bone md:text-3xl">
              {project.name}
            </h3>
            {project.repoName && (
              <p className="label-mono mt-1.5 text-[9px]">
                REPO / {project.repoName.toUpperCase()} — VERIFIED FROM SOURCE
              </p>
            )}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close project details"
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-edge text-dim transition-colors hover:border-flux hover:text-flux"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-8 px-6 py-7 md:px-8">
          <div>
            <p className="label-mono mb-2.5">OVERVIEW</p>
            <p className="text-[15px] leading-relaxed text-bone/85">{project.overview}</p>
          </div>
          <div>
            <p className="label-mono mb-2.5">PROBLEM BEING ADDRESSED</p>
            <p className="text-[15px] leading-relaxed text-bone/85">{project.problem}</p>
          </div>
          <div>
            <p className="label-mono mb-3">VERIFIED TECHNOLOGY STACK</p>
            <ul className="flex flex-wrap gap-2">
              {project.stack.map((s) => (
                <li
                  key={s}
                  className="border border-edge bg-obsidian/60 px-3 py-1.5 font-technical text-[10px] uppercase tracking-[0.18em] text-neon"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {project.verifiedModules && (
            <div>
              <p className="label-mono mb-3">REPO MAP — MODULES VERIFIED FROM SOURCE</p>
              <ul className="space-y-2 border-l border-edge pl-4">
                {project.verifiedModules.map((m) => (
                  <li key={m} className="font-technical text-[11px] leading-relaxed text-dim">
                    <span className="text-aurum">▸ </span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {project.verifiedNote && (
            <p className="border border-edge bg-obsidian/50 px-4 py-3 font-technical text-[10px] leading-relaxed text-dim">
              {project.verifiedNote}
            </p>
          )}
          <div className="flex flex-wrap gap-3 border-t border-edge pt-6">
            <a
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-neon px-5 py-3 font-technical text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian transition-shadow hover:shadow-[0_0_26px_rgba(0,229,255,0.4)]"
            >
              <Github size={13} />
              {isProfileFallback ? "GITHUB PROFILE" : "VIEW REPOSITORY"}
            </a>
            {project.links.live && (
              <a
                href={project.links.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-edge px-5 py-3 font-technical text-[10px] uppercase tracking-[0.2em] text-bone transition-colors hover:border-neon hover:text-neon"
              >
                <ExternalLink size={13} />
                LIVE DEMO
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================ section ============================ */

export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section
      id="projects"
      aria-label="Selected projects"
      className="relative z-10 border-t border-edge bg-obsidian/85 backdrop-blur-[6px]"
    >
      <div className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        {/* heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 md:mb-20"
        >
          <p className="label-mono mb-4">FILE / PORTFOLIO — DISTRICT 02</p>
          <h2 className="h-section text-[clamp(2rem,5vw,4rem)] text-bone">
            {sectionHeadings.projects.split("/")[0]}
            <span className="text-neon">/ {projects[0].index}{projects.length > 1 ? `—${projects.length.toString().padStart(2, "0")}` : ""}</span>
          </h2>
          <p className="mt-4 max-w-lg text-[15px] text-dim md:text-base">
            {sectionHeadings.projectsSub}
          </p>
        </motion.div>

        {/* editorial project rows */}
        <div className="flex flex-col">
          {projects.map((project, i) => (
            <motion.article
              key={project.id}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
              className="group relative border-t border-edge py-12 md:py-16 last:border-b"
            >
              <div
                className={`grid items-center gap-8 md:grid-cols-12 md:gap-12 ${
                  i % 2 === 1 ? "" : ""
                }`}
              >
                {/* visual */}
                <button
                  onClick={() => setSelected(project)}
                  aria-label={`Open details for ${project.name}`}
                  className={`relative block w-full cursor-pointer text-left md:col-span-7 ${
                    i % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  <ProjectVisual kind={project.visual} />
                </button>

                {/* info */}
                <div className={`relative md:col-span-5 ${i % 2 === 1 ? "md:order-1" : ""}`}>
                  <span
                    aria-hidden
                    className="font-display pointer-events-none absolute -top-10 right-0 select-none text-[7rem] font-bold leading-none text-transparent md:-top-14 md:text-[9rem]"
                    style={{ WebkitTextStroke: "1px #273140" }}
                  >
                    {project.index}
                  </span>
                  <p className="label-mono-neon mb-3">
                    {project.index} — {project.category.toUpperCase()}
                  </p>
                  <h3 className="font-display text-2xl font-bold tracking-tight text-bone transition-colors duration-300 group-hover:text-neon md:text-4xl">
                    {project.name}
                  </h3>
                  <p className="mt-4 max-w-md text-[15px] leading-relaxed text-dim">
                    {project.description}
                  </p>

                  {/* stack tags */}
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {project.stack.map((s) => (
                      <li
                        key={s}
                        className="border border-edge/80 bg-midnight/60 px-2.5 py-1 font-technical text-[9px] uppercase tracking-[0.18em] text-dim transition-colors group-hover:border-edge group-hover:text-bone"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>

                  {/* actions */}
                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setSelected(project)}
                      className="inline-flex items-center gap-1.5 font-technical text-[11px] font-bold uppercase tracking-[0.22em] text-neon transition-all hover:gap-3 hover:text-glow-neon"
                    >
                      VIEW PROJECT
                      <ArrowUpRight size={14} />
                    </button>
                    <a
                      href={project.links.github ?? profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-technical text-[11px] uppercase tracking-[0.22em] text-dim transition-colors hover:text-bone"
                    >
                      <Github size={13} />
                      {project.links.github ? "GITHUB" : "GITHUB PROFILE"}
                    </a>
                    {project.links.live && (
                      <a
                        href={project.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-technical text-[11px] uppercase tracking-[0.22em] text-aurum transition-colors hover:text-bone"
                      >
                        <ExternalLink size={13} />
                        LIVE DEMO
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <ProjectModal project={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
