import axios from "axios";

/**
 * Set VITE_API_BASE_URL when embedding this frontend in another project.
 * It must include the backend API prefix, if your backend uses one.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(
  /\/$/,
  "",
);
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
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done";
  project: string;
  assignedTo?: { username?: string; email?: string } | string;
  attachments?: { url: string; mimetype: string; size: number }[];
  createdAt?: string;
}

export interface ProjectNote {
  _id: string;
  content: string;
  project: string;
  createdBy?: { username?: string; email?: string } | string;
  createdAt?: string;
}

function unwrap<T>(payload: unknown): T {
  const p = payload as { data?: T };
  return (p?.data ?? payload) as T;
}

export async function listProjects(): Promise<Project[]> {
  const { data } = await api.get("/projects");
  return unwrap<Project[]>(data);
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

export async function listProjectNotes(projectId: string): Promise<ProjectNote[]> {
  const { data } = await api.get(`/notes/${projectId}`);
  return unwrap<ProjectNote[]>(data);
}
