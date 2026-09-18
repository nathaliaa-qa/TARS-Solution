import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isCpfValido, mascararCpf } from "../utils/validators";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
// Novos imports para o calendário moderno
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { cn } from "../lib/utils";
import { CalendarIcon } from "lucide-react";

export function RegisterPage() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>(undefined);
  const [carregando, setCarregando] = useState(false);

  // Estados de erro individuais por campo
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroCpf, setErroCpf] = useState<string | null>(null);
  const [erroData, setErroData] = useState<string | null>(null);
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [erroConfirmarSenha, setErroConfirmarSenha] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setErroNome(null);
    setErroData(null);
    setErroSenha(null);
    setErroConfirmarSenha(null);

    let temErro = false;

    if (!nome.trim()) {
      setErroNome("Informe seu nome.");
      temErro = true;
    }
    if (!isCpfValido(cpf.replace(/\D/g, ""))) {
      setErroCpf("CPF inválido.");
      temErro = true;
    }

    if (!dataNascimento) {
      setErroData("Informe sua data de nascimento.");
      temErro = true;
    } else {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      if (dataNascimento >= hoje) {
        setErroData("Data de nascimento deve estar no passado.");
        temErro = true;
      }
    }

    if (senha.length < 6) {
      setErroSenha("A senha deve ter ao menos 6 caracteres.");
      temErro = true;
    }
    if (senha !== confirmarSenha) {
      setErroConfirmarSenha("As senhas não coincidem.");
      temErro = true;
    }

    if (temErro) return;

    setCarregando(true);
    try {
      // Formata a data para string YYYY-MM-DD que o backend exige
      const dataFormatadaString = dataNascimento ? format(dataNascimento, "yyyy-MM-dd") : "";

      await registrar(nome, cpf.replace(/\D/g, ""), senha, dataFormatadaString);
      navigate("/perfil");
    } catch (err: any) {
      const mensagem = err?.response?.data?.mensagem ?? err?.response?.data ?? "Erro ao realizar cadastro.";
      setErroCpf(typeof mensagem === "string" ? mensagem : "CPF já cadastrado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-14 bg-card border border-border rounded-lg shadow-sm p-8">
      <h1 className="mb-6 text-xl font-bold">Criar conta</h1>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* NOME */}
        <div className="space-y-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setErroNome(null); }}
            required
          />
          {erroNome && <p className="text-xs text-destructive">{erroNome}</p>}
        </div>

        {/* CPF */}
        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={mascararCpf(cpf)}
            onChange={(e) => { setCpf(e.target.value); setErroCpf(null); }}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
          />
          {erroCpf && <p className="text-xs text-destructive">{erroCpf}</p>}
        </div>

        {/* DATA DE NASCIMENTO (POPOVER + CALENDAR SHADCN) */}
        <div className="space-y-1.5 flex flex-col">
          <Label htmlFor="dataNascimento">Data de nascimento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dataNascimento && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dataNascimento ? format(dataNascimento, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : <span>Selecione a data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dataNascimento}
                onSelect={(date) => {
                  setDataNascimento(date);
                  setErroData(null);
                }}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                captionLayout="dropdown-buttons"
                fromYear={1900}
                toYear={new Date().getFullYear()}
                defaultMonth={dataNascimento ?? new Date()}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          {erroData && <p className="text-xs text-destructive">{erroData}</p>}
        </div>

        {/* SENHA */}
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErroSenha(null); }}
            required
          />
          {erroSenha && <p className="text-xs text-destructive">{erroSenha}</p>}
        </div>

        {/* CONFIRMAR SENHA */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmarSenha">Confirmar senha</Label>
          <Input
            id="confirmarSenha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => { setConfirmarSenha(e.target.value); setErroConfirmarSenha(null); }}
            required
          />
          {erroConfirmarSenha && <p className="text-xs text-destructive">{erroConfirmarSenha}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={carregando}>
          {carregando ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-center text-muted-foreground">
        Já tem conta? <Link to="/login" className="text-primary underline-offset-4 hover:underline">Entrar</Link>
      </p>
    </div>
  );
}
