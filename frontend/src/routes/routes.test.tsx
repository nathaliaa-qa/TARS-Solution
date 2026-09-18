import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import type { Usuario } from "../types";

function renderComRota(path: string, guard: "protected" | "admin") {
  const GuardComponent = guard === "protected" ? ProtectedRoute : AdminRoute;

  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>Tela de login</div>} />
          <Route path="/perfil" element={<div>Perfil privado</div>} />
          <Route element={<GuardComponent />}>
            <Route path={path} element={<div>Conteúdo protegido</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

function usuarioFalso(overrides: Partial<Usuario> = {}): Usuario {
  return {
    id: 1,
    nome: "Usuário de Teste",
    cpf: "52998224725",
    dataNascimento: "1990-01-01",
    role: "USER",
    enderecos: [],
    ...overrides,
  };
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("redireciona para /login quando não há usuário autenticado", async () => {
    renderComRota("/area-restrita", "protected");

    expect(await screen.findByText("Tela de login")).toBeInTheDocument();
  });

  it("mostra o conteúdo quando há um usuário autenticado no localStorage", async () => {
    localStorage.setItem("usuario", JSON.stringify(usuarioFalso()));

    renderComRota("/area-restrita", "protected");

    expect(await screen.findByText("Conteúdo protegido")).toBeInTheDocument();
  });
});

describe("AdminRoute", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("redireciona usuário comum para /perfil, mesmo autenticado", async () => {
    localStorage.setItem("usuario", JSON.stringify(usuarioFalso({ role: "USER" })));

    renderComRota("/admin/usuarios", "admin");

    expect(await screen.findByText("Perfil privado")).toBeInTheDocument();
  });

  it("libera o conteúdo para ADMIN", async () => {
    localStorage.setItem("usuario", JSON.stringify(usuarioFalso({ role: "ADMIN" })));

    renderComRota("/admin/usuarios", "admin");

    expect(await screen.findByText("Conteúdo protegido")).toBeInTheDocument();
  });
});
