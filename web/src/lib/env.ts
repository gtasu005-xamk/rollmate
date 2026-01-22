export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || "/",
};

if (!import.meta.env.VITE_API_BASE_URL) {
  console.info("VITE_API_BASE_URL not set — using / (same origin proxy)");
}
