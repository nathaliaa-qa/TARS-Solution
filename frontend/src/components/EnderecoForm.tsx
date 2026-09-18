import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, MapPin, WifiOff } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { buscarCep } from "../api/cep";
import * as enderecosApi from "../api/enderecos";
import type { Endereco } from "../types";
import { isCepValido, limparDigitos, mascararCep } from "../utils/validators";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const enderecoSchema = z.object({
  cep: z.string().refine(isCepValido, "Informe um CEP com 8 dígitos."),
  numero: z.string().trim().min(1, "Informe o número."),
  complemento: z.string().trim().optional(),
  principal: z.boolean(),
  logradouro: z.string().trim().min(1, "Informe o logradouro."),
  bairro: z.string().trim().min(1, "Informe o bairro."),
  cidade: z.string().trim().min(1, "Informe a cidade."),
  uf: z.string().trim().length(2, "Informe a UF."),
});
type EnderecoValues = z.infer<typeof enderecoSchema>;

interface Props { usuarioId: number; enderecoExistente?: Endereco; onSucesso: () => void; onCancelar?: () => void; }

/** CEP é cacheado no React Query e no proxy Spring/Caffeine, evitando tráfego redundante. */
export function EnderecoForm({ usuarioId, enderecoExistente, onSucesso, onCancelar }: Props) {
  const queryClient = useQueryClient();
  const form = useForm<EnderecoValues>({
    resolver: zodResolver(enderecoSchema), mode: "onChange",
    defaultValues: { cep: enderecoExistente?.cep ?? "", numero: enderecoExistente?.numero ?? "", complemento: enderecoExistente?.complemento ?? "", principal: enderecoExistente?.principal ?? false, logradouro: enderecoExistente?.logradouro ?? "", bairro: enderecoExistente?.bairro ?? "", cidade: enderecoExistente?.cidade ?? "", uf: enderecoExistente?.uf ?? "" },
  });
  const cep = form.watch("cep");
  const cepLimpo = limparDigitos(cep);
  const cepCompleto = cepLimpo.length === 8;
  const cepQuery = useQuery({ queryKey: ["cep", cepLimpo], queryFn: () => buscarCep(cepLimpo), enabled: cepCompleto, staleTime: 86_400_000, gcTime: 86_400_000, retry: 1 });

  useEffect(() => {
    if (!cepQuery.data) return;
    form.setValue("logradouro", cepQuery.data.logradouro, { shouldValidate: true });
    form.setValue("bairro", cepQuery.data.bairro, { shouldValidate: true });
    form.setValue("cidade", cepQuery.data.localidade, { shouldValidate: true });
    form.setValue("uf", cepQuery.data.uf, { shouldValidate: true });
  }, [cepQuery.data, form]);

  const mutation = useMutation({
    mutationFn: (values: EnderecoValues) => {
      const payload = { ...values, cep: limparDigitos(values.cep) };
      return enderecoExistente ? enderecosApi.atualizarEndereco(enderecoExistente.id, payload) : enderecosApi.criarEndereco(usuarioId, payload);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["enderecos", usuarioId] }); toast.success(enderecoExistente ? "Endereço atualizado." : "Endereço cadastrado."); onSucesso(); },
    onError: (error: any) => toast.error(error?.response?.data?.mensagem ?? "Não foi possível salvar o endereço."),
  });

  const manualMode = cepCompleto && cepQuery.isError;
  const fieldError = (field: keyof EnderecoValues) => form.formState.errors[field]?.message;
  return (
    <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="form-panel space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3"><MapPin className="h-4 w-4 text-cyan-400" /><div><p className="text-sm font-medium">{enderecoExistente ? "Atualizar endereço" : "Novo endereço"}</p><p className="text-xs text-muted-foreground">Consulta de CEP com cache inteligente</p></div></div>
      <div className="space-y-1.5"><Label htmlFor="cep">CEP</Label><div className="relative max-w-xs"><Input id="cep" value={mascararCep(cep)} onChange={(event) => form.setValue("cep", event.target.value, { shouldValidate: true })} placeholder="00000-000" inputMode="numeric" maxLength={9} aria-invalid={Boolean(fieldError("cep"))} />{cepQuery.isFetching && <LoaderCircle className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-cyan-400" aria-label="Buscando CEP" />}</div>{fieldError("cep") && <p className="field-error">{fieldError("cep")}</p>}{cepQuery.isSuccess && <p className="field-success">Endereço localizado e aplicado ao formulário.</p>}</div>
      {manualMode && <div className="manual-fallback" role="status"><WifiOff className="h-4 w-4 shrink-0" /><span><strong>Serviço de CEP instável.</strong> Preencha os dados manualmente para continuar.</span></div>}
      {(cepQuery.isSuccess || manualMode || Boolean(enderecoExistente)) && <div className="grid grid-cols-6 gap-3 address-fields"><div className="col-span-6 md:col-span-4"><Label htmlFor="logradouro">Logradouro</Label><Input id="logradouro" {...form.register("logradouro")} readOnly={!manualMode} className={!manualMode ? "autofilled" : ""} />{manualMode && <p className="field-error">{fieldError("logradouro")}</p>}</div><div className="col-span-6 md:col-span-2"><Label htmlFor="bairro">Bairro</Label><Input id="bairro" {...form.register("bairro")} readOnly={!manualMode} className={!manualMode ? "autofilled" : ""} />{manualMode && <p className="field-error">{fieldError("bairro")}</p>}</div><div className="col-span-5"><Label htmlFor="cidade">Cidade</Label><Input id="cidade" {...form.register("cidade")} readOnly={!manualMode} className={!manualMode ? "autofilled" : ""} />{manualMode && <p className="field-error">{fieldError("cidade")}</p>}</div><div className="col-span-1"><Label htmlFor="uf">UF</Label><Input id="uf" maxLength={2} {...form.register("uf")} readOnly={!manualMode} className={!manualMode ? "autofilled uppercase" : "uppercase"} />{manualMode && <p className="field-error">{fieldError("uf")}</p>}</div></div>}
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1"><div className="space-y-1.5"><Label htmlFor="numero">Número</Label><Input id="numero" {...form.register("numero")} placeholder="123" aria-invalid={Boolean(fieldError("numero"))} />{fieldError("numero") && <p className="field-error">{fieldError("numero")}</p>}</div><div className="space-y-1.5"><Label htmlFor="complemento">Complemento <span className="text-muted-foreground">(opcional)</span></Label><Input id="complemento" {...form.register("complemento")} placeholder="Sala, bloco, andar" /></div></div>
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={form.watch("principal")} onCheckedChange={(value) => form.setValue("principal", value === true)} /> Definir como endereço principal</label>
      <div className="flex gap-2"><Button type="submit" disabled={!form.formState.isValid || mutation.isPending}>{mutation.isPending ? "Salvando..." : "Salvar endereço"}</Button>{onCancelar && <Button type="button" variant="ghost" onClick={onCancelar}>Cancelar</Button>}</div>
    </form>
  );
}
