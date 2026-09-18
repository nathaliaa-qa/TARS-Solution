import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as enderecosApi from "../api/enderecos";
import { mascararCep } from "../utils/validators";
import type { Endereco } from "../types";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "./ui/alert-dialog";
import { cn } from "../lib/utils";
import { Badge } from "./ui/badge";
import { MapPin, Star } from "lucide-react";
import { toast } from "sonner";

interface Props {
  endereco: Endereco;
  usuarioId: number;
  onEditar: () => void;
  /** Exclusao e restrita ao ADMIN — usuario comum so edita e define o principal. */
  podeExcluir: boolean;
}

export function EnderecoCard({ endereco, usuarioId, onEditar, podeExcluir }: Props) {
  const queryClient = useQueryClient();

  const definirPrincipal = useMutation({
    mutationFn: () => enderecosApi.definirComoPrincipal(endereco.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["enderecos", usuarioId] }); toast.success("Endereço principal atualizado."); },
    onError: () => toast.error("Não foi possível atualizar o endereço principal."),
  });

  const excluir = useMutation({
    mutationFn: () => enderecosApi.excluirEndereco(endereco.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["enderecos", usuarioId] }); toast.success("Endereço excluído."); },
    onError: () => toast.error("Não foi possível excluir o endereço."),
  });

  return (
    <div
      className={cn(
        "address-card relative rounded-xl border bg-card p-4",
        endereco.principal && "address-card-primary"
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
        {endereco.principal && <Badge className="principal-badge"><Star className="mr-1 h-3 w-3 fill-current" /> Principal</Badge>}
      </div>
      <p className="text-sm font-medium mb-1">
        {endereco.logradouro}, {endereco.numero}
        {endereco.complemento ? ` — ${endereco.complemento}` : ""}
      </p>
      <p className="text-sm mb-1">
        {endereco.bairro} · {endereco.cidade} - {endereco.uf}
      </p>
      <p className="text-sm text-muted-foreground mt-2 mb-3">
        CEP <span className="codigo">{mascararCep(endereco.cep)}</span>
      </p>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={onEditar}>
          Editar
        </Button>
        {!endereco.principal && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => definirPrincipal.mutate()}
            disabled={definirPrincipal.isPending}
          >
            {definirPrincipal.isPending ? "Atualizando..." : "Tornar principal"}
          </Button>
        )}

        {podeExcluir && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive" disabled={excluir.isPending}>
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir endereço</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir este endereço? Essa ação não pode ser desfeita.
                  {endereco.principal && " Como é o endereço principal, outro será promovido automaticamente."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => excluir.mutate()}>Excluir</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
