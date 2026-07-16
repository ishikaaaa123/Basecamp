import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type MouseEvent as ReactMouseEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ClipboardList,
  FileText,
  Users,
  UserPlus,
  Loader2,
  Circle,
  CheckCircle2,
  ServerCog,
  LogOut,
  MoreVertical,
  X,
  Mail,
  Shield,
  Trash2,
  Plus,
  Paperclip,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  isAuthenticated,
  logout,
  getCurrentUser,
  getProjectById,
  deleteProject,
  listProjectTasks,
  createTask,
  createSubtask,
  getTaskById,
  updateTaskStatus,
  updateTask,
  updateSubtask,
  deleteTask,
  deleteSubtask,
  createProjectNote,
  listProjectNotes,
  listProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
  getApiError,
  type Task,
  type Subtask,
  type ProjectMember,
  type ProjectRole,
} from "@/lib/api";

export const Route = createFileRoute("/projects/$projectId")({
  head: () => ({
    meta: [
      { title: "Project — Project Camp" },
      { name: "description", content: "Project details, tasks, notes, and members." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
      return;
    }
    let active = true;
    void getCurrentUser()
      .then(() => active && setReady(true))
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
  return <ProjectShell />;
}

function ProjectShell() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const userQ = useQuery({ queryKey: ["me"], queryFn: getCurrentUser, retry: false });
  const projectQ = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(projectId),
    retry: false,
  });
  const membersQ = useQuery({
    queryKey: ["members", projectId],
    queryFn: () => listProjectMembers(projectId),
    retry: false,
  });

  const currentUser = userQ.data as { _id?: string; email?: string } | undefined;
  const myMembership = (membersQ.data ?? []).find(
    (m) => m.userInfo?._id && currentUser?._id && m.userInfo._id === currentUser._id,
  );
  const myRole: ProjectRole | undefined = myMembership?.role;
  const canManageMembers = myRole === "admin";
  const canManageTasks = Boolean(myRole);
  const [confirmDeletion, setConfirmDeletion] = useState(false);

  const deleteMut = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: () => {
      qc.removeQueries({ queryKey: ["project", projectId] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
      navigate({ to: "/dashboard", replace: true });
    },
    onError: (error) => toast.error(getApiError(error)),
  });

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await logout();
    navigate({ to: "/login", replace: true });
  }

  return (
    <div className="min-h-screen">
      <ProjectNav user={userQ.data as never} onSignOut={handleSignOut} />
      <main className="mx-auto max-w-7xl px-6 pt-24 pb-16">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mt-6">
          {projectQ.isLoading ? (
            <div className="h-24 animate-pulse rounded-2xl border border-border bg-muted/40" />
          ) : projectQ.error ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {getApiError(projectQ.error)}
            </div>
          ) : projectQ.data ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-border/60 p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    {projectQ.data.name}
                  </h1>
                  {projectQ.data.description && (
                    <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                      {projectQ.data.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {myRole && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      {myRole.replace("_", " ")}
                    </span>
                  )}
                  {canManageMembers && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeletion(true)}
                      className="inline-flex items-center gap-1 rounded-md border border-destructive/50 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete project
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <TasksPanel
              projectId={projectId}
              members={membersQ.data ?? []}
              canManage={canManageTasks}
            />
            <NotesPanel projectId={projectId} canManage={Boolean(myRole)} />
          </div>
          <MembersPanel
            projectId={projectId}
            membersQ={membersQ}
            canManage={canManageMembers}
            currentUserId={currentUser?._id}
          />
        </div>
      </main>
      {confirmDeletion && (
        <ConfirmDialog
          title="Delete project?"
          description="This permanently removes the project, its tasks, subtasks, notes, and memberships."
          confirmLabel={deleteMut.isPending ? "Deleting…" : "Delete project"}
          destructive
          loading={deleteMut.isPending}
          onCancel={() => setConfirmDeletion(false)}
          onConfirm={() => deleteMut.mutate()}
        />
      )}
    </div>
  );
}

function ProjectNav({
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
      className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl"
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
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

function TasksPanel({
  projectId,
  members,
  canManage,
}: {
  projectId: string;
  members: ProjectMember[];
  canManage: boolean;
}) {
  const [creating, setCreating] = useState(false);
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
    <section className="rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[var(--brand-2)]" />
          <h3 className="font-display text-base font-semibold">Tasks</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden gap-1.5 text-[11px] text-muted-foreground sm:flex">
            <span className="rounded-full border border-border px-2 py-0.5">
              To do {counts.todo}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5">
              In progress {counts.in_progress}
            </span>
            <span className="rounded-full border border-border px-2 py-0.5">
              Done {counts.done}
            </span>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium hover:bg-muted"
            >
              <Plus className="h-3.5 w-3.5" /> Add task
            </button>
          )}
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
        {tasks.map((task) => (
          <TaskRow
            key={task._id}
            task={task}
            projectId={projectId}
            members={members}
            canManage={canManage}
          />
        ))}
      </div>
      {creating && (
        <CreateTaskModal
          projectId={projectId}
          members={members}
          onClose={() => setCreating(false)}
        />
      )}
    </section>
  );
}

function TaskRow({
  task,
  projectId,
  members,
  canManage,
}: {
  task: Task;
  projectId: string;
  members: ProjectMember[];
  canManage: boolean;
}) {
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();
  const statusMut = useMutation({
    mutationFn: (status: Task["status"]) => updateTaskStatus(projectId, task._id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
    onError: (error) => toast.error(getApiError(error)),
  });
  const deleteMut = useMutation({
    mutationFn: () => deleteTask(projectId, task._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.removeQueries({ queryKey: ["task", projectId, task._id] });
      toast.success("Task deleted");
    },
    onError: (error) => toast.error(getApiError(error)),
  });
  const detailsQ = useQuery({
    queryKey: ["task", projectId, task._id],
    queryFn: () => getTaskById(projectId, task._id),
    retry: false,
  });
  const meta = STATUS_META[task.status] ?? STATUS_META.todo;
  const Icon = meta.icon;
  const subtasks = detailsQ.data?.subtasks ?? [];

  return (
    <div className="rounded-xl border border-border/60 px-3 py-3">
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={statusMut.isPending}
          title={task.status === "done" ? "Mark as to do" : "Mark as completed"}
          onClick={() => statusMut.mutate(task.status === "done" ? "todo" : "done")}
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.tint} disabled:opacity-60`}
        >
          <Icon className="h-4 w-4 text-white" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div
              className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
            >
              {task.title}
            </div>
            <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              {meta.label}
            </span>
          </div>
          {task.description && (
            <p className="mt-0.5 text-xs text-muted-foreground">{task.description}</p>
          )}
          {task.attachments && task.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {task.attachments.map((file) => (
                <a
                  key={file.url}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[var(--cyan)] underline"
                >
                  <Paperclip className="h-3 w-3" /> Attachment
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Edit task"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          {canManage && (
            <button
              type="button"
              onClick={() => setAddingSubtask(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              + Subtask
            </button>
          )}
          <button
            type="button"
            disabled={deleteMut.isPending}
            onClick={() => deleteMut.mutate()}
            className="text-destructive hover:underline"
          >
            Delete
          </button>
        </div>
      </div>
      {subtasks.length > 0 && (
        <div className="mt-3 ml-11 space-y-1 border-l border-border pl-3">
          {subtasks.map((subtask) => (
            <SubtaskRow
              key={subtask._id}
              subtask={subtask}
              projectId={projectId}
              taskId={task._id}
              members={members}
            />
          ))}
        </div>
      )}
      {addingSubtask && (
        <CreateSubtaskModal
          projectId={projectId}
          taskId={task._id}
          members={members}
          onClose={() => setAddingSubtask(false)}
        />
      )}
      {editing && (
        <EditTaskModal
          projectId={projectId}
          task={task}
          members={members}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function SubtaskRow({
  subtask,
  projectId,
  taskId,
  members,
}: {
  subtask: Subtask;
  projectId: string;
  taskId: string;
  members: ProjectMember[];
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const deleteMut = useMutation({
    mutationFn: () => deleteSubtask(projectId, taskId, subtask._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", projectId, taskId] });
      toast.success("Subtask deleted");
    },
    onError: (error) => toast.error(getApiError(error)),
  });
  const completeMut = useMutation({
    mutationFn: () =>
      updateSubtask(projectId, taskId, subtask._id, { isCompleted: !subtask.isCompleted }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["task", projectId, taskId] }),
    onError: (error) => toast.error(getApiError(error)),
  });
  return (
    <div className="flex items-center gap-2 py-1 text-xs">
      <button
        type="button"
        disabled={completeMut.isPending}
        onClick={() => completeMut.mutate()}
        title="Toggle subtask completion"
      >
        {subtask.isCompleted ? (
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--cyan)]" />
        ) : (
          <Circle className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      <span className={subtask.isCompleted ? "line-through text-muted-foreground" : ""}>
        {subtask.title}
      </span>
      {subtask.attachments?.map((file) => (
        <a
          key={file.url}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="ml-1 text-[var(--cyan)]"
        >
          <Paperclip className="h-3 w-3" />
        </a>
      ))}
      <button
        aria-label="Edit subtask"
        type="button"
        onClick={() => setEditing(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Pencil className="h-3 w-3" />
      </button>
      <button
        type="button"
        disabled={deleteMut.isPending}
        onClick={() => deleteMut.mutate()}
        className="ml-auto text-destructive hover:underline"
      >
        Delete
      </button>
      {editing && (
        <EditSubtaskModal
          projectId={projectId}
          taskId={taskId}
          subtask={subtask}
          members={members}
          onClose={() => setEditing(false)}
        />
      )}
    </div>
  );
}

function CreateTaskModal({
  projectId,
  members,
  onClose,
}: {
  projectId: string;
  members: ProjectMember[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState<Task["status"]>("todo");
  const [files, setFiles] = useState<FileList | null>(null);
  const mut = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("description", description.trim());
      form.append("assignedTo", assignedTo);
      form.append("status", status);
      Array.from(files ?? []).forEach((file) => form.append("attachments", file));
      return createTask(projectId, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task added");
      onClose();
    },
    onError: (error) => toast.error(getApiError(error)),
  });
  return (
    <TaskFormModal
      title="Add task"
      submitLabel="Add task"
      members={members}
      titleValue={title}
      setTitle={setTitle}
      assignedTo={assignedTo}
      setAssignedTo={setAssignedTo}
      files={files}
      setFiles={setFiles}
      onClose={onClose}
      pending={mut.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        mut.mutate();
      }}
      description={description}
      setDescription={setDescription}
      status={status}
      setStatus={setStatus}
    />
  );
}

function EditTaskModal({
  projectId,
  task,
  members,
  onClose,
}: {
  projectId: string;
  task: Task;
  members: ProjectMember[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState<Task["status"]>(task.status);
  const [assignedTo, setAssignedTo] = useState(
    typeof task.assignedTo === "object" ? (task.assignedTo?._id ?? "") : "",
  );
  const mut = useMutation({
    mutationFn: () =>
      updateTask(projectId, task._id, {
        title: title.trim(),
        description: description.trim(),
        status,
        assignedTo,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      qc.invalidateQueries({ queryKey: ["task", projectId, task._id] });
      toast.success("Task updated");
      onClose();
    },
    onError: (error) => toast.error(getApiError(error)),
  });
  return (
    <EditFormModal
      title="Edit task"
      titleValue={title}
      setTitle={setTitle}
      assignedTo={assignedTo}
      setAssignedTo={setAssignedTo}
      members={members}
      onClose={onClose}
      pending={mut.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        mut.mutate();
      }}
      description={description}
      setDescription={setDescription}
      status={status}
      setStatus={setStatus}
    />
  );
}

function EditSubtaskModal({
  projectId,
  taskId,
  subtask,
  members,
  onClose,
}: {
  projectId: string;
  taskId: string;
  subtask: Subtask;
  members: ProjectMember[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState(subtask.title);
  const [assignedTo, setAssignedTo] = useState(
    typeof subtask.assignedTo === "object" ? (subtask.assignedTo?._id ?? "") : "",
  );
  const [isCompleted, setIsCompleted] = useState(subtask.isCompleted);
  const mut = useMutation({
    mutationFn: () =>
      updateSubtask(projectId, taskId, subtask._id, {
        title: title.trim(),
        assignedTo,
        isCompleted,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", projectId, taskId] });
      toast.success("Subtask updated");
      onClose();
    },
    onError: (error) => toast.error(getApiError(error)),
  });
  return (
    <EditFormModal
      title="Edit subtask"
      titleValue={title}
      setTitle={setTitle}
      assignedTo={assignedTo}
      setAssignedTo={setAssignedTo}
      members={members}
      onClose={onClose}
      pending={mut.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        mut.mutate();
      }}
      isCompleted={isCompleted}
      setIsCompleted={setIsCompleted}
    />
  );
}

function EditFormModal({
  title,
  titleValue,
  setTitle,
  assignedTo,
  setAssignedTo,
  members,
  onClose,
  pending,
  onSubmit,
  description,
  setDescription,
  status,
  setStatus,
  isCompleted,
  setIsCompleted,
}: {
  title: string;
  titleValue: string;
  setTitle: (value: string) => void;
  assignedTo: string;
  setAssignedTo: (value: string) => void;
  members: ProjectMember[];
  onClose: () => void;
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
  description?: string;
  setDescription?: (value: string) => void;
  status?: Task["status"];
  setStatus?: (value: Task["status"]) => void;
  isCompleted?: boolean;
  setIsCompleted?: (value: boolean) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(event: ReactMouseEvent) => event.stopPropagation()}
      >
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <input
            autoFocus
            required
            value={titleValue}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          {setDescription && (
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          )}
          {setStatus && (
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as Task["status"])}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          )}
          <select
            required
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Assign to…</option>
            {members.map((member) => (
              <option key={member.userInfo._id} value={member.userInfo._id}>
                {member.userInfo.fullName || member.userInfo.username || member.userInfo.email}
              </option>
            ))}
          </select>
          {setIsCompleted && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={(event) => setIsCompleted(event.target.checked)}
              />{" "}
              Completed
            </label>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              disabled={pending || !titleValue.trim() || !assignedTo}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateSubtaskModal({
  projectId,
  taskId,
  members,
  onClose,
}: {
  projectId: string;
  taskId: string;
  members: ProjectMember[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const mut = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append("title", title.trim());
      form.append("assignedTo", assignedTo);
      Array.from(files ?? []).forEach((file) => form.append("attachments", file));
      return createSubtask(projectId, taskId, form);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["task", projectId, taskId] });
      toast.success("Subtask added");
      onClose();
    },
    onError: (error) => toast.error(getApiError(error)),
  });
  return (
    <TaskFormModal
      title="Add subtask"
      submitLabel="Add subtask"
      members={members}
      titleValue={title}
      setTitle={setTitle}
      assignedTo={assignedTo}
      setAssignedTo={setAssignedTo}
      files={files}
      setFiles={setFiles}
      onClose={onClose}
      pending={mut.isPending}
      onSubmit={(event) => {
        event.preventDefault();
        mut.mutate();
      }}
    />
  );
}

function TaskFormModal({
  title,
  submitLabel,
  members,
  titleValue,
  setTitle,
  assignedTo,
  setAssignedTo,
  files,
  setFiles,
  onClose,
  pending,
  onSubmit,
  description,
  setDescription,
  status,
  setStatus,
}: {
  title: string;
  submitLabel: string;
  members: ProjectMember[];
  titleValue: string;
  setTitle: (value: string) => void;
  assignedTo: string;
  setAssignedTo: (value: string) => void;
  files: FileList | null;
  setFiles: (value: FileList | null) => void;
  onClose: () => void;
  pending: boolean;
  onSubmit: (event: FormEvent) => void;
  description?: string;
  setDescription?: (value: string) => void;
  status?: Task["status"];
  setStatus?: (value: Task["status"]) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
        onClick={(event: ReactMouseEvent) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <input
            autoFocus
            required
            value={titleValue}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {setDescription && (
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          {setStatus && (
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as Task["status"])}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          )}
          <select
            required
            value={assignedTo}
            onChange={(event) => setAssignedTo(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Assign to…</option>
            {members.map((member) => (
              <option key={member.userInfo._id} value={member.userInfo._id}>
                {member.userInfo.fullName || member.userInfo.username || member.userInfo.email}
              </option>
            ))}
          </select>
          <input
            type="file"
            multiple
            onChange={(event) => setFiles(event.target.files)}
            className="w-full text-sm text-muted-foreground"
          />
          {files && (
            <p className="text-xs text-muted-foreground">
              {files.length} file(s), max 5 files / 1 MB each.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              disabled={pending || !titleValue.trim() || !assignedTo}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function NotesPanel({ projectId, canManage }: { projectId: string; canManage: boolean }) {
  const [content, setContent] = useState("");
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["notes", projectId],
    queryFn: () => listProjectNotes(projectId),
    retry: false,
  });
  const createMut = useMutation({
    mutationFn: () => createProjectNote(projectId, content.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notes", projectId] });
      setContent("");
      toast.success("Note added");
    },
    onError: (error) => toast.error(getApiError(error)),
  });
  const notes = q.data ?? [];

  return (
    <section className="rounded-2xl border border-border/60 p-6">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-[var(--amber)]" />
        <h3 className="font-display text-base font-semibold">Notes</h3>
      </div>
      {canManage && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (content.trim()) createMut.mutate();
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add a note…"
            className="min-w-0 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            disabled={createMut.isPending || !content.trim()}
            className="rounded-md border border-border px-3 text-sm font-medium hover:bg-muted disabled:opacity-60"
          >
            Add note
          </button>
        </form>
      )}
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
            className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-sm"
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
    </section>
  );
}

const ROLE_LABEL: Record<ProjectRole, string> = {
  admin: "Admin",
  project_admin: "Project Admin",
  member: "Member",
};

function MembersPanel({
  projectId,
  membersQ,
  canManage,
  currentUserId,
}: {
  projectId: string;
  membersQ: ReturnType<typeof useQuery<ProjectMember[]>>;
  canManage: boolean;
  currentUserId?: string;
}) {
  const [adding, setAdding] = useState(false);
  const members = membersQ.data ?? [];

  return (
    <aside className="h-fit rounded-2xl border border-border/60 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[var(--cyan)]" />
          <h3 className="font-display text-base font-semibold">Members</h3>
        </div>
        {canManage && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-2.5 py-1 text-xs font-semibold text-white shadow-lg shadow-[var(--brand)]/30 transition-transform hover:scale-[1.04]"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add
          </button>
        )}
      </div>

      <div className="mt-4 space-y-2">
        {membersQ.isLoading && (
          <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading members…
          </div>
        )}
        {membersQ.error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {getApiError(membersQ.error)}
          </div>
        )}
        {!membersQ.isLoading && !membersQ.error && members.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">No members yet.</p>
        )}
        {members.map((m) => (
          <MemberRow
            key={m.userInfo?._id ?? Math.random().toString()}
            member={m}
            projectId={projectId}
            canManage={canManage}
            isSelf={m.userInfo?._id === currentUserId}
          />
        ))}
      </div>

      {adding && <AddMemberModal projectId={projectId} onClose={() => setAdding(false)} />}
    </aside>
  );
}

function MemberRow({
  member,
  projectId,
  canManage,
  isSelf,
}: {
  member: ProjectMember;
  projectId: string;
  canManage: boolean;
  isSelf: boolean;
}) {
  const qc = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const info = member.userInfo ?? { _id: "" };
  const name = info.fullName || info.username || info.email || "Unknown";
  const initial = name.slice(0, 1).toUpperCase();
  const avatarUrl =
    typeof info.avatar === "object" && info.avatar?.url ? info.avatar.url : undefined;

  const roleMut = useMutation({
    mutationFn: (role: ProjectRole) => updateProjectMemberRole(projectId, info._id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", projectId] });
      toast.success("Role updated");
      setMenuOpen(false);
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const removeMut = useMutation({
    mutationFn: () => removeProjectMember(projectId, info._id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", projectId] });
      toast.success("Member removed");
      setConfirmRemove(false);
      setMenuOpen(false);
    },
    onError: (e) => toast.error(getApiError(e)),
  });

  const canEdit = canManage && !isSelf;

  return (
    <div className="relative flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
      <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--brand-2)] text-sm font-semibold text-white">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className="truncate text-sm font-medium">{name}</div>
          {isSelf && (
            <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
              You
            </span>
          )}
        </div>
        {info.email && (
          <div className="truncate text-[11px] text-muted-foreground">{info.email}</div>
        )}
      </div>
      <span className="shrink-0 rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
        {ROLE_LABEL[member.role] ?? member.role}
      </span>
      {canEdit && (
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-md p-1 text-muted-foreground hover:bg-background/60 hover:text-foreground"
          aria-label="Member actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      )}
      {menuOpen && canEdit && (
        <div
          className="absolute right-2 top-12 z-20 w-44 overflow-hidden rounded-lg border border-border bg-popover shadow-xl"
          onMouseLeave={() => setMenuOpen(false)}
        >
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            Change role
          </div>
          {(["member", "project_admin", "admin"] as ProjectRole[]).map((r) => (
            <button
              key={r}
              disabled={roleMut.isPending || r === member.role}
              onClick={() => roleMut.mutate(r)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
            >
              <span>{ROLE_LABEL[r]}</span>
              {r === member.role && <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand)]" />}
            </button>
          ))}
          <button
            onClick={() => {
              setMenuOpen(false);
              setConfirmRemove(true);
            }}
            className="flex w-full items-center gap-2 border-t border-border px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove member
          </button>
        </div>
      )}

      {confirmRemove && (
        <ConfirmDialog
          title="Remove member?"
          description={`${name} will lose access to this project.`}
          confirmLabel={removeMut.isPending ? "Removing…" : "Remove"}
          destructive
          loading={removeMut.isPending}
          onCancel={() => setConfirmRemove(false)}
          onConfirm={() => removeMut.mutate()}
        />
      )}
    </div>
  );
}

function AddMemberModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("member");
  const [formError, setFormError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () => addProjectMember(projectId, { email: email.trim(), role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", projectId] });
      toast.success("Member added");
      onClose();
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
    const trimmed = email.trim();
    if (!trimmed) return setFormError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed))
      return setFormError("Enter a valid email address");
    mut.mutate();
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
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-semibold">Add member</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Invite a registered user to this project.
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
            <label className="block text-sm font-medium">Email</label>
            <div className="relative mt-1">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teammate@example.com"
                className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ProjectRole)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="member">Member</option>
              <option value="project_admin">Project Admin</option>
            </select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Admin role can only be granted by promoting an existing member later.
            </p>
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
              disabled={mut.isPending}
              className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mut.isPending || !email.trim()}
              className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/30 disabled:opacity-60"
            >
              {mut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {mut.isPending ? "Adding…" : "Add Member"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  destructive,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e: ReactMouseEvent) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-lg disabled:opacity-60 ${
              destructive
                ? "bg-destructive shadow-destructive/30"
                : "bg-gradient-to-r from-[var(--brand)] to-[var(--brand-2)] shadow-[var(--brand)]/30"
            }`}
          >
            {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
