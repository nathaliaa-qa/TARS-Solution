# TARS Solution — Cadastro de Usuários e Endereços

Aplicação full-stack para cadastro de usuários e gerenciamento de múltiplos endereços por usuário, com autenticação, controle de acesso por papel e preenchimento automático de endereço via ViaCEP.

Desenvolvida como teste técnico para a vaga de Analista de Sustentação, com identidade visual inspirada em painéis corporativos de observabilidade (tema escuro por padrão, com alternância para tema claro).

## Stack

**Backend**: Java 17, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA, Spring Boot Actuator (health check), PostgreSQL, Caffeine (cache)

**Frontend**: React 18, TypeScript, Vite, TanStack React Query, React Hook Form + Zod, Axios, Tailwind CSS + shadcn/ui, Sonner (notificações)

## Como rodar

**Backend** (dentro de `backend/`):
```bash
# Banco: crie um PostgreSQL local com um database chamado cadastro_usuarios
export DB_URL=jdbc:postgresql://localhost:5432/cadastro_usuarios
export DB_USER=postgres
export DB_PASSWORD=postgres
./mvnw spring-boot:run
```

**Frontend** (dentro de `frontend/`):
```bash
npm install
npm run dev
```
Em desenvolvimento, o Vite já faz proxy de `/api` para `http://localhost:8080`, então normalmente não é preciso configurar `.env`. Se precisar, copie `.env.example` para `.env`.

### Usuário administrador padrão (ambiente de dev)

Criado automaticamente no primeiro start do backend:
- **CPF**: `000.000.000-00`
- **Senha**: `admin123`

## Variáveis de ambiente

| Variável | Onde | Descrição | Padrão (dev) |
|---|---|---|---|
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | backend | Conexão com o PostgreSQL | `localhost:5432/cadastro_usuarios`, `postgres`, `postgres` |
| `JWT_SECRET` | backend | Chave HMAC (base64) para assinar os tokens | valor de desenvolvimento incluso — **troque em produção** |
| `JWT_EXPIRATION_MS` | backend | Validade do token em ms | `86400000` (24h) |
| `VITE_API_URL` | frontend | URL base da API | `http://localhost:8080` |
| `VITE_HEALTH_URL` | frontend | URL do health check consumido pelo widget "Status do Sistema" | `http://localhost:8080/actuator/health` |

## Requisitos do desafio — status

### Cadastro de usuários
- [x] Nome, CPF, Data de nascimento, Senha
- [x] CPF em formato válido (dígito verificador)
- [x] CPF único

### Controle de acesso

| | Administrador | Usuário comum |
|---|:---:|:---:|
| Visualizar todos os usuários | ✅ | — |
| Visualizar todos os endereços | ✅ | — |
| Visualizar/editar apenas os próprios dados | ✅ | ✅ |
| Cadastrar usuários | ✅ | — |
| Cadastrar endereços | ✅ | — |
| Editar endereços | ✅ | ✅ (apenas os próprios) |
| Excluir endereços | ✅ | — |
| Definir endereço principal | ✅ | ✅ (apenas os próprios) |

Cadastro e exclusão de endereço são exclusivos do Administrador — leitura literal do documento do desafio, que lista essas duas ações apenas entre as permissões do Administrador. Todas as regras de acesso são garantidas no **backend** (`@PreAuthorize` + verificação de posse do recurso), não apenas escondidas na interface.

### Autenticação
- [x] Login com CPF + senha, token JWT

### Gerenciamento de endereços
- [x] CEP, Número, Complemento (opcional), Logradouro, Bairro, Cidade, Estado
- [x] Preenchimento automático via ViaCEP ao informar o CEP
- [x] Múltiplos endereços por usuário, apenas um principal
- [x] Trocar o principal desmarca o anterior automaticamente
- [x] Excluir o principal promove outro endereço automaticamente
- [x] Cache evita consultas repetidas à API ViaCEP (Caffeine no backend, TTL 24h + React Query no frontend)
- [x] **Resiliência**: se a ViaCEP estiver indisponível, o formulário permite preencher o endereço manualmente e o backend aceita esses dados como fallback, em vez de bloquear o cadastro inteiro

### Frontend
- [x] React + TypeScript
- [x] Formulários com validação reativa (Zod + React Hook Form), notificações via Sonner
- [x] Autofill de CEP com feedback visual (loading, transição ao confirmar, aviso quando a ViaCEP falha)
- [x] Listagem de usuários (admin) e de endereços por usuário
- [x] CPF mascarado (parcialmente oculto na listagem geral, por governança de dados)
- [x] Interface responsiva, tema escuro/claro

### Backend
- [x] Java + Spring Boot
- [x] Criar, listar e buscar usuários; criar, atualizar e excluir endereços
- [x] Regras de negócio garantidas no backend

### Banco de dados
- [x] PostgreSQL (relacional), modelado via JPA

### Integração
- [x] Axios para comunicação HTTP

### Entrega
- [x] Repositório público, frontend e backend no mesmo repo, README com descrição e instruções

## Diferenciais

| Diferencial | Status | Onde |
|---|---|---|
| React Query | ✅ | Cache de CEP e sincronização de mutações em todas as telas que buscam/alteram dados |
| shadcn/ui | ✅ | `frontend/src/components/ui/` |
| Backend em camadas | ✅ | `controller → service → repository`, DTOs isolando a API do modelo JPA |
| Tratamento de erros da API | ✅ | `GlobalExceptionHandler` centralizado, resposta padronizada |

## Widget "Status do Sistema"

No painel administrativo, um indicador discreto consome o health check real do backend (`GET /actuator/health`, do Spring Boot Actuator) — sem dado simulado.
Estados: Operacional, Degradado, Indisponível, Verificando. Reconsulta automaticamente e permite retestar manualmente.

## Estrutura do repositório

```
.
├── backend/     # API REST — Spring Boot
├── frontend/    # SPA — React
