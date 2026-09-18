import axios from "axios";
import type { SystemHealth } from "../types";

const healthUrl = import.meta.env.VITE_HEALTH_URL?.trim();

export const isHealthCheckConfigured = Boolean(healthUrl);

/**
 * Consome somente uma URL de health check configurada pelo ambiente. Não cria um
 * contrato paralelo nem divulga detalhes da infraestrutura para a interface.
 */
export async function consultarHealth(): Promise<SystemHealth> {
  if (!healthUrl) throw new Error("Health check não configurado");

  const { data } = await axios.get(healthUrl, { timeout: 5_000 });
  const rawStatus = String(data?.status ?? "UP").toUpperCase();
  const database = String(data?.components?.db?.status ?? "").toUpperCase();

  return {
    status: rawStatus === "UP" && database !== "DOWN" ? "operational" : "degraded",
    checkedAt: new Date().toISOString(),
    api: rawStatus === "UP" ? "Operacional" : "Degradada",
    database: database ? (database === "UP" ? "Operacional" : "Degradado") : undefined,
  };
}
