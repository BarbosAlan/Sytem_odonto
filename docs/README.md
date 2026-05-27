# 🦷 Sistema Odontológico

Sistema de gestão para clínicas odontológicas. Desenvolvido com **Next.js 14**, **Supabase** e **TypeScript**.

## Funcionalidades

- 👥 **Pacientes** — Cadastro completo com histórico
- 📅 **Agendamentos** — Agenda visual com conflito de horários
- 📋 **Prontuários** — Histórico clínico por paciente
- 🦷 **Tratamentos** — Planos de tratamento com acompanhamento
- 💰 **Financeiro** — Controle de receitas, despesas e cobranças
- 🔐 **Autenticação** — Login seguro via Supabase Auth

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript 5+ |
| Estilização | Tailwind CSS + shadcn/ui |
| Back-end | Supabase (PostgreSQL + Auth + Storage) |
| Estado | Zustand |
| Formulários | React Hook Form + Zod |
| Testes | Vitest + Testing Library |

## Documentação

- [Arquitetura](./ARCHITECTURE.md)
- [Banco de Dados](./DATABASE.md)
- [Funcionalidades](./FEATURES.md)
- [Setup Local](./SETUP.md)

## Início Rápido

```bash
# 1. Clone e instale
npm install

# 2. Configure o ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais Supabase

# 3. Rode o projeto
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
