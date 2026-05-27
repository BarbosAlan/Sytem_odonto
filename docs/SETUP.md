# ⚙️ Setup Local

## Pré-requisitos

- Node.js 18+
- npm 9+
- Conta no [Supabase](https://supabase.com) (gratuita)

---

## 1. Clone e Instale

```bash
cd sistema_odonto
npm install
```

---

## 2. Configure o Supabase

### Crie um projeto no Supabase
1. Acesse https://supabase.com/dashboard
2. Clique em **New Project**
3. Anote o **Project URL** e a **anon key** em Settings → API

### Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```

---

## 3. Crie as Tabelas no Banco

No **SQL Editor** do Supabase, execute os scripts em ordem:

> Os scripts de migração serão adicionados em `supabase/migrations/` conforme o desenvolvimento avança.

Por ora, consulte [DATABASE.md](./DATABASE.md) para o schema completo.

---

## 4. Gere os Tipos TypeScript

```bash
npx supabase gen types typescript --project-id SEU_PROJECT_ID > src/types/database.types.ts
```

---

## 5. Rode o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Inicia o build de produção |
| `npm run lint` | Verifica linting |
| `npm run test` | Roda os testes |
| `npm run test:watch` | Testes em modo watch |

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave pública (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Chave privada (server-side only) |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL da aplicação |
