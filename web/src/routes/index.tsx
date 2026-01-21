import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/AppShell";
import ProtectedRoute from "./ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import SessionPage from "../pages/SessionPage";
import SessionDetailPage from "../pages/SessionDetailPage";
import ThemesPage from "../pages/ThemesPage";
import TasksPage from "../pages/TasksPage";
// import SummaryPage from "../pages/SummaryPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: "sessions", element: <SessionPage /> },
      { path: "sessions/:id", element: <SessionDetailPage /> },
      { path: "themes", element: <ThemesPage /> },
      { path: "tasks", element: <TasksPage /> },
      // { path: "summary", element: <SummaryPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
