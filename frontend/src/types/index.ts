export type Role = "ADMIN" | "USER";

export interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  principal: boolean;
}

export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  /** ISO 8601 (yyyy-MM-dd) — como o Jackson serializa LocalDate. */
  dataNascimento: string;
  role: Role;
  enderecos: Endereco[];
}

export interface LoginResponse {
  token: string;
  tipo: string;
  usuario: Usuario;
}

export interface EnderecoFormData {
  cep: string;
  numero: string;
  complemento?: string;
  principal: boolean;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface CepInfo {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
  detalhes?: string[];
}

export type SystemStatus = "operational" | "degraded" | "unavailable" | "checking" | "unconfigured";

export interface SystemHealth {
  status: Exclude<SystemStatus, "checking" | "unconfigured">;
  checkedAt: string;
  api: string;
  database?: string;
}
