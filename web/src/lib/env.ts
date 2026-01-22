// Production: direct backend URL (Free tier Static Web Apps doesn't support proxy)
// Local dev: Vite proxy handles routing
export const env = {
  apiBaseUrl: typeof window !== "undefined" && window.location.hostname.includes("azurestaticapps.net")
    ? "https://rollmate-swe-dev-api.azurewebsites.net"
    : "",
};
