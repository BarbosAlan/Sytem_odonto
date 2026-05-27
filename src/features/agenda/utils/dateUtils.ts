/**
 * Utilitários de data/hora para o módulo Agenda
 * Sem dependências externas — usa Date nativo
 */

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const MONTHS_SHORT_PT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

/** Retorna a segunda-feira da semana que contém `date` */
export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() // 0=Dom, 1=Seg, ...
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Retorna array com os 7 dias (Seg–Dom) da semana que contém `date` */
export function getWeekDays(date: Date): Date[] {
  const monday = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })
}

/** Adiciona `days` dias a uma data */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

/** Início do dia (00:00:00.000) */
export function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

/** Fim do dia (23:59:59.999) */
export function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

/** Verifica se duas datas são o mesmo dia de calendário */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Verifica se a data é hoje */
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

/** Formata hora como "HH:mm" */
export function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

/** Formata data como "dd/MM/yyyy" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR')
}

/** Formata data como "26 Mai" */
export function formatDateShort(date: Date): string {
  return `${date.getDate()} ${MONTHS_SHORT_PT[date.getMonth()]}`
}

/** Retorna o nome curto do dia da semana ("Seg", "Ter", ...) */
export function formatDayOfWeek(date: Date): string {
  return DAYS_PT[date.getDay()]
}

/** Formata intervalo da semana: "26 Mai – 1 Jun 2025" */
export function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6)
  const year = sunday.getFullYear()
  if (monday.getMonth() === sunday.getMonth()) {
    return `${monday.getDate()}–${sunday.getDate()} ${MONTHS_SHORT_PT[monday.getMonth()]} ${year}`
  }
  return `${formatDateShort(monday)} – ${formatDateShort(sunday)} ${year}`
}

/** Formata "Maio 2025" */
export function formatMonthYear(date: Date): string {
  return `${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`
}

/** Retorna o minuto do dia (0–1439) */
export function minuteOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes()
}

/** Converte para valor de input[type=date]: "2025-05-26" */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Converte date string + time string para ISO UTC
 * Ex: "2025-05-26" + "14:00" → "2025-05-26T17:00:00.000Z" (BRT-3)
 */
export function toISODateTime(dateStr: string, timeStr: string): string {
  return new Date(`${dateStr}T${timeStr}:00`).toISOString()
}

/** Retorna todos os dias do calendário mensal (incluindo dias da semana anterior/próxima) */
export function getMonthCalendarDays(date: Date): Date[] {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const start = startOfWeek(firstDay)
  // Garante que a última semana exibida cubra o último dia do mês
  const endMonday = startOfWeek(lastDay)
  const end = addDays(endMonday, 6)
  const days: Date[] = []
  let current = start
  while (current <= end) {
    days.push(new Date(current))
    current = addDays(current, 1)
  }
  return days
}

/** Converte string ISO 8601 para Date */
export function parseISO(isoString: string): Date {
  return new Date(isoString)
}

/** Formata duração em minutos como "1h 30min" ou "45min" */
export function formatDuracao(minutos: number): string {
  if (minutos < 60) return `${minutos}min`
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}
