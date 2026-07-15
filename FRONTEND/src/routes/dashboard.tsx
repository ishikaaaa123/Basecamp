import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FolderKanban,
  ClipboardList,
  FileText,
  Users,
  LogOut,
  Plus,
  ServerCog,
  Sparkles,
  CheckCircle2,
  Circle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import {
  isAuthenticated,
  logout,
  getCurrentUser,
  listProjects,
  createProject,
  listProjectTasks,
  listProjectNotes,
  getApiError,
  type Project,
  type Task,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Project Camp" },
      { name: "description", content: "Your projects, tasks, and notes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  // Confirm the token with the backend so stale or unverified sessions never render the dashboard.
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
      return;
    }

    let active = true;
    void getCurrentUser()
      .then(() => {
        if (active) setReady(true);
      })
      .catch(async () => {
        await logout();
        if (active) navigate({ to: "/login" });
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <DashboardShell />;
}

function DashboardShell() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const userQ = useQuery({ queryKey: ["me"], queryFn: getCurrentUser, retry: false });
  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: listProjects, retry: false });

  useEffect(() => {
    if (projectsQ.data && projectsQ.data.length > 0 && !selectedId) {
      setSelectedId(projectsQ.data[0]._id);
    }
  }, [projectsQ.data, selectedId]);

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await logout();
    navigate({ to: "/login", replace: true });
  }

  const projects = projectsQ.data ?? [];
  const selected = projects.find((p) => p._id === selectedId) ?? null;
  const user = userQ.data as { username?: string; email?: string; fullName?: string } | undefined;

  return (
    <div className="min-h-screen">
      <DashboardNav user={user} onSignOut={handleSignOut} />

      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <WelcomeHeader user={user} projects={projects} />

        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <ProjectsColumn
            projects={projects}
            loading={projectsQ.isLoading}
            error={projectsQ.error ? getApiError(projectsQ.error) : null}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <ProjectDetail project={selected} />
        </div>
      </main>
    </div>
  );
}

function DashboardNav({
  user,
  onSignOut,
}: {
  user?: { username?: string; email?: string; fullName?: string };
  onSignOut: () => void;
}) {
  const initial = (user?.fullName || user?.username || user?.email || "U")
    .slice(0, 1)
    .toUpperCase();
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/60 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[var(--brand)] via-[var(--brand-2)] to-[var(--cyan)] shadow-lg shadow-[var(--brand)]/30">
            <ServerCog className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">Project Camp</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5 text-xs text-muted-foreground sm:flex">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-[11px] font-semibold text-white">
              {initial}
            </span>
            <span className="text-foreground">
              {user?.fullName || user?.username || user?.email || "Signed in"}
            </span>
          </div>
          <button
            onClick={onSignOut}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/80 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </nav>
    </motion.header>
  );
}

function WelcomeHeader({
  user,
  projects,
}: {
  user?: { username?: string; fullName?: string };
  projects: Project[];
}) {
  const name = user?.fullName?.split(" ")[0] || user?.username || "there";
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-wrap items-end justify-between gap-6"
    >
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-[var(--cyan)]" />
          Workspace
        </div>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Welcome back, <span className="text-gradient">{name}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {projects.length === 0
            ? "You don't have any projects yet. Create one to get started."
            : `You have ${projects.length} project${projects.length === 1 ? "" : "s"} in your workspace.`}
        </p>
      </div>
      <StatsBar total={projects.length} />
    </motion.div>
  );
}

