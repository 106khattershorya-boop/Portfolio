/**
 * ============================================================
 *  NEON NOIR — CENTRAL CONTENT CONFIGURATION
 *  Edit everything about the site from this single file.
 *  Verified facts only: no invented metrics, jobs, awards or URLs.
 * ============================================================
 */

export const profile = {
  name: "Shorya Khatter",
  shortName: "SK.",
  logo: "SHORYA//",
  role: "Full-Stack Developer × Generative AI",
  tagline: "Building digital products. Exploring intelligence.",
  description:
    "I'm a CSE student at MAIT interested in building modern web applications and exploring the possibilities of Generative AI, applied ML, and RAG.",
  email: "106khatter.shorya@gmail.com",
  github: "https://github.com/106khattershorya-boop",
  githubUser: "106khattershorya-boop",
  linkedin: "https://www.linkedin.com/in/shorya-khatter-56a2b1312",
  status: "SYSTEM ONLINE / EXPLORING AI",
} as const;

export const navItems = [
  { label: "HOME", href: "#home" },
  { label: "PROJECTS", href: "#projects" },
  { label: "ABOUT", href: "#about" },
  { label: "TECH STACK", href: "#stack" },
  { label: "CONTACT", href: "#contact" },
] as const;

export const hero = {
  status: "SYSTEM ONLINE / EXPLORING AI",
  primaryCta: "EXPLORE MY WORK",
  secondaryCta: "GET IN TOUCH",
  // Decorative technical labels (visual design elements, not claims)
  coords: [
    "LAT 48.8584 — LON 2.2945",
    "DISTRICT // NOIR-07",
    "SEQ 330M — TOWER LOCK",
  ],
} as const;

export interface ProjectLink {
  github: string | null; // exact repo URL, null → falls back to GitHub profile
  live: string | null;
}

export interface Project {
  id: string;
  index: string; // "01"
  name: string;
  repoName: string | null; // actual repository name on GitHub, if any
  category: string;
  description: string;
  overview: string;
  problem: string;
  stack: string[];
  /** Module names verified from the public repository (file-level evidence) */
  verifiedModules?: string[];
  verifiedNote?: string;
  links: ProjectLink;
  visual: "packsure" | "oiltrace" | "syncfit";
}

export const projects: Project[] = [
  {
    id: "syncfit",
    index: "01",
    name: "SyncFit",
    repoName: "SyncFit",
    category: "Full-Stack Web Development",
    description:
      "A full-stack gym session booking platform — member booking flows with waitlists, and admin session management.",
    overview:
      "SyncFit is a full-stack booking platform for gym sessions. Members register and browse upcoming sessions with activity and date filters, book or cancel spots subject to per-session capacity, and can join a waitlist that automatically promotes them when a spot opens. An admin role handles session creation and member check-ins, and a mock payment step (card, UPI, or cash at the gym) sits between booking and confirmation. Built with React on the front end and a FastAPI + MongoDB (PyMongo) backend, using MongoDB transactions for data consistency.",
    problem:
      "Fitness studios need a straightforward way for members to discover, book and manage sessions while staff keep schedules and capacity under control. SyncFit explores that workflow end to end — including the edge cases that make it interesting, like waitlist promotion and atomic capacity updates.",
    stack: ["React", "FastAPI", "MongoDB"],
    verifiedModules: [
      "backend/app/ — FastAPI service (Python + PyMongo)",
      "backend/pyproject.toml — Python project configuration",
      "frontend/ — React front end",
    ],
    verifiedNote:
      "Repository structure and README reviewed from the public SyncFit repository (github.com/106khattershorya-boop/SyncFit). Features listed reflect the project's own README; no deployment, accuracy or user-metrics claims are made.",
    links: {
      github: "https://github.com/106khattershorya-boop/SyncFit",
      live: null,
    },
    visual: "syncfit",
  },
];

export interface StackGroup {
  label: string;
  kind: "uses" | "exploring";
  items: { name: string; icon: string }[];
}

export const stackGroups: StackGroup[] = [
  {
    label: "FRONTEND",
    kind: "uses",
    items: [
      { name: "React", icon: "atom" },
      { name: "JavaScript", icon: "braces" },
    ],
  },
  {
    label: "BACKEND",
    kind: "uses",
    items: [
      { name: "Python", icon: "filecode" },
      { name: "FastAPI", icon: "zap" },
    ],
  },
  {
    label: "DATA",
    kind: "uses",
    items: [
      { name: "MongoDB", icon: "database" },
      { name: "SQL", icon: "table" },
    ],
  },
  {
    label: "PROGRAMMING",
    kind: "uses",
    items: [{ name: "C++", icon: "binary" }],
  },
  {
    label: "TOOLS",
    kind: "uses",
    items: [
      { name: "Git", icon: "gitbranch" },
      { name: "GitHub", icon: "github" },
    ],
  },
];

export const explorations = [
  { name: "Applied Machine Learning", icon: "brain" },
  { name: "Generative AI", icon: "sparkles" },
  { name: "RAG", icon: "filesearch" },
  { name: "LLMs", icon: "messages" },
];

export const principles = [
  {
    index: "P—01",
    title: "BUILD TO UNDERSTAND",
    line: "Every project is a question about how systems actually work.",
  },
  {
    index: "P—02",
    title: "EXPERIMENT WITH PURPOSE",
    line: "Exploration is only useful when it ships into something real.",
  },
  {
    index: "P—03",
    title: "MAKE TECHNOLOGY USEFUL",
    line: "Intelligence matters when it solves a problem someone has.",
  },
] as const;

export const education = {
  school: "Maharaja Agrasen Institute of Technology",
  degree: "B.Tech — Computer Science and Engineering",
  standing: "Sophomore",
  note: "Current standing. No dates, grades or coursework published.",
} as const;

export const aboutSection = {
  heading: "THE PERSON BEHIND THE PIXELS.",
  body: "I'm Shorya Khatter, a B.Tech Computer Science student at MAIT. I enjoy building full-stack applications, understanding how systems work, and exploring how Generative AI can make software more useful. I'm currently interested in applied ML, RAG, and LLM-powered products.",
} as const;

export const contactSection = {
  heading: "HAVE SOMETHING INTERESTING IN MIND?",
  support:
    "Have an idea, a project to discuss, or something interesting to build? Let's connect.",
  formNote:
    "This form opens your email client with a pre-filled draft — nothing is sent through a server. No backend is configured, by design.",
} as const;

export const footer = {
  tagline: "DESIGNED THROUGH CURIOSITY. BUILT WITH CODE.",
} as const;

export const sectionHeadings = {
  projects: "SELECTED PROJECTS / 01",
  projectsSub: "Experiments, systems, and products built through code.",
  stack: "TOOLS OF THE TRADE.",
  contact: "HAVE SOMETHING INTERESTING IN MIND?",
} as const;
