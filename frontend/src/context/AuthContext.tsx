import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import type { Usuario } from "../types";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  login: (cpf: string, senha: string) => Promise<void>;
  registrar: (nome: string, cpf: string, senha: string, dataNascimento: string) => Promise<void>;
  logout: () => void;
  atualizarUsuarioLocal: (usuario: Usuario) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const salvo = localStorage.getItem("usuario");
    if (salvo) {
      try {
        setUsuario(JSON.parse(salvo));
      } catch {
        localStorage.removeItem("usuario");
      }
    }
    setCarregando(false);
  }, []);

  async function login(cpf: string, senha: string) {
    const resposta = await authApi.login({ cpf, senha });
    localStorage.setItem("token", resposta.token);
    localStorage.setItem("usuario", JSON.stringify(resposta.usuario));
    setUsuario(resposta.usuario);
  }

  async function registrar(nome: string, cpf: string, senha: string, dataNascimento: string) {
    await authApi.registrar({ nome, cpf, senha, dataNascimento });
    // Cadastro nao autentica automaticamente: usuario faz login em seguida.
    await login(cpf, senha);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  }

  function atualizarUsuarioLocal(atualizado: Usuario) {
    setUsuario(atualizado);
    localStorage.setItem("usuario", JSON.stringify(atualizado));
  }

  return (
    <AuthContext.Provider
      value={{ usuario, carregando, login, registrar, logout, atualizarUsuarioLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return context;
}
