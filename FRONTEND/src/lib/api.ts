import axios from "axios";

/**
 * This is intentionally required. Vite embeds VITE_* values at build time, so
 * every deployed frontend must be built with its public backend API URL.
 */
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
if (!configuredApiBaseUrl) {
  throw new Error("VITE_API_BASE_URL must be set before building or running the frontend.");
}
const BASE_URL = configuredApiBaseUrl.replace(/\/$/, "");
const TOKEN_KEY = "pc_access_token";

// Keep every browser-to-backend request in one Axios client so the API origin,
// cookies, auth token, and error handling remain consistent.
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) config.headers.delete("Content-Type");
  return config;
});

function saveToken(token?: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  saveToken(data?.data?.accessToken ?? data?.accessToken);
}

export async function register(input: {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}) {
  const { data } = await api.post("/auth/register", {
    ...input,
    fullName: input.fullName ?? input.username,
  });
  saveToken(data?.data?.accessToken ?? data?.accessToken);
}

export function getApiError(err: unknown): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message ?? e?.message ?? "Something went wrong";
}

// ---- Auth session helpers ----

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(TOKEN_KEY);
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    /* ignore */
  }
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

export async function getCurrentUser() {
  const { data } = await api.get("/auth/current-user");
  return data?.data ?? data;
}

// ---- Email verification ----

export async function resendEmailVerification(email: string) {
  await api.post("/auth/resend-email-verification", { email });
}

// ---- Projects / Tasks / Notes ----

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy?: { username?: string; email?: string } | string;
  members?: number;
  createdAt?: string;
  updatedAt?: string;
  role?: ProjectRole;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  project: string;
  assignedTo?: { _id?: string; username?: string; email?: string } | string;
  attachments?: { url: string; mimeType?: string; size: number }[];
  createdAt?: string;
}

export interface Subtask {
  _id: string;
  title: string;
  isCompleted: boolean;
  assignedTo?: { _id?: string; username?: string; email?: string } | string;
  attachments?: { url: string; mimeType?: string; size: number }[];
}

export interface ProjectNote {
  _id: string;
  content: string;
  project: string;
  createdBy?: { _id?: string; fullName?: string; username?: string; email?: string } | string;
  createdAt?: string;
}

function unwrap<T>(payload: unknown): T {
  const p = payload as { data?: T };
  return (p?.data ?? payload) as T;
}

export async function listProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects");
  const projects = unwrap<Array<Project | { projects: Project; role?: ProjectRole }>>(data);
  return projects.map((entry) =>
    "projects" in entry ? { ...entry.projects, role: entry.role } : entry,
  );
}

export async function createProject(input: {
  name: string;
  description?: string;
}): Promise<Project> {
  const { data } = await api.post("/projects", input);
  return unwrap<Project>(data);
}

export async function listProjectTasks(projectId: string): Promise<Task[]> {
  const { data } = await api.get(`/tasks/${projectId}`);
  return unwrap<Task[]>(data);
}

export async function createTask(projectId: string, form: FormData): Promise<Task> {
  const { data } = await api.post(`/tasks/${projectId}`, form);
  return unwrap<Task>(data);
}

export async function createSubtask(
  projectId: string,
  taskId: string,
  form: FormData,
): Promise<unknown> {
  const { data } = await api.post(`/tasks/${projectId}/t/${taskId}/subtasks`, form);
  return unwrap<unknown>(data);
}

export async function getTaskById(
  projectId: string,
  taskId: string,
): Promise<Task & { subtasks: Subtask[] }> {
  const { data } = await api.get(`/tasks/${projectId}/t/${taskId}`);
  return unwrap<Task & { subtasks: Subtask[] }>(data);
}

export async function updateTaskStatus(projectId: string, taskId: string, status: Task["status"]) {
  await api.put(`/tasks/${projectId}/t/${taskId}`, { status });
}

export async function updateTask(
  projectId: string,
  taskId: string,
  input: Pick<Task, "title" | "description" | "status"> & { assignedTo?: string },
) {
  await api.put(`/tasks/${projectId}/t/${taskId}`, input);
}

export async function updateSubtask(
  projectId: string,
  taskId: string,
  subtaskId: string,
  input: { title?: string; assignedTo?: string; isCompleted?: boolean },
) {
  await api.put(`/tasks/${projectId}/t/${taskId}/subtasks/${subtaskId}`, input);
}

export async function deleteTask(projectId: string, taskId: string) {
  await api.delete(`/tasks/${projectId}/t/${taskId}`);
}

export async function deleteSubtask(projectId: string, taskId: string, subtaskId: string) {
  await api.delete(`/tasks/${projectId}/t/${taskId}/subtasks/${subtaskId}`);
}

export async function listProjectNotes(projectId: string): Promise<ProjectNote[]> {
  const { data } = await api.get(`/notes/${projectId}`);
  return unwrap<ProjectNote[]>(data);
}

export async function createProjectNote(projectId: string, content: string): Promise<ProjectNote> {
  const { data } = await api.post(`/notes/${projectId}`, { content });
  return unwrap<ProjectNote>(data);
}

export async function deleteProjectNote(projectId: string, noteId: string): Promise<void> {
  await api.delete(`/notes/${projectId}/n/${noteId}`);
}

// ---- Project members / role management ----

export type ProjectRole = "admin" | "project_admin" | "member";

export interface ProjectMember {
  project: string;
  role: ProjectRole;
  createdAt?: string;
  userInfo: {
    _id: string;
    username?: string;
    fullName?: string;
    email?: string;
    avatar?: { url?: string } | string;
  };
}

export async function getProjectById(projectId: string): Promise<Project> {
  const { data } = await api.get(`/projects/${projectId}`);
  return unwrap<Project>(data);
}

export async function updateProject(
  projectId: string,
  input: { name: string; description?: string },
): Promise<Project> {
  const { data } = await api.put(`/projects/${projectId}`, input);
  return unwrap<Project>(data);
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}`);
}

export async function listProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const { data } = await api.get(`/projects/${projectId}/members`);
  return unwrap<ProjectMember[]>(data);
}

export async function addProjectMember(
  projectId: string,
  input: { email: string; role: ProjectRole },
): Promise<unknown> {
  const { data } = await api.post(`/projects/${projectId}/members`, input);
  return unwrap<unknown>(data);
}

export async function updateProjectMemberRole(
  projectId: string,
  userId: string,
  role: ProjectRole,
): Promise<unknown> {
  const { data } = await api.put(`/projects/${projectId}/members/${userId}`, { role });
  return unwrap<unknown>(data);
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/members/${userId}`);
}
