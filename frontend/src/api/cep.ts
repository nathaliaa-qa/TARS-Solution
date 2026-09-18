import { apiClient } from "./client";
import type { CepInfo } from "../types";

export async function buscarCep(cep: string): Promise<CepInfo> {
  const cepLimpo = cep.replace(/\D/g, "");
  const { data } = await apiClient.get<CepInfo>(`/cep/${cepLimpo}`);
  return data;
}
