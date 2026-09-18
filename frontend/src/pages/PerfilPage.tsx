import { useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import * as usuariosApi from "../api/usuarios";
import * as enderecosApi from "../api/enderecos";
import { EnderecoCard } from "../components/EnderecoCard";
import { EnderecoForm } from "../components/EnderecoForm";
import { mascararCpf } from "../utils/validators";
import type { Endereco } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

function formatarData(isoDate: string): string {
  const [ano, mes, dia] = isoDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

/**
 * Mostra o perfil e os endereços de um usuário.
 * Sem :id na rota -> mostra o próprio perfil (usa /usuarios/me).
 * Com :id -> usado pelo admin para visualizar/gerenciar o perfil de outro usuário.
 */
export function PerfilPage() {
  const { id } = useParams();
  const { usuario: usuarioLogado, atualizarUsuarioLocal } = useAuth();
  const queryClient = useQueryClient();

  const usuarioId = id ? Number(id) : usuarioLogado!.id;
  const ehProprioPerfil = usuarioId === usuarioLogado!.id;
  // Cadastro e exclusao de endereco sao restritos ao ADMIN (o usuario comum so
  // visualiza, edita e define o principal dos enderecos que ja possui).
  const souAdmin = usuarioLogado!.role === "ADMIN";

  const { data: usuario, isLoading } = useQuery({
    queryKey: ["usuario", usuarioId],
    queryFn: () => (ehProprioPerfil ? usuariosApi.meuPerfil() : usuariosApi.buscarUsuario(usuarioId)),
  });

  const { data: enderecos } = useQuery({
    queryKey: ["enderecos", usuarioId],
    queryFn: () => enderecosApi.listarEnderecos(usuarioId),
    enabled: !!usuario,
  });

  const [mostrandoNovoEndereco, setMostrandoNovoEndereco] = useState(false);
  const [enderecoEmEdicao, setEnderecoEmEdicao] = useState<Endereco | null>(null);

  const [nome, setNome] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [novaDataNascimento, setNovaDataNascimento] = useState("");
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState<string | null>(null);

  const atualizarPerfil = useMutation({
    mutationFn: () =>
      usuariosApi.atualizarUsuario(usuarioId, {
        nome,
        senha: novaSenha || undefined,
        dataNascimento: novaDataNascimento || undefined,
      }),
    onSuccess: (atualizado) => {
      queryClient.invalidateQueries({ queryKey: ["usuario", usuarioId] });
      if (ehProprioPerfil) atualizarUsuarioLocal(atualizado);
      setEditandoPerfil(false);
      setNovaSenha("");
    },
    onError: (err: any) => {
      setErroPerfil(err?.response?.data?.mensagem ?? "Não foi possível atualizar o perfil.");
    },
  });

  function handleSubmitPerfil(e: FormEvent) {
    e.preventDefault();
    setErroPerfil(null);
    if (!nome.trim()) {
      setErroPerfil("Informe o nome.");
      return;
    }
    atualizarPerfil.mutate();
  }

  if (isLoading || !usuario) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle>{ehProprioPerfil ? "Meu perfil" : "Perfil do usuário"}</CardTitle>
          {!editandoPerfil && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setNome(usuario.nome);
                setNovaDataNascimento(usuario.dataNascimento);
                setEditandoPerfil(true);
              }}
            >
              Editar
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editandoPerfil ? (
            <form onSubmit={handleSubmitPerfil} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dataNascimentoPerfil">Data de nascimento</Label>
                <Input
                  id="dataNascimentoPerfil"
                  type="date"
                  value={novaDataNascimento}
                  onChange={(e) => setNovaDataNascimento(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="novaSenha">Nova senha (opcional)</Label>
                <Input
                  id="novaSenha"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Deixe em branco para manter a atual"
                />
              </div>
              {erroPerfil && <p className="text-sm text-destructive">{erroPerfil}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={atualizarPerfil.isPending}>
                  Salvar
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditandoPerfil(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-xs text-muted-foreground">Nome</dt>
              <dd className="font-medium">{usuario.nome}</dd>
              <dt className="text-xs text-muted-foreground">CPF</dt>
              <dd className="codigo">{mascararCpf(usuario.cpf)}</dd>
              <dt className="text-xs text-muted-foreground">Data de nascimento</dt>
              <dd>{formatarData(usuario.dataNascimento)}</dd>
              <dt className="text-xs text-muted-foreground">Tipo</dt>
              <dd>
                <Badge>{usuario.role}</Badge>
              </dd>
            </dl>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereços</CardTitle>
          {souAdmin && !mostrandoNovoEndereco && (
            <Button size="sm" onClick={() => setMostrandoNovoEndereco(true)}>
              + Novo endereço
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {souAdmin && mostrandoNovoEndereco && (
            <EnderecoForm
              usuarioId={usuarioId}
              onSucesso={() => setMostrandoNovoEndereco(false)}
              onCancelar={() => setMostrandoNovoEndereco(false)}
            />
          )}

          {enderecoEmEdicao && (
            <EnderecoForm
              usuarioId={usuarioId}
              enderecoExistente={enderecoEmEdicao}
              onSucesso={() => setEnderecoEmEdicao(null)}
              onCancelar={() => setEnderecoEmEdicao(null)}
            />
          )}

          {enderecos && enderecos.length === 0 && !mostrandoNovoEndereco && (
            <p className="text-sm text-muted-foreground">Nenhum endereço cadastrado ainda.</p>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3 mt-2">
            {enderecos
              ?.filter((e) => e.id !== enderecoEmEdicao?.id)
              .map((endereco) => (
                <EnderecoCard
                  key={endereco.id}
                  endereco={endereco}
                  usuarioId={usuarioId}
                  podeExcluir={souAdmin}
                  onEditar={() => {
                    setMostrandoNovoEndereco(false);
                    setEnderecoEmEdicao(endereco);
                  }}
                />
              ))}
          </div>
        </CardContent>
      </Card>
      {!souAdmin && (
        <p className="text-xs text-muted-foreground -mt-2">
          Criar ou excluir endereços é uma ação exclusiva do administrador — você pode editar
          os seus e escolher qual é o principal.
        </p>
      )}
    </div>
  );
}
