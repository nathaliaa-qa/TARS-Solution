import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as usuariosApi from "../api/usuarios";
import { mascararCpf } from "../utils/validators";
import { ocultarCpf } from "../utils/validators";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/ui/table";
import { UsuarioForm } from "../components/UsuarioForm";
import { SystemStatusCard } from "../components/SystemStatusCard";
import { toast } from "sonner";
import { Search, Users, X } from "lucide-react";
import { Input } from "../components/ui/input";
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
} from "../components/ui/alert-dialog";

export function AdminUsuariosPage() {
  const queryClient = useQueryClient();
  const [mostrandoNovoUsuario, setMostrandoNovoUsuario] = useState(false);
  const [busca, setBusca] = useState("");

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: usuariosApi.listarUsuarios,
  });

  const excluir = useMutation({
    mutationFn: (id: number) => usuariosApi.excluirUsuario(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["usuarios"] }); toast.success("Usuário removido."); },
    onError: () => toast.error("Não foi possível remover o usuário."),
  });

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase("pt-BR");
    const digitos = busca.replace(/\D/g, "");
    if (!termo) return usuarios ?? [];
    return (usuarios ?? []).filter((usuario) =>
      usuario.nome.toLocaleLowerCase("pt-BR").includes(termo) ||
      (digitos.length > 0 && usuario.cpf.replace(/\D/g, "").includes(digitos))
    );
  }, [busca, usuarios]);

  if (isLoading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-5">
      <div className="page-heading"><div><p className="eyebrow">ADMINISTRAÇÃO</p><h1>Gestão de usuários</h1><p>Cadastros, perfis e endereços em uma visão segura.</p><div className="metric-row"><span><Users className="h-3.5 w-3.5" /> {usuarios?.length ?? 0} usuários</span><span>{usuarios?.filter((usuario) => usuario.role === "ADMIN").length ?? 0} administradores</span></div></div><SystemStatusCard /></div>
    <Card>
      <CardHeader>
        <CardTitle>Usuários cadastrados</CardTitle>
        {!mostrandoNovoUsuario && (
          <Button size="sm" onClick={() => setMostrandoNovoUsuario(true)}>
            + Novo usuário
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {mostrandoNovoUsuario && (
          <UsuarioForm
            onSucesso={() => setMostrandoNovoUsuario(false)}
            onCancelar={() => setMostrandoNovoUsuario(false)}
          />
        )}
        <div className="mb-4 flex items-center justify-between gap-3 max-sm:flex-col max-sm:items-stretch">
          <div className="search-field">
            <Search className="h-4 w-4" aria-hidden="true" />
            <Input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por nome ou CPF" aria-label="Buscar usuários por nome ou CPF" />
            {busca && <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca"><X className="h-4 w-4" /></button>}
          </div>
          <p className="text-xs text-muted-foreground">{usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? "resultado" : "resultados"}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Endereços</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuariosFiltrados.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell>{usuario.nome}</TableCell>
                <TableCell className="codigo" title={mascararCpf(usuario.cpf)}>{ocultarCpf(usuario.cpf)}</TableCell>
                <TableCell>
                  <Badge className={usuario.role === "ADMIN" ? "role-admin" : "role-user"}>{usuario.role === "ADMIN" ? "Administrador" : "Usuário"}</Badge>
                </TableCell>
                <TableCell>{usuario.enderecos.length}</TableCell>
                <TableCell>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/usuarios/${usuario.id}`}>Ver / gerenciar</Link>
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" disabled={excluir.isPending}>
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{usuario.nome}"? Isso também remove todos os
                            endereços dele. Essa ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => excluir.mutate(usuario.id)}>
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {usuariosFiltrados.length === 0 && (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Nenhum usuário encontrado para esta busca.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
