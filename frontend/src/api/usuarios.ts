import { apiClient } from "./client";
import type { Role, Usuario } from "../types";

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await apiClient.get<Usuario[]>("/usuarios");
  return data;
}

export async function buscarUsuario(id: number): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>(`/usuarios/${id}`);
  return data;
}

export async function meuPerfil(): Promise<Usuario> {
  const { data } = await apiClient.get<Usuario>("/usuarios/me");
  return data;
}

/** Criação de usuário pelo ADMIN (diferente do /auth/register público — aqui dá pra escolher o papel). */
export async function criarUsuario(payload: {
  nome: string;
  cpf: string;
  senha: string;
  dataNascimento: string;
  role: Role;
}): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>("/usuarios", payload);
  return data;
}

export async function atualizarUsuario(
  id: number,
  payload: { nome: string; senha?: string; dataNascimento?: string }
): Promise<Usuario> {
  const { data } = await apiClient.put<Usuario>(`/usuarios/${id}`, payload);
  return data;
}

export async function excluirUsuario(id: number): Promise<void> {
  await apiClient.delete(`/usuarios/${id}`);
}
