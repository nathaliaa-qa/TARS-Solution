import { useQuery } from "@tanstack/react-query";
import { Activity, CircleAlert, RefreshCw } from "lucide-react";
import { consultarHealth, isHealthCheckConfigured } from "../api/health";
import type { SystemStatus } from "../types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const labels: Record<SystemStatus, string> = {
  operational: "Operacional",
  degraded: "Degradado",
  unavailable: "Indisponível",
  checking: "Verificando...",
  unconfigured: "Não configurado",
};

export function SystemStatusCard() {
  const health = useQuery({
    queryKey: ["system-health"],
    queryFn: consultarHealth,
    enabled: isHealthCheckConfigured,
    retry: 0,
    refetchInterval: 60_000,
  });

  const status: SystemStatus = !isHealthCheckConfigured
    ? "unconfigured"
    : health.isPending
      ? "checking"
      : health.isError
        ? "unavailable"
        : health.data?.status ?? "unavailable";

  return (
    <Card className="system-status-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-2.5">
            <Activity className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium">Status do sistema</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {status === "unconfigured"
                  ? "Configure VITE_HEALTH_URL para habilitar a verificação."
                  : "Sinalização baseada no health check da infraestrutura."}
              </p>
            </div>
          </div>
          <span className={`status-dot status-${status}`}><span aria-hidden="true">●</span> {labels[status]}</span>
        </div>

        {health.data && (
          <div className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs text-muted-foreground">
            <span>API <strong className="ml-1 font-medium text-foreground">{health.data.api}</strong></span>
            {health.data.database && <span>Banco <strong className="ml-1 font-medium text-foreground">{health.data.database}</strong></span>}
            <span className="col-span-2">Última verificação {new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(health.data.checkedAt))}</span>
          </div>
        )}

        {health.isError && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><CircleAlert className="h-3.5 w-3.5" /> Não foi possível verificar agora.</span>
            <Button size="sm" variant="ghost" onClick={() => health.refetch()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Retestar</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
