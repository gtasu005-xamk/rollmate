import type { Theme, CreateThemeInput } from "../domain/theme/model";
import type { TrainingSession, CreateTrainingSessionInput } from "../domain/session/model";

export const API_BASE_URL = "http://192.168.x.x:3000";
// export const API_BASE_URL = "https://YOUR-AZURE-WEBAPP.azurewebsites.net";
// tai myöhemmin kun LAN toimii: "http://192.168.x.x:3000"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  getThemes: () => request<Theme[]>("/themes"),

  createTheme: (payload: CreateThemeInput) =>
    request<Theme>("/themes", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getSessions: () => request<TrainingSession[]>("/sessions"),

  createSession: (payload: CreateTrainingSessionInput) =>
    request<TrainingSession>("/sessions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
