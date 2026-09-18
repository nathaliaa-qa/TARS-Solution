import { apiClient } from "./client";
import type { Endereco, EnderecoFormData } from "../types";

export async function listarEnderecos(usuarioId: number): Promise<Endereco[]> {
  const { data } = await apiClient.get<Endereco[]>(`/usuarios/${usuarioId}/enderecos`);
  return data;
}

export async function criarEndereco(
  usuarioId: number,
  payload: EnderecoFormData
): Promise<Endereco> {
  const { data } = await apiClient.post<Endereco>(`/usuarios/${usuarioId}/enderecos`, payload);
  return data;
}

export async function atualizarEndereco(
  id: number,
  payload: EnderecoFormData
): Promise<Endereco> {
  const { data } = await apiClient.put<Endereco>(`/enderecos/${id}`, payload);
  return data;
}

export async function definirComoPrincipal(id: number): Promise<Endereco> {
  const { data } = await apiClient.patch<Endereco>(`/enderecos/${id}/principal`);
  return data;
}

export async function excluirEndereco(id: number): Promise<void> {
  await apiClient.delete(`/enderecos/${id}`);
}
