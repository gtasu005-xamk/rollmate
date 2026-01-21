import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setAccessToken } from "../lib/apiClient";
import type { CSSProperties } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = isLogin ? await api.login(email, password) : await api.register(email, password);
      setAccessToken(result.accessToken);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Rollmate</h1>
        <div style={styles.form}>
          <h2 style={styles.heading}>{isLogin ? "Kirjaudu sisään" : "Rekisteröidy"}</h2>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Sähköposti</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="example@email.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Salasana</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? "Ladataan…" : isLogin ? "Kirjaudu sisään" : "Rekisteröidy"}
            </button>
          </form>

          <div style={styles.toggle}>
            <span style={styles.toggleText}>
              {isLogin ? "Ei vielä tiliä?" : "Sinulla on jo tili?"}
            </span>
            <button type="button" onClick={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
              {isLogin ? "Rekisteröidy" : "Kirjaudu sisään"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: 16,
  },
  container: {
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontFamily: '"Bebas Neue", system-ui, sans-serif',
    fontSize: "45",
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 32,
    color: "#fff",
  },
  form: {
    background: "#151516",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 24,
  },
  heading: {
    fontSize: "1.5rem",
    marginBottom: 16,
    color: "#fff",
  },
  error: {
    background: "rgba(255, 107, 107, 0.1)",
    color: "#ff6b6b",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: "0.9rem",
  },
  formGroup: {
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
  },
  label: {
    marginBottom: 6,
    fontSize: "0.9rem",
    fontWeight: 500,
    color: "rgba(255, 255, 255, 0.9)",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "#2a2a2b",
    color: "#fff",
    fontSize: "1rem",
    fontFamily: "inherit",
  },
  submitButton: {
    width: "100%",
    marginTop: 8,
  },
  toggle: {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "center",
    textAlign: "center",
  },
  toggleText: {
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.65)",
  },
  toggleButton: {
    background: "transparent",
    color: "#4da3ff",
    border: "none",
    padding: 0,
    cursor: "pointer",
    textDecoration: "underline",
  },
};
