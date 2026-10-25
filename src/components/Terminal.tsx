"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { profile, projects, education } from "@/data/profile";

interface Line {
  id: number;
  kind: "in" | "out" | "sys" | "err";
  text: string;
  accent?: "cyan" | "magenta" | "gold";
}

let lineId = 0;
const nid = () => ++lineId;

const BANNER: Line[] = [
  { id: nid(), kind: "sys", text: "NEON-NOIR TERMINAL v2.7 — guest session", accent: "cyan" },
  { id: nid(), kind: "out", text: "Type 'help' for available commands." },
];

export default function Terminal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [lines, setLines] = useState<Line[]>(BANNER);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIndex, setHistIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const push = useCallback((l: Omit<Line, "id">[]) => {
    setLines((prev) => [...prev, ...l.map((x) => ({ ...x, id: nid() }))]);
  }, []);

  // focus + scroll management
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Escape closes the terminal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, open]);

  const run = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase();
      if (!cmd) return;
      push([{ kind: "in", text: raw }]);

      switch (cmd) {
        case "help":
          push([
            { kind: "out", text: "AVAILABLE COMMANDS", accent: "cyan" },
            { kind: "out", text: "  about      — who is Shorya Khatter" },
            { kind: "out", text: "  projects   — list featured projects" },
            { kind: "out", text: "  skills     — technologies & AI interests" },
            { kind: "out", text: "  github     — open GitHub profile" },
            { kind: "out", text: "  linkedin   — open LinkedIn profile" },
            { kind: "out", text: "  contact    — show email address" },
            { kind: "out", text: "  education  — current studies" },
            { kind: "out", text: "  clear      — clear terminal output" },
          ]);
          break;

        case "about":
          push([
            { kind: "out", text: profile.name.toUpperCase(), accent: "gold" },
            { kind: "out", text: profile.role },
            { kind: "out", text: "B.Tech CSE @ MAIT — sophomore." },
            { kind: "out", text: "Building modern web apps and exploring Generative AI, applied ML and RAG." },
          ]);
          break;

        case "projects":
          push([
            { kind: "out", text: "FEATURED PROJECTS", accent: "cyan" },
            ...projects.map((p) => ({
              kind: "out" as const,
              text: `  [${p.index}] ${p.name} — ${p.category}`,
              accent: undefined,
            })),
            { kind: "out", text: "Scroll to PROJECTS on the page for details." },
          ]);
          break;

        case "skills":
          push([
            { kind: "out", text: "STACK — React, JavaScript, Python, FastAPI, MongoDB, SQL, C++, Git, GitHub", accent: "cyan" },
            { kind: "out", text: "EXPLORING — Applied ML, Generative AI, RAG, LLMs", accent: "magenta" },
          ]);
          break;

        case "github":
          push([{ kind: "sys", text: "Opening GitHub profile…", accent: "cyan" }]);
          window.open(profile.github, "_blank", "noopener,noreferrer");
          break;

        case "linkedin":
          push([{ kind: "sys", text: "Opening LinkedIn profile…", accent: "cyan" }]);
          window.open(profile.linkedin, "_blank", "noopener,noreferrer");
          break;

        case "contact":
          push([
            { kind: "out", text: "EMAIL → " + profile.email, accent: "gold" },
            { kind: "out", text: "Form available in the CONTACT section." },
          ]);
          break;

        case "education":
          push([
            { kind: "out", text: education.school, accent: "gold" },
            { kind: "out", text: education.degree },
            { kind: "out", text: "Standing: " + education.standing },
          ]);
          break;

        case "clear":
          setLines([]);
          break;

        default:
          push([
            {
              kind: "err",
              text: `command not found: ${cmd} — type 'help'`,
            },
          ]);
      }
    },
    [push]
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const v = value;
      if (v.trim()) {
        setHistory((h) => [v.trim(), ...h]);
        setHistIndex(-1);
      }
      setValue("");
      run(v);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length) {
        const next = Math.min(histIndex + 1, history.length - 1);
        setHistIndex(next);
        setValue(history[next]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIndex - 1;
      setHistIndex(next);
      setValue(next >= 0 ? history[next] : "");
    }
  };

  const colorFor = (l: Line) => {
    if (l.kind === "in") return "text-bone";
    if (l.kind === "err") return "text-flux";
    if (l.kind === "sys") return "text-dim";
    if (l.accent === "cyan") return "text-neon";
    if (l.accent === "magenta") return "text-flux";
    if (l.accent === "gold") return "text-aurum";
    return "text-dim";
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-label="Interactive terminal"
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 28, scale: 0.98 }}
          transition={{ type: "spring", damping: 26, stiffness: 260 }}
          className="fixed bottom-4 right-4 z-50 w-[min(560px,calc(100vw-2rem))] border border-edge bg-midnight/95 shadow-[0_0_60px_rgba(0,229,255,0.07)] backdrop-blur-xl"
        >
          {/* title bar */}
          <div className="flex items-center justify-between border-b border-edge px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-flux/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-aurum/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-neon/80" />
              <span className="label-mono ml-3">SHORYA@NEON-NOIR:~$</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Close terminal"
              className="text-dim transition-colors hover:text-bone"
            >
              <X size={15} />
            </button>
          </div>

          {/* output */}
          <div
            ref={scrollRef}
            className="max-h-[46vh] min-h-[180px] overflow-y-auto px-4 py-3 font-technical text-[12px] leading-relaxed"
            aria-live="polite"
          >
            {lines.map((l) => (
              <p key={l.id} className={colorFor(l)}>
                {l.kind === "in" ? (
                  <>
                    <span className="text-neon">➜ </span>
                    {l.text}
                  </>
                ) : (
                  l.text
                )}
              </p>
            ))}
          </div>

          {/* input */}
          <div className="flex items-center gap-2 border-t border-edge px-4 py-3">
            <label htmlFor="terminal-input" className="font-technical text-[12px] text-neon">
              ➜
            </label>
            <span className="sr-only" id="terminal-input-label">
              Terminal command input
            </span>
            <input
              id="terminal-input"
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              spellCheck={false}
              aria-labelledby="terminal-input-label"
              className="w-full bg-transparent font-technical text-[12px] text-bone caret-neon outline-none placeholder:text-edge"
              placeholder="type a command…"
            />
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
