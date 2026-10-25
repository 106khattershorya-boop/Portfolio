"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SquareTerminal, Menu, X } from "lucide-react";
import { profile, navItems } from "@/data/profile";
import { useActiveSection } from "@/hooks/use-active-section";

const SECTION_IDS = ["home", "projects", "about", "stack", "contact"];

export default function Nav({
  onToggleTerminal,
  terminalOpen,
}: {
  onToggleTerminal: () => void;
  terminalOpen: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock scroll when the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Escape closes the mobile menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const goTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "bg-midnight/80 backdrop-blur-md border-b border-edge"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10"
        >
          {/* logo */}
          <button
            onClick={() => goTo("#home")}
            className="font-technical text-sm font-bold tracking-[0.22em] text-bone hover:text-neon transition-colors"
            aria-label="Back to top — Shorya Khatter"
          >
            {profile.logo.split("//")[0]}
            <span className="text-neon">{`//`}</span>
          </button>

          {/* desktop links */}
          <ul className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <li key={item.label}>
                  <button
                    onClick={() => goTo(item.href)}
                    aria-current={isActive ? "true" : undefined}
                    className={`label-mono flex items-center gap-1.5 transition-colors duration-300 hover:text-bone ${
                      isActive ? "text-neon" : "text-dim"
                    }`}
                  >
                    <span
                      className={`inline-block h-1 w-1 transition-all duration-300 ${
                        isActive ? "bg-neon shadow-[0_0_8px_#00e5ff]" : "bg-edge"
                      }`}
                    />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2.5">
            {/* terminal trigger */}
            <button
              onClick={onToggleTerminal}
              aria-label={terminalOpen ? "Close terminal" : "Open interactive terminal"}
              aria-expanded={terminalOpen}
              className={`flex h-9 w-9 items-center justify-center border transition-all duration-300 ${
                terminalOpen
                  ? "border-neon text-neon shadow-[0_0_14px_rgba(0,229,255,0.35)]"
                  : "border-edge text-dim hover:border-neon/60 hover:text-neon"
              }`}
            >
              <SquareTerminal size={15} strokeWidth={1.75} />
            </button>

            {/* mobile menu toggle */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="flex h-9 w-9 items-center justify-center border border-edge text-dim transition-colors hover:border-neon/60 hover:text-neon md:hidden"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </nav>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 flex flex-col justify-center bg-obsidian/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col gap-2 px-8">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -18 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.06 * i, duration: 0.35 }}
                >
                  <button
                    onClick={() => goTo(item.href)}
                    className="font-display py-3 text-3xl font-bold tracking-tight text-bone transition-colors hover:text-neon"
                  >
                    <span className="label-mono-neon mr-4 align-middle">
                      0{i + 1}
                    </span>
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>
            <p className="label-mono pointer-events-none absolute bottom-8 left-8">
              {profile.status}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
