import axios from "axios";

/**
 * Set VITE_API_BASE_URL when embedding this frontend in another project.
 * It must include the backend API prefix, if your backend uses one.
 */
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(/\/$/, "");
const TOKEN_KEY = "pc_access_token";

// Keep every browser-to-backend request in one Axios client so the API origin,
// cookies, auth token, and error handling remain consistent.
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
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
