import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h1 style={{ margin: 0 }}>404</h1>
      <p style={{ margin: 0, opacity: 0.9 }}>Page not found.</p>
      <div>
        <Link to="/">Go home</Link>
      </div>
    </div>
  );
}
