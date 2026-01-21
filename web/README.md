# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    # Web — Development README

    This project is the web frontend for Rollmate (Vite + React + TypeScript). The web app uses the same backend API and data contracts as the mobile app.

    Prerequisites
    - Node.js 18+ and npm
    - Backend running locally at `http://localhost:3000` for development

    Quick start (local dev)

    1) Start the backend (from repo root):

    ```bash
    cd backend
    npm install
    npm run dev
    ```

    2) Start the web dev server (in a separate terminal):

    ```bash
    cd web
    npm install
    npm run dev
    ```

    Environment
    - The web client reads `VITE_API_BASE_URL` (see `web/src/lib/env.ts`). If not set, it defaults to `http://localhost:3000` in development.
    - Optionally create `web/.env`:

    ```
    VITE_API_BASE_URL=http://localhost:3000
    ```

    Dev conveniences
    - `vite.config.ts` contains a dev `proxy` forwarding `/sessions`, `/themes`, `/health`, and `/summary` to the local backend so same-origin fetches work while developing.

    Verification
    - Open the app in the browser (default `http://localhost:5173`) and confirm it loads.
    - Verify the backend health endpoint:

    ```bash
    # from terminal
    curl http://localhost:3000/health

    # from the browser console
    fetch('/health').then(r => r.json()).then(console.log).catch(console.error)
    ```

    Troubleshooting
    - CORS: backend allows `http://localhost:5173` by default (`backend/src/app.ts`). If you run the frontend on another origin, add it to backend CORS `origin`.
    - If web can't reach backend while backend is running, ensure firewall isn't blocking port `3000` and that `node` process is listening on localhost.

    Next steps
    - Implement Sessions list/create UI and integrate with `web/src/lib/apiClient.ts`.
    - Run integration tests listed in the project checklist.

    If you want, I can now implement the Sessions list + create flow in `web`.
