import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from "react";
import { useQuery, useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FolderKanban,
  ClipboardList,
  Users,
  LogOut,
  Plus,
  ServerCog,
  Sparkles,
  Loader2,
  ArrowRight,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  isAuthenticated,
  logout,
  getCurrentUser,
  listProjects,
  listProjectTasks,
  createProject,
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

  const userQ = useQuery({ queryKey: ["me"], queryFn: getCurrentUser, retry: false });
  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: listProjects, retry: false });

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await logout();
    navigate({ to: "/login", replace: true });
  }

  const projects = projectsQ.data ?? [];
  const user = userQ.data as
    { _id?: string; username?: string; email?: string; fullName?: string } | undefined;
  const taskQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: ["tasks", project._id],
      queryFn: () => listProjectTasks(project._id),
      enabled: Boolean(user?._id),
      retry: false,
    })),
  });
  const assignedTasks = projects.flatMap((project, index) =>
    (taskQueries[index]?.data ?? [])
      .filter((task) => {
        const assigneeId =
          typeof task.assignedTo === "object" ? task.assignedTo?._id : task.assignedTo;
        return assigneeId === user?._id;
      })
      .map((task) => ({ project, task })),
  );

  return (
    <div className="min-h-screen">
      <DashboardNav user={user} onSignOut={handleSignOut} />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <WelcomeHeader user={user} projects={projects} />
        <AssignedTasksSection assignments={assignedTasks} />
        <div className="mt-10">
          <ProjectsSection
            projects={projects}
            loading={projectsQ.isLoading}
            error={projectsQ.error ? getApiError(projectsQ.error) : null}
          />
        </div>
      </main>
    </div>
  );
}

function AssignedTasksSection({
  assignments,
}: {
  assignments: { project: Project; task: Task }[];
}) {
  if (assignments.length === 0) return null;

  return (
    <section className="mt-8 rounded-2xl border border-[var(--cyan)]/40 bg-[var(--cyan)]/5 p-5">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-[var(--cyan)]" />
        <h2 className="font-display text-base font-semibold">Assigned to you</h2>
        <span className="rounded-full bg-[var(--cyan)]/15 px-2 py-0.5 text-[11px] font-medium text-[var(--cyan)]">
          {assignments.length}
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {assignments.map(({ project, task }) => (
          <Link
            key={task._id}
            to="/projects/$projectId"
            params={{ projectId: project._id }}
            className="rounded-xl border border-[var(--cyan)]/30 bg-card/80 px-3 py-2.5 transition-colors hover:bg-muted"
          >
            <div className="text-sm font-medium">{task.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {project.name} · {task.status.replace("_", " ")}
            </div>
          </Link>
        ))}
      </div>
    </section>
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

function ProjectsSection({
  projects,
  loading,
  error,
}: {
  projects: Project[];
  loading: boolean;
  error: string | null;
}) {
  const [creating, setCreating] = useState(false);

  return (
    <section className="card-vibrant rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-[var(--brand)]" />
          <h2 className="font-display text-lg font-semibold">Your projects</h2>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/30 transition-transform hover:scale-[1.03]"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl border border-border bg-muted/40"
              />
            ))}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {!loading && !error && projects.length === 0 && (
          <div className="grid place-items-center rounded-xl border border-dashed border-border py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--cyan)] shadow-lg">
              <FolderKanban className="h-6 w-6 text-white" />
            </div>
            <h3 className="mt-5 font-display text-xl font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first project to start collaborating.
            </p>
            <button
              onClick={() => setCreating(true)}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-3 py-1.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/30"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        )}
        {!loading && !error && projects.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        )}
      </div>

      {creating && <CreateProjectModal onClose={() => setCreating(false)} />}
    </section>
  );
}

function ProjectCard({ project }: { project: Project & { role?: string } }) {
  const role = (project as unknown as { role?: string }).role;
  return (
    <Link
      to="/projects/$projectId"
      params={{ projectId: project._id }}
      className="group flex flex-col justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4 transition-all hover:border-[var(--brand)]/40 hover:bg-muted/60"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate font-display text-base font-semibold">{project.name}</div>
            {project.description && (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {project.description}
              </p>
            )}
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3 w-3" />
          {typeof project.members === "number" ? project.members : "—"} member
          {project.members === 1 ? "" : "s"}
        </span>
        {role && (
          <span className="rounded-full border border-border px-2 py-0.5 uppercase tracking-widest">
            {role.replace("_", " ")}
          </span>
        )}
      </div>
    </Link>
  );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: createProject,
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
      onClose();
      if (p?._id) navigate({ to: "/projects/$projectId", params: { projectId: p._id } });
    },
    onError: (e) => {
      const msg = getApiError(e);
      setFormError(msg);
      toast.error(msg);
    },
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Project name is required");
      return;
    }
    createMut.mutate({ name: name.trim(), description: description.trim() || undefined });
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e: ReactMouseEvent) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold">New project</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Give your project a name and short description.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Project name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing website redesign"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What is this project about?"
              className="mt-1 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          {formError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createMut.isPending}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMut.isPending || !name.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/30 disabled:opacity-60"
            >
              {createMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {createMut.isPending ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
