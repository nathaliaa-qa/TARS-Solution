import { apiClient } from "./client";
import type { LoginResponse, Usuario } from "../types";

export interface LoginPayload {
  cpf: string;
  senha: string;
}

export interface RegisterPayload {
  nome: string;
  cpf: string;
  senha: string;
  dataNascimento: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function registrar(payload: RegisterPayload): Promise<Usuario> {
  const { data } = await apiClient.post<Usuario>("/auth/register", payload);
  return data;
}
