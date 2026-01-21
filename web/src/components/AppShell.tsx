import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, type CSSProperties } from "react";
import {  setAccessToken } from "../lib/apiClient";

export default function AppShell() {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
    const mq = window.matchMedia("(max-width: 600px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    try {
      mq.addEventListener("change", handler);
    } catch {
      mq.addListener(handler as any);
    }
    return () => {
      try {
        mq.removeEventListener("change", handler);
      } catch {
        mq.removeListener(handler as any);
      }
    };
  }, []);

function closeMenu() {
  setMenuOpen(false);
  }

function handleLogout() {
  setAccessToken(null);
  navigate("/login");
  }

  return (
    <div style={styles.shell}>
    <header style={styles.header}>
      <NavLink to="/" end style={{ textDecoration: "none", color: "inherit" }}>
        <div style={styles.brand}>Rollmate</div>
      </NavLink>

        {isMobile ? (
          <div>
            <button aria-label="Avaa valikko" onClick={() => setMenuOpen((s) => !s)} style={styles.hamburger}>
              ☰
            </button>
          </div>
        ) : (
          <nav style={styles.nav}>
            {/* LOGO HOME LINK */}
            <NavLink to="/sessions" style={navLinkStyle}>
              Harjoitukset
            </NavLink>
            <NavLink to="/tasks" style={navLinkStyle}>
              Tehtävät
            </NavLink>
            <NavLink to="/themes" style={navLinkStyle}>
              Teemat
            </NavLink>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Kirjaudu ulos
            </button>
          </nav>
        )}
      </header>

      {isMobile && menuOpen && (
        <div style={styles.mobileOverlay} onClick={closeMenu}>
          <nav style={styles.mobileMenu} onClick={(e) => e.stopPropagation()}>
            <NavLink to="/sessions" style={navLinkStyle} onClick={closeMenu}>
              Harjoitukset
            </NavLink>
            <NavLink to="/tasks" style={navLinkStyle} onClick={closeMenu}>
              Tehtävät
            </NavLink>
            <NavLink to="/themes" style={navLinkStyle} onClick={closeMenu}>
              Teemat
            </NavLink>
            <button onClick={handleLogout} style={styles.logoutButton}>
              Kirjaudu ulos
            </button>
          </nav>
        </div>
      )}

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

const navLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  ...styles.link,
  ...(isActive ? styles.linkActive : null),
    
});

const styles: Record<string, CSSProperties> = {

  shell: {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.12)",
  },
  brand: {
    fontWeight: 700,
    letterSpacing: 0.2,
    fontFamily: '"Bebas Neue", system-ui, Avenir, Helvetica, Arial, sans-serif',
    fontSize: 45,
  },
  nav: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  link: {
    padding: "6px 10px",
    borderRadius: 8,
    color: "#fff",
    textDecoration: "none",
  },
  linkActive: {
    outline: "1px solid rgba(255,255,255,0.25)",
  },
  main: {
    padding: "16px",
    flex: 1,
  },
  hamburger: {
    fontSize: 24,
    padding: "6px 10px",
    borderRadius: 8,
    border: "none",
    background: "transparent",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    background: "transparent",
    color: "#ff6b6b",
    border: "1px solid rgba(255, 107, 107, 0.3)",
    padding: "6px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  mobileOverlay: {
    position: "fixed",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "flex-end",
  },
  mobileMenu: {
    width: 260,
    background: "#151516",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
  },
};
