# 🏗️ Arquitetura do Sistema

## Princípios Fundamentais

1. **Separação de responsabilidades** — UI não conhece o banco; serviços não conhecem UI
2. **Feature-first** — cada domínio tem sua própria pasta isolada em `features/`
3. **Tipos em todo lugar** — TypeScript estrito, zero `any`
4. **Sem arquivos gigantes** — máximo ~200 linhas por arquivo
5. **Nomes claros** — sem abreviações obscuras

---

## Estrutura de Pastas

```
src/
├── app/            → Rotas e páginas (Next.js App Router)
├── components/     → UI genérica e reutilizável
├── features/       → Domínios de negócio
├── services/       → Integrações externas (Supabase, APIs)
├── hooks/          → Custom hooks globais
├── utils/          → Funções puras utilitárias
├── types/          → Tipos e interfaces globais
├── config/         → Constantes e configurações
└── styles/         → Estilos globais e tema
```

---

## Fluxo de Dados

```
[Página / Route]
    └─ usa → [Feature Hook]
                └─ chama → [Feature Service]
                               └─ executa → [Supabase Client]
                                                └─ retorna → [Typed Data]
    └─ renderiza → [Feature Component] ou [Shared Component]
```

**Regra de ouro:** a dependência sempre flui de cima para baixo. Uma `feature` NUNCA importa de outra `feature` diretamente — use `types/` globais se precisar compartilhar.

---

## Camadas e Responsabilidades

### `app/` — Roteamento
- Contém apenas páginas e layouts do Next.js
- **Não tem** lógica de negócio
- **Não faz** chamadas diretas ao Supabase
- Apenas compõe components e hooks das features

### `components/` — UI Compartilhada
- Componentes visuais 100% reutilizáveis
- Não conhecem Supabase, Zustand ou regras de negócio
- Subcategorias: `ui/` (átomos), `layout/`, `data-display/`, `feedback/`

### `features/<domínio>/` — Núcleo do Sistema
Cada feature contém:
```
feature/
├── components/     → UI específica do domínio
├── hooks/          → useState/useEffect + lógica
├── services/       → CRUD no Supabase
├── types/          → Interfaces do domínio
├── validations/    → Schemas Zod
└── index.ts        → Exporta apenas o necessário para fora
```

### `services/supabase/` — Acesso ao Banco
- `client.ts` → Supabase para Client Components
- `server.ts` → Supabase para Server Components / Route Handlers
- Middleware gerencia renovação de sessão

### `types/` — Contratos
- `database.types.ts` → Gerado pelo Supabase CLI (não edite manualmente)
- `api.types.ts` → Tipos de resposta padronizados
- `enums.ts` → Enumerações do domínio

### `config/` — Sem Side Effects
- `routes.ts` → Centraliza todas as rotas (nunca strings hardcoded)
- `constants.ts` → Valores fixos do negócio

---

## Convenções de Nomenclatura

| Artefato | Padrão | Exemplo |
|---|---|---|
| Componentes | PascalCase | `PacienteCard.tsx` |
| Hooks | camelCase com `use` | `usePacientes.ts` |
| Services | camelCase | `pacienteService.ts` |
| Types/Interfaces | PascalCase com sufixo | `PacienteDTO`, `PacienteForm` |
| Utils | camelCase | `formatCPF()` |
| Rotas | kebab-case | `/dashboard/pacientes` |
| Constantes | SCREAMING_SNAKE_CASE | `DEFAULT_PAGE_SIZE` |

---

## Decisões de Design

| Decisão | Escolha | Motivo |
|---|---|---|
| Estado global | Zustand | Leve, sem boilerplate, fácil de testar |
| Formulários | React Hook Form + Zod | Performance, validação tipada |
| Componentes base | shadcn/ui | Acessível, personalizável, não é uma lib "caixa preta" |
| Auth | Supabase Auth + Middleware | Integrado ao banco, renovação automática de sessão |
