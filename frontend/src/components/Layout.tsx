import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

export function Layout() {
  const { usuario, logout } = useAuth();
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    localStorage.getItem("tars-theme") === "light" ? "light" : "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("light", theme === "light");
    localStorage.setItem("tars-theme", theme);
  }, [theme]);

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <header className="app-header px-6 py-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 font-display text-lg">
          <span className="selo" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="26" height="26">
              <circle cx="20" cy="20" r="18" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 2.6" />
              <path d="M12 16 L20 22 L28 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="12" y="14" width="16" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          <span>TARS <strong>Solution</strong></span>
        </div>
        {usuario && (
          <nav className="flex items-center gap-5 flex-wrap text-sm">
            <NavLink
              to="/perfil"
              className={({ isActive }) =>
                cn(
                  "nav-link",
                  isActive && "nav-link-active"
                )
              }
            >
              Meu perfil
            </NavLink>
            {usuario.role === "ADMIN" && (
              <NavLink
                to="/admin/usuarios"
                className={({ isActive }) =>
                  cn(
                    "nav-link",
                    isActive && "nav-link-active"
                  )
                }
              >
                Usuários
              </NavLink>
            )}
            <span className="flex items-center gap-2 text-muted-foreground">
              {usuario.nome}
              <Badge>{usuario.role}</Badge>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="theme-toggle"
              onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
              aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sair
            </Button>
          </nav>
        )}
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
