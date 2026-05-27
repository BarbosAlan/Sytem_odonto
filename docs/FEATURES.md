# 📋 Funcionalidades do Sistema

## Status das Features

| Feature | Status | Prioridade |
|---|---|---|
| 🔐 Autenticação | 🟡 Planejado | Alta |
| 👥 Pacientes | 🟡 Planejado | Alta |
| 📅 Agendamentos | 🟡 Planejado | Alta |
| 📋 Prontuários | 🟡 Planejado | Média |
| 🦷 Tratamentos | 🟡 Planejado | Média |
| 💰 Financeiro | 🟡 Planejado | Média |
| ⚙️ Configurações | 🟡 Planejado | Baixa |

**Legenda:** 🔴 Bloqueado | 🟡 Planejado | 🔵 Em Progresso | 🟢 Concluído

---

## Detalhamento das Features

### 🔐 Autenticação
- Login com e-mail e senha
- Recuperação de senha por e-mail
- Proteção de rotas via middleware
- Perfil do usuário (dentista/admin)

### 👥 Pacientes
- Listagem com busca e filtros
- Cadastro e edição completos (nome, CPF, contato, endereço)
- Visualização de histórico (prontuários + agendamentos + financeiro)
- Soft delete (desativar sem perder histórico)
- Exportar ficha do paciente (PDF)

### 📅 Agendamentos
- Visualização em calendário (mensal/semanal/diário)
- Criação com seleção de paciente, dentista e horário
- Detecção de conflitos de horário
- Status: agendado → confirmado → realizado / cancelado / falta
- Envio de lembretes (futuro)

### 📋 Prontuários
- Registro de atendimento por consulta
- Anamnese inicial do paciente
- Odontograma visual (futuro)
- Anexo de radiografias e imagens
- Histórico completo por paciente

### 🦷 Tratamentos
- Criação de plano de tratamento
- Vínculo com procedimentos
- Acompanhamento de progresso (planejado → em andamento → concluído)
- Orçamento do tratamento

### 💰 Financeiro
- Registro de receitas (pagamentos de pacientes)
- Registro de despesas da clínica
- Controle de cobranças pendentes
- Relatório financeiro mensal
- Integração com tratamentos

### ⚙️ Configurações
- Dados da clínica
- Cadastro de dentistas
- Horários de funcionamento
- Procedimentos e valores padrão
- Convênios cadastrados
