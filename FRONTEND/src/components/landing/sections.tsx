import { Fragment, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  FolderKanban,
  HelpCircle,
  KeyRound,
  LayoutGrid,
  Paperclip,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from "lucide-react";

// ---------- shared bits ----------

// Restrained accent set — blue-forward, no rainbow.
const ACCENTS = [
  "from-[var(--brand)] to-[var(--brand-2)]",
  "from-[var(--brand-2)] to-[var(--navy)]",
  "from-[var(--brand)] to-[var(--cyan)]",
  "from-[var(--charcoal)] to-[var(--navy)]",
  "from-[var(--brand)] to-[var(--brand-2)]",
  "from-[var(--cyan)] to-[var(--brand)]",
];

function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  children,
  icon: Icon,
  tone = "light",
}: {
  children: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "light" | "dark";
}) {
  const cls =
    tone === "dark"
      ? "border-white/15 bg-white/10 text-white/80"
      : "border-border bg-card text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border ${cls} px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]`}
    >
      {Icon ? (
        <Icon className="h-3.5 w-3.5 text-[var(--brand)]" />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
      )}
      {children}
    </span>
  );
}

function SectionHeader({
  label,
  title,
  icon,
  gradient,
}: {
  label: string;
  title: [string, string];
  icon?: React.ComponentType<{ className?: string }>;
  gradient?: string;
}) {
  const [head, tail] = title;
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <SectionLabel icon={icon}>{label}</SectionLabel>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">
          {head} <span className={gradient || "text-gradient"}>{tail}</span>
        </h2>
      </Reveal>
    </div>
  );
}

// ---------- data ----------

const capabilities = [
  {
    icon: Shield,
    title: "JWT Authentication",
    desc: "Secure account access with email verification, login, refresh tokens and logout.",
  },
  {
    icon: KeyRound,
    title: "Role-Based Access Control",
    desc: "Admin, Project Admin, and Member permissions control project, task, note, and membership operations.",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    desc: "Admins can create, update, delete, and view projects with project-specific members and ownership rules.",
  },
  {
    icon: ClipboardList,
    title: "Tasks and Subtasks",
    desc: "Projects contain tasks with todo, in_progress, and done statuses, plus subtasks that members can update.",
  },
  {
    icon: FileText,
    title: "Project Notes",
    desc: "Admins,project admin as well as team members can add notes in the project.",
  },
  {
    icon: Paperclip,
    title: "File Attachments",
    desc: "Tasks support multiple uploads with file URL, MIME type, and size metadata stored for each attachment.",
  },
];

const roles = [
  {
    name: "Admin",
    desc: "Full system access across projects, users, notes, tasks, subtasks, members, and attachments.",
    perms: ["Manage projects", "Manage members", "Manage notes", "Manage all tasks"],
  },
  {
    name: "Project Admin",
    desc: "Project-level control for assigned projects with task and subtask management permissions.",
    perms: ["View project", "Manage tasks", "Manage subtasks", "View notes and members"],
  },
  {
    name: "Member",
    desc: "Project participation access focused on viewing assigned project information and updating subtask progress.",
    perms: ["View project", "View tasks", "View notes", "Update subtask status"],
  },
];

const flow = [
  "Authenticate",
  "Create project",
  "Assign members",
  "Manage tasks",
  "Update subtasks",
  "Attach files",
];

const faqs = [
  {
    q: "How does authentication work?",
    a: "Project Camp uses JWT-based authentication with access and refresh tokens. Registration includes email verification, and password reset uses time-limited reset tokens.",
  },
  {
    q: "Which roles are supported?",
    a: "The PRD defines exactly three roles: Admin, Project Admin, and Member. Each role has different access to projects, members, tasks, subtasks, notes, and attachments.",
  },
  {
    q: "How are projects managed?",
    a: "Admins can create, update, delete, and view projects. Project membership controls which users can access project data.",
  },
  {
    q: "How are tasks and subtasks organized?",
    a: "Each task belongs to a project and uses todo, in_progress, or done status. Tasks can contain subtasks, and members can update subtask completion status.",
  },
  {
    q: "Can files be attached to tasks?",
    a: "Yes. Task attachments are uploaded with Multer and stored with their URL, MIME type, and file size metadata.",
  },
  {
    q: "Who can manage project notes?",
    a: "Admins can create, update, and delete project notes. Project Admins and Members can view notes for projects they can access.",
  },
];

