# 🗄️ Schema do Banco de Dados

Banco: **PostgreSQL via Supabase**

> ⚠️ Após criar as tabelas no Supabase, regenere os tipos com:
> ```bash
> npx supabase gen types typescript --project-id <SEU_PROJECT_ID> > src/types/database.types.ts
> ```

---

## Tabelas

### `pacientes`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | Gerado automaticamente |
| nome | text NOT NULL | Nome completo |
| cpf | text UNIQUE | CPF (somente números) |
| data_nascimento | date | Data de nascimento |
| telefone | text | Telefone principal |
| email | text | E-mail |
| endereco | jsonb | Objeto com rua, bairro, cidade, UF, CEP |
| convenio_id | uuid FK | Referência ao convênio |
| observacoes | text | Observações gerais |
| ativo | boolean DEFAULT true | Soft delete |
| created_at | timestamptz | Criação automática |
| updated_at | timestamptz | Atualização automática |

### `agendamentos`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | |
| dentista_id | uuid FK → auth.users | |
| data_hora | timestamptz NOT NULL | Data e hora do início |
| duracao_minutos | integer DEFAULT 60 | |
| status | enum | agendado/confirmado/realizado/cancelado/falta |
| tipo_consulta | text | Ex: retorno, emergência, limpeza |
| observacoes | text | |

### `prontuarios`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | |
| dentista_id | uuid FK → auth.users | |
| data_atendimento | date NOT NULL | |
| anamnese | text | Histórico de saúde |
| queixa_principal | text | Motivo da consulta |
| diagnostico | text | |
| procedimentos_realizados | jsonb | Array de procedimentos |
| observacoes | text | |

### `tratamentos`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | |
| dentista_id | uuid FK → auth.users | |
| descricao | text NOT NULL | |
| status | enum | planejado/em_andamento/concluido/cancelado |
| valor_total | numeric(10,2) | |
| data_inicio | date | |
| data_conclusao | date | |

### `financeiro`
| Coluna | Tipo | Descrição |
|---|---|---|
| id | uuid PK | |
| paciente_id | uuid FK → pacientes | |
| tratamento_id | uuid FK → tratamentos | Opcional |
| tipo | enum | receita/despesa |
| descricao | text NOT NULL | |
| valor | numeric(10,2) NOT NULL | |
| status | enum | pendente/pago/cancelado |
| forma_pagamento | enum | dinheiro/cartao_credito/cartao_debito/pix/convenio |
| data_vencimento | date | |
| data_pagamento | date | |

---

## Row Level Security (RLS)

Todas as tabelas devem ter RLS ativado. Políticas básicas:

```sql
-- Usuários autenticados só veem dados da sua clínica
CREATE POLICY "Acesso autenticado" ON pacientes
  FOR ALL USING (auth.role() = 'authenticated');
```

> 📌 Políticas detalhadas serão criadas conforme o módulo multi-clínica for definido.

---

## Triggers Recomendados

```sql
-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplique em cada tabela:
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
