"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Github, Linkedin, Mail, Send, ArrowUp } from "lucide-react";
import { profile, contactSection, footer, sectionHeadings } from "@/data/profile";

const reveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

interface FormState {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const validate = (): Partial<FormState> => {
    const e: Partial<FormState> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your name (min 2 characters).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Please enter a valid email address.";
    if (form.message.trim().length < 10)
      e.message = "Tell me a little more (min 10 characters).";
    return e;
  };

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`Portfolio inquiry — ${form.name.trim() || "hello"}`);
    const body = encodeURIComponent(
      `${form.message.trim()}\n\n—\nFrom: ${form.name.trim()}\nReply-to: ${form.email.trim()}`
    );
    return `mailto:${profile.email}?subject=${subject}&body=${body}`;
  }, [form]);

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setSent(false);
    if (Object.keys(e).length === 0) {
      // No backend by design: hand the user a pre-filled email draft.
      window.location.href = mailtoHref;
      setSent(true);
    }
  };

  const field = (
    name: keyof FormState,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement> | React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    textarea = false
  ) => {
    const id = `contact-${name}`;
    const error = errors[name];
    const common = {
      id,
      name,
      "aria-invalid": !!error,
      "aria-describedby": error ? `${id}-error` : undefined,
      value: form[name],
      onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm((f) => ({ ...f, [name]: ev.target.value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
      },
      className: `w-full border bg-obsidian/60 px-4 py-3 font-technical text-[13px] text-bone placeholder:text-edge transition-colors focus:outline-none ${
        error ? "border-flux focus:border-flux" : "border-edge focus:border-neon"
      }`,
    };
    return (
      <div>
        <label htmlFor={id} className="label-mono mb-2 block text-[9px]">
          {label}
        </label>
        {textarea ? <textarea rows={5} {...(common as object)} {...props} /> : <input {...(common as object)} {...props} />}
        {error && (
          <p id={`${id}-error`} role="alert" className="mt-2 font-technical text-[11px] text-flux">
            {error}
          </p>
        )}
      </div>
    );
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative z-10 border-t border-edge bg-obsidian/90 backdrop-blur-[6px]"
    >
      {/* neon horizon tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 50% 100% at 20% 0%, rgba(255,45,149,0.08), transparent 70%), radial-gradient(ellipse 50% 100% at 80% 0%, rgba(0,229,255,0.08), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
        <motion.p {...reveal} transition={{ duration: 0.7 }} className="label-mono mb-4">
          TRANSMISSION / UPLINK — DISTRICT 06
        </motion.p>
        <motion.h2
          {...reveal}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="h-section max-w-4xl text-[clamp(2.1rem,5.5vw,4.5rem)] text-bone"
        >
          {sectionHeadings.contact.split("?")[0]}
          <span className="text-glow-neon text-neon">?</span>
        </motion.h2>
        <motion.p
          {...reveal}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mt-5 max-w-xl text-[15px] text-dim md:text-base"
        >
          {contactSection.support}
        </motion.p>

        <div className="mt-14 grid gap-12 md:grid-cols-12 md:gap-16">
          {/* channels */}
          <motion.div {...reveal} transition={{ duration: 0.8, delay: 0.12 }} className="space-y-3 md:col-span-5">
            {/* email */}
            <div className="border border-edge bg-midnight/40 p-5">
              <p className="label-mono mb-3 text-[9px]">EMAIL — DIRECT LINE</p>
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-2.5 font-technical text-[13px] text-bone transition-colors hover:text-neon"
                >
                  <Mail size={15} className="text-neon" aria-hidden />
                  {profile.email}
                </a>
                <button
                  onClick={copyEmail}
                  aria-label={copied ? "Email copied" : "Copy email address"}
                  className="ml-auto inline-flex items-center gap-1.5 border border-edge px-3 py-1.5 font-technical text-[9px] uppercase tracking-[0.2em] text-dim transition-colors hover:border-neon hover:text-neon"
                >
                  {copied ? <Check size={12} className="text-neon" /> : <Copy size={12} />}
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            </div>

            {/* github */}
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border border-edge bg-midnight/40 p-5 transition-all duration-300 hover:border-neon/60"
            >
              <div>
                <p className="label-mono mb-2 text-[9px]">GITHUB — SOURCE CODE</p>
                <p className="font-technical text-[13px] text-bone transition-colors group-hover:text-neon">
                  @{profile.githubUser}
                </p>
              </div>
              <Github size={18} className="text-dim transition-colors group-hover:text-neon" aria-hidden />
            </a>

            {/* linkedin */}
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between border border-edge bg-midnight/40 p-5 transition-all duration-300 hover:border-flux/60"
            >
              <div>
                <p className="label-mono mb-2 text-[9px]">LINKEDIN — PROFILE</p>
                <p className="font-technical text-[13px] text-bone transition-colors group-hover:text-flux">
                  shorya-khatter
                </p>
              </div>
              <Linkedin size={18} className="text-dim transition-colors group-hover:text-flux" aria-hidden />
            </a>
          </motion.div>

          {/* form */}
          <motion.form
            {...reveal}
            transition={{ duration: 0.8, delay: 0.16 }}
            onSubmit={onSubmit}
            noValidate
            className="border border-edge bg-midnight/40 p-6 md:col-span-7 md:p-8"
            aria-label="Contact form"
          >
            <p className="label-mono mb-6 text-[9px]">COMPOSE TRANSMISSION</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {field("name", "YOUR NAME", {
                type: "text",
                placeholder: "e.g. Ada Lovelace",
                autoComplete: "name",
              })}
              {field("email", "YOUR EMAIL", {
                type: "email",
                placeholder: "you@domain.com",
                autoComplete: "email",
              })}
            </div>
            <div className="mt-5">
              {field("message", "MESSAGE", {
                placeholder: "What are we building?",
              }, true)}
            </div>
            <button
              type="submit"
              className="mt-7 inline-flex items-center gap-2.5 bg-neon px-7 py-3.5 font-technical text-[11px] font-bold uppercase tracking-[0.22em] text-obsidian transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.45)]"
            >
              <Send size={13} />
              SEND TRANSMISSION
            </button>
            {sent && (
              <p role="status" className="mt-4 border border-neon/40 bg-neon/5 px-4 py-3 font-technical text-[11px] leading-relaxed text-neon">
                Draft ready — your email client just opened with the message pre-filled. Nothing was sent through a server.
              </p>
            )}
            <p className="mt-5 font-technical text-[10px] leading-relaxed text-dim/80">
              {contactSection.formNote}
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

/* ================= footer ================= */

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-edge bg-obsidian">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-5 px-5 py-8 md:flex-row md:px-10">
        <p className="label-mono text-[9px]">
          © {new Date().getFullYear()} SHORYA KHATTER — ALL SYSTEMS NOMINAL
        </p>
        <p className="font-technical text-[10px] uppercase tracking-[0.3em] text-bone">
          <span className="text-neon">◆</span> {footer.tagline}
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="group inline-flex items-center gap-2 border border-edge px-4 py-2.5 font-technical text-[9px] uppercase tracking-[0.24em] text-dim transition-colors hover:border-neon hover:text-neon"
        >
          BACK TO TOP
          <ArrowUp size={12} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </footer>
  );
}
