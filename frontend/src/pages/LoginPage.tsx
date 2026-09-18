import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mascararCpf } from "../utils/validators";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await login(cpf, senha);
      navigate("/perfil");
    } catch (err: any) {
      setErro(err?.response?.data?.mensagem ?? "CPF ou senha incorretos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-14 bg-card border border-border rounded-lg shadow-sm p-8">
      <h1 className="mb-6">Entrar</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            value={mascararCpf(cpf)}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="000.000.000-00"
            inputMode="numeric"
            maxLength={14}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="senha">Senha</Label>
          <Input
            id="senha"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        {erro && <p className="text-sm text-destructive">{erro}</p>}
        <Button type="submit" className="w-full" disabled={carregando}>
          {carregando ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-5 text-sm text-center text-muted-foreground">
        Ainda não tem conta? <Link to="/registrar" className="text-primary underline-offset-4 hover:underline">Cadastre-se</Link>
      </p>
    </div>
  );
}