function StatsBar({ total }: { total: number }) {
  const stats = [
    {
      label: "Projects",
      value: total,
      icon: FolderKanban,
      tint: "from-[var(--brand)] to-[var(--brand-2)]",
    },
    { label: "Roles", value: 3, icon: Users, tint: "from-[var(--brand-2)] to-[var(--cyan)]" },
    {
      label: "Statuses",
      value: 3,
      icon: ClipboardList,
      tint: "from-[var(--cyan)] to-[var(--amber)]",
    },
  ];
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <div key={s.label} className="card-vibrant flex items-center gap-3 rounded-2xl px-4 py-3">
          <div
            className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${s.tint} shadow-lg`}
          >
            <s.icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="font-display text-lg font-semibold leading-none">{s.value}</div>
            <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
              {s.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsColumn({
  projects,
  loading,
  error,
  selectedId,
  onSelect,
}: {
  projects: Project[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: createProject,
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setName("");
      setDescription("");
      setCreating(false);
      if (p?._id) onSelect(p._id);
    },
    onError: (e) => setFormError(getApiError(e)),
  });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) return;
    createMut.mutate({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <aside className="card-vibrant rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-[var(--brand)]" />
          <h2 className="font-display text-base font-semibold">Projects</h2>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-[var(--brand)]/30 transition-transform hover:scale-[1.04]"
        >
          <Plus className="h-3.5 w-3.5" />
          New
        </button>
      </div>

      {creating && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={onCreate}
          className="mt-4 space-y-2 overflow-hidden"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {formError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-2.5 py-1.5 text-xs text-destructive">
              {formError}
            </div>
          )}
          <button
            type="submit"
            disabled={createMut.isPending || !name.trim()}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {createMut.isPending ? "Creating…" : "Create project"}
          </button>
        </motion.form>
      )}

      <div className="mt-4 space-y-1.5">
        {loading && (
          <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading projects…
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">No projects yet.</p>
        )}
        {projects.map((p) => {
          const active = p._id === selectedId;
          return (
            <button
              key={p._id}
              onClick={() => onSelect(p._id)}
              className={`group flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                active
                  ? "border-[var(--brand)]/50 bg-[var(--brand)]/10"
                  : "border-border hover:border-[var(--brand)]/30 hover:bg-muted/70"
              }`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{p.name}</div>
                {p.description && (
                  <div className="truncate text-[11px] text-muted-foreground">{p.description}</div>
                )}
              </div>
              <ArrowRight
                className={`h-3.5 w-3.5 shrink-0 transition-transform ${
                  active
                    ? "translate-x-0 text-[var(--brand)]"
                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                }`}
              />
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ProjectDetail({ project }: { project: Project | null }) {
  if (!project) {
    return (
      <div className="card-vibrant grid min-h-[420px] place-items-center rounded-2xl p-10 text-center">
        <div>
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--cyan)] shadow-lg">
            <FolderKanban className="h-6 w-6 text-white" />
          </div>
          <h3 className="mt-5 font-display text-xl font-semibold">Select a project</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a project from the list to see its tasks and notes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      key={project._id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="card-vibrant rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold tracking-tight">{project.name}</h2>
            {project.description && (
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
          {typeof project.members === "number" && (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/70 px-3 py-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {project.members} member{project.members === 1 ? "" : "s"}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TasksPanel projectId={project._id} />
        <NotesPanel projectId={project._id} />
      </div>
    </motion.div>
  );
}

const STATUS_META: Record<
  Task["status"],
  { label: string; tint: string; icon: typeof CheckCircle2 }
> = {
  todo: { label: "Todo", tint: "from-[var(--brand-2)] to-[var(--cyan)]", icon: Circle },
  in_progress: {
    label: "In progress",
    tint: "from-[var(--amber)] to-[var(--pink)]",
    icon: Loader2,
  },
  done: { label: "Done", tint: "from-[var(--cyan)] to-[var(--brand)]", icon: CheckCircle2 },
};

function TasksPanel({ projectId }: { projectId: string }) {
  const q = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => listProjectTasks(projectId),
    retry: false,
  });

  const tasks = q.data ?? [];
  const counts = tasks.reduce(
    (acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    },
    { todo: 0, in_progress: 0, done: 0 } as Record<Task["status"], number>,
  );

  return (
    <div className="card-vibrant rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[var(--brand-2)]" />
          <h3 className="font-display text-base font-semibold">Tasks</h3>
        </div>
        <div className="flex gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded-full border border-border px-2 py-0.5">To do {counts.todo}</span>
          <span className="rounded-full border border-border px-2 py-0.5">
            In progress {counts.in_progress}
          </span>
          <span className="rounded-full border border-border px-2 py-0.5">Done {counts.done}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {q.isLoading && (
          <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading tasks…
          </div>
        )}
        {q.error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {getApiError(q.error)}
          </div>
        )}
        {!q.isLoading && !q.error && tasks.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No tasks in this project.
          </p>
        )}
        {tasks.map((t) => {
          const meta = STATUS_META[t.status] ?? STATUS_META.todo;
          const Icon = meta.icon;
          return (
            <div
              key={t._id}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5 transition-colors hover:border-[var(--brand)]/30"
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.tint} shadow`}
              >
                <Icon
                  className={`h-4 w-4 text-white ${t.status === "in_progress" ? "animate-spin" : ""}`}
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="truncate text-sm font-medium">{t.title}</div>
                  <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                    {meta.label}
                  </span>
                </div>
                {t.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                )}
                {t.attachments && t.attachments.length > 0 && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {t.attachments.length} attachment{t.attachments.length === 1 ? "" : "s"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NotesPanel({ projectId }: { projectId: string }) {
  const q = useQuery({
    queryKey: ["notes", projectId],
    queryFn: () => listProjectNotes(projectId),
    retry: false,
  });
  const notes = q.data ?? [];

  return (
    <div className="card-vibrant rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-[var(--amber)]" />
        <h3 className="font-display text-base font-semibold">Notes</h3>
      </div>

      <div className="mt-4 space-y-2">
        {q.isLoading && (
          <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading notes…
          </div>
        )}
        {q.error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {getApiError(q.error)}
          </div>
        )}
        {!q.isLoading && !q.error && notes.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">No notes yet.</p>
        )}
        {notes.map((n) => (
          <div
            key={n._id}
            className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm transition-colors hover:border-[var(--brand)]/30"
          >
            <p className="whitespace-pre-line text-foreground/90">{n.content}</p>
            {n.createdAt && (
              <div className="mt-1.5 text-[11px] text-muted-foreground">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
