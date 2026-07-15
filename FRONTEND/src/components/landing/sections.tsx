// @ts-nocheck
import { Fragment } from "react";
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
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  KeyRound,
  Paperclip,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

// ---------- shared bits ----------

const ACCENTS = [
  "from-[var(--brand)] to-[var(--brand-2)]",
  "from-[var(--brand-2)] to-[var(--cyan)]",
  "from-[var(--cyan)] to-[var(--amber)]",
  "from-[var(--amber)] to-[var(--pink)]",
  "from-[var(--pink)] to-[var(--brand)]",
  "from-[var(--brand)] to-[var(--cyan)]",
];

function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--brand)] opacity-75 animate-ping" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
      </span>
      {children}
    </span>
  );
}

function SectionHeader({ label, title, gradient }) {
  const [head, tail] = title;
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <SectionLabel>{label}</SectionLabel>
      </Reveal>
      <Reveal delay={0.05}>
        <h2 className="mt-6 font-display text-4xl font-semibold sm:text-5xl">
          {head} <span className={gradient || "text-gradient"}>{tail}</span>
        </h2>
      </Reveal>
    </div>
  );
}

// ---------- data ----------

const capabilities = [
  { icon: Shield, title: "JWT Authentication", desc: "Secure account access with email verification, login, refresh tokens, logout, and password reset support." },
  { icon: KeyRound, title: "Role-Based Access Control", desc: "Admin, Project Admin, and Member permissions control project, task, note, and membership operations." },
  { icon: FolderKanban, title: "Project Management", desc: "Admins can create, update, delete, and view projects with project-specific members and ownership rules." },
  { icon: ClipboardList, title: "Tasks and Subtasks", desc: "Projects contain tasks with todo, in_progress, and done statuses, plus subtasks that members can update." },
  { icon: FileText, title: "Project Notes", desc: "Admins manage notes while Project Admins and Members can view project notes within their allowed projects." },
  { icon: Paperclip, title: "File Attachments", desc: "Tasks support multiple uploads with file URL, MIME type, and size metadata stored for each attachment." },
];

const roles = [
  { name: "Admin", desc: "Full system access across projects, users, notes, tasks, subtasks, members, and attachments.", perms: ["Manage projects", "Manage members", "Manage notes", "Manage all tasks"] },
  { name: "Project Admin", desc: "Project-level control for assigned projects with task and subtask management permissions.", perms: ["View project", "Manage tasks", "Manage subtasks", "View notes and members"] },
  { name: "Member", desc: "Project participation access focused on viewing assigned project information and updating subtask progress.", perms: ["View project", "View tasks", "View notes", "Update subtask status"] },
];

const flow = ["Authenticate", "Create project", "Assign members", "Manage tasks", "Update subtasks", "Attach files"];

const faqs = [
  { q: "How does authentication work?", a: "Project Camp uses JWT-based authentication with access and refresh tokens. Registration includes email verification, and password reset uses time-limited reset tokens." },
  { q: "Which roles are supported?", a: "The PRD defines exactly three roles: Admin, Project Admin, and Member. Each role has different access to projects, members, tasks, subtasks, notes, and attachments." },
  { q: "How are projects managed?", a: "Admins can create, update, delete, and view projects. Project membership controls which users can access project data." },
  { q: "How are tasks and subtasks organized?", a: "Each task belongs to a project and uses todo, in_progress, or done status. Tasks can contain subtasks, and members can update subtask completion status." },
  { q: "Can files be attached to tasks?", a: "Yes. Task attachments are uploaded with Multer and stored with their URL, MIME type, and file size metadata." },
  { q: "Who can manage project notes?", a: "Admins can create, update, and delete project notes. Project Admins and Members can view notes for projects they can access." },
];

