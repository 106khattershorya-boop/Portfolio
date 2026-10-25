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
    id: "packsure",
    index: "01",
    name: "CodeFlux PackSure AI",
    repoName: "CodeFlux",
    category: "AI / Legal Metrology",
    description:
      "A project focused on applying AI to packaged-commodity compliance and Legal Metrology requirements.",
    overview:
      "PackSure AI is a compliance-inspection pipeline for packaged commodities. An OCR layer extracts printed declarations from package labels, a rule engine evaluates the extracted fields against Legal Metrology rule sets, and results are stored for review through a web interface with an integrated assistant chatbot.",
    problem:
      "Checking packaged-commodity labels against Legal Metrology requirements is largely manual, repetitive and error-prone. The project explores automating the extraction and rule-checking steps so inspection workflows become faster and more consistent.",
    stack: ["React", "JavaScript", "Python", "OCR", "SQL"],
    verifiedModules: [
      "extractor.py / preprocess.py / crop.py — OCR label-extraction pipeline",
      "compliance.py + rules.json — rule engine for compliance checks",
      "db_integration.py + sih_schema.sql — SQL result persistence",
      "chatbot.py — assistant component",
      "api.py — Python backend interface",
      "React (Vite) front end in src/",
    ],
    verifiedNote:
      "Capabilities above are inferred from the public repository structure of CodeFlux (SIH 2026 project). No accuracy metrics or deployment claims are made.",
    links: {
      github: "https://github.com/106khattershorya-boop/CodeFlux",
      live: null,
    },
    visual: "packsure",
  },
  {
    id: "oiltrace",
    index: "02",
    name: "Oiltrace",
    repoName: "Oiltrace",
    category: "Environmental Technology / Backend Engineering",
    description:
      "A backend-focused project exploring an oil-spill-related problem through software.",
    overview:
      "Oiltrace is an ML pipeline exploring oil-spill detection from imagery together with vessel-behaviour analysis. It includes a U-Net segmentation model with training and dataset tooling, spectral-analysis and spill-detection modules, and AIS vessel-data integration feeding a behaviour-analysis layer, exposed through a Python API.",
    problem:
      "Detecting and monitoring oil spills early — and understanding vessel behaviour around them — is difficult at sea scale. The project experiments with segmentation-based detection on imagery and AIS-derived movement signals as complementary data sources.",
    stack: ["Python", "U-Net", "Computer Vision", "AIS Data", "JavaScript"],
    verifiedModules: [
      "unet.py / train.py / dataset.py — segmentation model + training pipeline",
      "spill_detection.py / spectral_analysis.py — detection & spectral modules",
      "ais_integration.py / behaviour_analysis.py / detect_loitering.py — vessel signals",
      "ml_pipeline.py — pipeline orchestration",
      "api.py — Python backend interface",
    ],
    verifiedNote:
      "Modules above are verified from the public Oiltrace repository structure (SIH 2026 project — 2). No detection-accuracy or live-monitoring claims are made.",
    links: {
      github: "https://github.com/106khattershorya-boop/Oiltrace",
      live: null,
    },
    visual: "oiltrace",
  },
  {
    id: "syncfit",
    index: "03",
    name: "SyncFit",
    repoName: null, // TODO: set to the exact repository URL when public
    category: "Full-Stack Web Development",
    description:
      "A full-stack fitness session booking platform with member-facing booking workflows and administrative functionality.",
    overview:
      "SyncFit is a full-stack booking platform for fitness sessions. Members browse sessions and manage bookings through member-facing workflows, while an administrative side handles session and schedule management. Built with React on the front end and a FastAPI + MongoDB backend.",
    problem:
      "Fitness studios need a straightforward way for members to discover, book and manage sessions while staff keep schedules and capacity under control — SyncFit explores that workflow end to end.",
    stack: ["React", "FastAPI", "MongoDB"],
    verifiedNote:
      "Repository link is pending — the GitHub action currently points to the profile. Edit src/data/profile.ts to attach the exact repository when public.",
    links: {
      github: null, // falls back to GitHub profile — do not invent a URL
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
  projects: "SELECTED PROJECTS / 01—03",
  projectsSub: "Experiments, systems, and products built through code.",
  stack: "TOOLS OF THE TRADE.",
  contact: "HAVE SOMETHING INTERESTING IN MIND?",
} as const;
