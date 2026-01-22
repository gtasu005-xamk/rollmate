import { setAccessToken } from "../lib/apiClient";

export async function logout(): Promise<void> {
  // Remove token from storage
  setAccessToken(null);
  
  // Redirect to login
  window.location.href = "/login";
}
