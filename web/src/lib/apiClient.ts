import { env } from "./env";
import type { Theme, CreateThemeInput, TrainingSession, CreateTrainingSessionInput, HealthResponse, Note, CreateNoteInput, WeeklySummary, Task, CreateTaskInput, } from "../features/types";

// Store access token in localStorage
function getAccessTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function setAccessTokenInStorage(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers ?? {});
  headers.set("Content-Type", "application/json");
  
  // Add access token if available
  const token = getAccessTokenFromStorage();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function setAccessToken(token: string | null) {
  setAccessTokenInStorage(token);
}

export function getAccessToken(): string | null {
  return getAccessTokenFromStorage();
}

export const api = {
  getHealth: () => request<HealthResponse>("/health"),

  // Auth endpoints
  register: (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; email: string } }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ accessToken: string; user: { id: string; email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getThemes: () => request<Theme[]>("/themes"),
  createTheme: (payload: CreateThemeInput) =>
    request<Theme>("/themes", { method: "POST", body: JSON.stringify(payload) }),
  updateTheme: (id: string, payload: CreateThemeInput) =>
    request<Theme>(`/themes/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTheme: (id: string) => request<void>(`/themes/${id}`, { method: "DELETE" }),

  getSessions: () => request<TrainingSession[]>("/sessions"),
  createSession: (payload: CreateTrainingSessionInput) =>
    request<TrainingSession>("/sessions", { method: "POST", body: JSON.stringify(payload) }),
  getSession: (id: string) => request<TrainingSession>(`/sessions/${id}`),
  updateSession: (id: string, payload: CreateTrainingSessionInput) =>
    request<TrainingSession>(`/sessions/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSession: (id: string) => request<void>(`/sessions/${id}`, { method: "DELETE" }),

  getSessionNotes: (sessionId: string) => request<Note[]>(`/sessions/${sessionId}/notes`),
  createSessionNote: (sessionId: string, payload: CreateNoteInput) =>
    request<Note>(`/sessions/${sessionId}/notes`, { method: "POST", body: JSON.stringify(payload) }),
  updateSessionNote: (sessionId: string, noteId: string, payload: CreateNoteInput) =>
    request<Note>(`/sessions/${sessionId}/notes/${noteId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteSessionNote: (sessionId: string, noteId: string) =>
    request<void>(`/sessions/${sessionId}/notes/${noteId}`, { method: "DELETE" }),

  getWeeklySummary: () => request<WeeklySummary[]>("/summary/week"),

  getTasks: () => request<Task[]>("/tasks"),
  createTask: (payload: CreateTaskInput) =>
    request<Task>("/tasks", { method: "POST", body: JSON.stringify(payload) }),
  updateTask: (id: string, payload: { title?: string; completed?: boolean }) =>
    request<Task>(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: "DELETE" }),
};