// ---------- sections ----------

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Layer 1: deep aurora canvas */}
      <div
        aria-hidden
        className="absolute inset-0 -z-30"
        style={{
          background:
            "radial-gradient(1200px 600px at 15% -10%, rgba(59,130,246,0.45), transparent 60%)," +
            "radial-gradient(1000px 600px at 90% 0%, rgba(139,92,246,0.30), transparent 65%)," +
            "radial-gradient(900px 700px at 50% 110%, rgba(34,211,238,0.22), transparent 60%)," +
            "linear-gradient(180deg, #05070d 0%, #0a0f1f 45%, #070b17 100%)",
        }}
      />
      {/* Layer 2: animated conic aurora glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 opacity-60 mix-blend-screen animate-aurora"
        style={{
          background:
            "conic-gradient(from 120deg at 50% 40%, rgba(37,99,235,0.35), rgba(14,165,233,0.15), rgba(139,92,246,0.28), rgba(37,99,235,0.35))",
          filter: "blur(80px)",
        }}
      />
      {/* Layer 3: geometric grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.09]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 78%)",
        }}
      />
      {/* Layer 4: film grain */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.35 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      {/* Bottom hairline */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-6 pt-32 pb-24 text-center md:pt-40 md:pb-28">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-md shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_30px_-10px_rgba(59,130,246,0.5)]">
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            Built for productive teams
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-7 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-[0_2px_30px_rgba(59,130,246,0.25)]">
            <span className="block animate-fade-up">Project</span>
            <span
              className="mt-1 block bg-clip-text text-transparent animate-fade-up animate-gradient-shift"
              style={{
                backgroundImage:
                  "linear-gradient(110deg, #ffffff 0%, #bfdbfe 25%, #60a5fa 50%, #a78bfa 75%, #ffffff 100%)",
                backgroundSize: "220% 100%",
                animationDelay: "0.15s",
              }}
            >
              BASECAMP
            </span>
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Organize projects, assign tasks, manage members, share files, and track progress -
            all in one secure workspace with clean role-based access control.
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/register"
              className="group inline-flex items-center gap-2 rounded-lg bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(59,130,246,0.7)] ring-1 ring-white/10 transition-all hover:bg-blue-500 hover:shadow-[0_14px_50px_-8px_rgba(59,130,246,0.85)] hover:-translate-y-0.5"
            >
              Get started for free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#capabilities"
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/[0.12] hover:border-white/30"
            >
              See features
            </a>
          </div>
        </Reveal>
        <Reveal delay={0.28}>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" /> JWT + refresh tokens
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cyan-300" /> RBAC across 3 roles
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Paperclip className="h-3.5 w-3.5 text-cyan-300" /> Task attachments
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Capabilities() {
  return (
    <section id="capabilities" className="relative section-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          label="Features"
          icon={LayoutGrid}
          title={["Everything your", "team needs"]}
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.05}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="card-vibrant group relative h-full overflow-hidden p-6"
              >
                <div
                  className={`inline-grid h-11 w-11 place-items-center rounded-lg bg-gradient-to-br ${ACCENTS[i]} shadow-sm`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-5 font-display text-base font-semibold tracking-tight">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoleMatrix() {
  return (
    <section id="access" className="relative section-tint py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          label="Access Control"
          icon={ShieldCheck}
          title={["Three roles,", "clearly separated."]}
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {roles.map((role, i) => (
            <Reveal key={role.name} delay={i * 0.05}>
              <motion.div
                whileHover={{ y: -3 }}
                className="card-vibrant group relative h-full overflow-hidden p-6"
              >
                <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${ACCENTS[i]}`} />
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${ACCENTS[i]} shadow-sm`}
                >
                  <Users className="h-4.5 w-4.5 text-white" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">
                  {role.name}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{role.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {role.perms.map((perm) => (
                    <Badge
                      key={perm}
                      variant="outline"
                      className="border-border bg-secondary text-[11px] font-medium text-muted-foreground"
                    >
                      {perm}
                    </Badge>
                  ))}
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DataFlow() {
  return (
    <section className="relative section-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader label="Backend Flow" icon={Workflow} title={["Core workflow,", "end to end."]} />
        <div className="mt-12 grid gap-3 md:grid-cols-[repeat(3,1fr_auto)_1fr] lg:grid-cols-[repeat(6,1fr_auto)_1fr] md:items-stretch">
          {flow.map((step, i) => (
            <Fragment key={step}>
              <Reveal delay={i * 0.04} className="md:col-span-1">
                <div className="card-vibrant h-full p-4 text-center">
                  <div
                    className={`mx-auto grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${ACCENTS[i]} text-sm font-bold text-white shadow-sm`}
                  >
                    {i + 1}
                  </div>
                  <div className="mt-3 text-sm font-semibold tracking-tight">{step}</div>
                </div>
              </Reveal>
              {i < flow.length - 1 && (
                <div
                  className={`hidden items-center justify-center text-muted-foreground/60 ${i === 2 ? "md:hidden lg:flex" : "md:flex"}`}
                  aria-hidden="true"
                >
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative section-tint py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader label="FAQ" icon={HelpCircle} title={["Got", "questions?"]} />
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-10 space-y-2.5">
            {faqs.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`i-${i}`}
                className="card-vibrant overflow-hidden border px-5"
              >
                <AccordionTrigger className="text-left font-display text-base font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-[color:var(--navy)] text-white/70">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm sm:flex-row">
        <div className="font-display text-base font-semibold text-white">Project Basecamp</div>
        <div className="flex items-center gap-2">
          <span>© Built with ❤️ by Ishika</span>
        </div>
      </div>
    </footer>
  );
}
