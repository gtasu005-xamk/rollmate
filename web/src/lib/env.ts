export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000",
};

if (!import.meta.env.VITE_API_BASE_URL) {
  console.info("VITE_API_BASE_URL not set — defaulting to http://localhost:3000 for dev");
}
