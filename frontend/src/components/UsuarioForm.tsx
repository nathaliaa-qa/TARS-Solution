import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import * as usuariosApi from "../api/usuarios";
import { isCpfValido, limparDigitos, mascararCpf } from "../utils/validators";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const userSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome completo."),
  cpf: z.string().refine(isCpfValido, "Informe um CPF válido."),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
  dataNascimento: z.string().min(1, "Informe a data de nascimento.").refine((date) => new Date(`${date}T00:00:00`) < new Date(), "A data deve estar no passado."),
  role: z.enum(["USER", "ADMIN"]),
});
type UserValues = z.infer<typeof userSchema>;
interface Props { onSucesso: () => void; onCancelar: () => void; }

export function UsuarioForm({ onSucesso, onCancelar }: Props) {
  const queryClient = useQueryClient();
  const form = useForm<UserValues>({ resolver: zodResolver(userSchema), mode: "onChange", defaultValues: { nome: "", cpf: "", senha: "", dataNascimento: "", role: "USER" } });
  const mutation = useMutation({
    mutationFn: (values: UserValues) => usuariosApi.criarUsuario({ ...values, cpf: limparDigitos(values.cpf) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["usuarios"] }); toast.success("Usuário cadastrado com sucesso."); onSucesso(); },
    onError: (error: any) => toast.error(error?.response?.data?.mensagem ?? "Não foi possível criar o usuário."),
  });
  const error = (field: keyof UserValues) => form.formState.errors[field]?.message;

  return <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} noValidate className="form-panel mb-5 space-y-4">
    <div><p className="text-sm font-medium">Novo acesso</p><p className="text-xs text-muted-foreground">Os dados sensíveis serão minimizados nas listagens.</p></div>
    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      <div><Label htmlFor="novoNome">Nome</Label><Input id="novoNome" {...form.register("nome")} aria-invalid={Boolean(error("nome"))} />{error("nome") && <p className="field-error">{error("nome")}</p>}</div>
      <div><Label htmlFor="novoCpf">CPF</Label><Input id="novoCpf" value={mascararCpf(form.watch("cpf"))} onChange={(event) => form.setValue("cpf", event.target.value, { shouldValidate: true })} placeholder="000.000.000-00" inputMode="numeric" maxLength={14} aria-invalid={Boolean(error("cpf"))} />{error("cpf") && <p className="field-error">{error("cpf")}</p>}</div>
    </div>
    <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
      <div><Label htmlFor="novaDataNascimento">Data de nascimento</Label><Input id="novaDataNascimento" type="date" max={new Date().toISOString().split("T")[0]} {...form.register("dataNascimento")} />{error("dataNascimento") && <p className="field-error">{error("dataNascimento")}</p>}</div>
      <div><Label htmlFor="novaSenhaUsuario">Senha</Label><Input id="novaSenhaUsuario" type="password" autoComplete="new-password" {...form.register("senha")} />{error("senha") && <p className="field-error">{error("senha")}</p>}</div>
    </div>
    <div><Label htmlFor="novoRole">Perfil de acesso</Label><select id="novoRole" {...form.register("role")} className="input-select"><option value="USER">Usuário comum</option><option value="ADMIN">Administrador</option></select></div>
    <div className="flex gap-2"><Button type="submit" disabled={!form.formState.isValid || mutation.isPending}>{mutation.isPending ? "Criando..." : "Criar usuário"}</Button><Button type="button" variant="ghost" onClick={onCancelar}>Cancelar</Button></div>
  </form>;
}