// ---------- sections ----------

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 md:pt-44 md:pb-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[var(--brand)]/25 blur-[130px] animate-pulse-glow" />
        <div className="absolute left-[10%] top-40 h-[320px] w-[420px] rounded-full bg-[var(--brand-2)]/25 blur-[120px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute right-[8%] top-24 h-[300px] w-[380px] rounded-full bg-[var(--cyan)]/25 blur-[110px] animate-pulse-glow" style={{ animationDelay: "3s" }} />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-6 text-center">
        <Reveal><SectionLabel>Project Camp Backend</SectionLabel></Reveal>
        <Reveal delay={0.05}>
          <h1 className="mt-8 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[5.5rem]">
            <span className="block text-foreground">Role-based</span>
            <span className="block text-gradient animate-gradient">project management</span>
            <span className="block text-foreground">backend.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed">
            A backend system for authenticated project workspaces with Admin,
            Project Admin, and Member access across projects, tasks, subtasks,
            notes, members, and file attachments.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[var(--cyan)]" />
            <span className="uppercase tracking-[0.2em]">Built to the PRD spec</span>
            <Sparkles className="h-3.5 w-3.5 text-[var(--pink)]" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Capabilities() {
  return (
    <section id="capabilities" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader label="PRD Scope" title={["Backend features", "defined in the PRD."]} />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 3) * 0.06}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="card-vibrant group relative h-full overflow-hidden rounded-2xl p-6"
              >
                <div className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${ACCENTS[i]} opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40`} />
                <div className={`relative grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${ACCENTS[i]} shadow-lg`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{desc}</p>
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
    <section id="access" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader label="Access Control" title={["Three roles,", "clearly separated."]} gradient="text-gradient-warm" />
        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {roles.map((role, i) => (
            <Reveal key={role.name} delay={i * 0.06}>
              <motion.div whileHover={{ y: -6 }} className="card-vibrant group relative h-full overflow-hidden rounded-2xl p-7">
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ACCENTS[i]}`} />
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[i]} shadow-lg`}>
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{role.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{role.desc}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {role.perms.map((perm) => (
                    <Badge key={perm} variant="outline" className="border-white/15 bg-white/5 text-[11px] font-medium text-muted-foreground backdrop-blur">
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
    <section className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader label="Backend Flow" title={["Core workflow", "only."]} />
        <div className="mt-16 grid gap-4 md:grid-cols-[repeat(3,1fr_auto)_1fr] lg:grid-cols-[repeat(6,1fr_auto)_1fr] md:items-stretch">
          {flow.map((step, i) => (
            <Fragment key={step}>
              <Reveal delay={i * 0.04} className="md:col-span-1">
                <div className="card-vibrant h-full rounded-2xl p-5 text-center">
                  <div className={`mx-auto grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br ${ACCENTS[i]} text-sm font-bold text-white shadow-lg`}>
                    {i + 1}
                  </div>
                  <div className="mt-4 text-sm font-semibold tracking-tight">{step}</div>
                </div>
              </Reveal>
              {i < flow.length - 1 && (
                <div
                  className={`hidden items-center justify-center text-muted-foreground/60 ${i === 2 ? "md:hidden lg:flex" : "md:flex"}`}
                  aria-hidden="true"
                >
                  <ArrowRight className="h-5 w-5" />
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
    <section id="faq" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeader label="FAQ" title={["PRD-specific", "answers."]} />
        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-12 space-y-3">
            {faqs.map((item, i) => (
              <AccordionItem key={item.q} value={`i-${i}`} className="card-vibrant overflow-hidden rounded-2xl border-0 px-5">
                <AccordionTrigger className="text-left font-display text-base font-medium hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
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
    <footer className="relative mt-16 border-t border-white/10">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--brand)]/50 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-muted-foreground sm:flex-row">
        <div className="font-display text-base font-semibold text-gradient">Project Camp Backend</div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-[var(--cyan)]" />
          <span>Built to match the Project Camp PRD scope.</span>
        </div>
      </div>
    </footer>
  );
}
