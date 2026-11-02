import { supabase } from './supabase'

/**
 * Gestão das pinturas (funkos e outras peças pintadas à mão).
 * Tabela: painting_jobs
 */

export type PaintingStatus = 'por_pintar' | 'a_pintar' | 'pintado'

export interface PaintingJob {
  id: string
  title: string
  client: string | null
  quantity: number
  due_date: string | null // 'AAAA-MM-DD'
  priority: 1 | 2 | 3
  status: PaintingStatus
  notes: string | null
  image: string | null
  created_by: string | null
  completed_at: string | null
  created_at: string
}

export type PaintingInput = Pick<
  PaintingJob,
  'title' | 'client' | 'quantity' | 'due_date' | 'priority' | 'notes' | 'image'
>

export const PRIORITIES = [
  { value: 1, label: 'Urgente', className: 'bg-red-600 text-white' },
  { value: 2, label: 'Normal', className: 'bg-paper-3 text-ink' },
  { value: 3, label: 'Baixa', className: 'bg-paper-2 text-ink-3 border border-paper-3' },
] as const

export const STATUS_LABELS: Record<PaintingStatus, string> = {
  por_pintar: 'Por pintar',
  a_pintar: 'A pintar',
  pintado: 'Pintado',
}

function notify() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('paintings_changed'))
  }
}

// ============================================================
// LEITURA
// ============================================================

export async function getPaintingJobs(): Promise<PaintingJob[]> {
  const { data, error } = await supabase
    .from('painting_jobs')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    quantity: Number(row.quantity) || 1,
    priority: (Number(row.priority) || 2) as 1 | 2 | 3,
  }))
}

/**
 * Ordem do que falta pintar:
 *  1. data limite mais próxima (sem data vai para o fim)
 *  2. com a mesma data, a prioridade mais alta primeiro
 *  3. o que já está a ser pintado antes do resto
 *  4. o mais antigo primeiro
 */
export function sortPending(jobs: PaintingJob[]) {
  return [...jobs].sort((a, b) => {
    const da = a.due_date ?? '9999-12-31'
    const db = b.due_date ?? '9999-12-31'
    if (da !== db) return da < db ? -1 : 1
    if (a.priority !== b.priority) return a.priority - b.priority
    if (a.status !== b.status) return a.status === 'a_pintar' ? -1 : 1
    return a.created_at < b.created_at ? -1 : 1
  })
}

export function sortDone(jobs: PaintingJob[]) {
  return [...jobs].sort((a, b) =>
    (b.completed_at ?? b.created_at) > (a.completed_at ?? a.created_at) ? 1 : -1,
  )
}

// ============================================================
// ESCRITA
// ============================================================

export async function createPaintingJob(input: PaintingInput, createdBy: string) {
  const { error } = await supabase.from('painting_jobs').insert([
    { ...input, status: 'por_pintar', created_by: createdBy },
  ])
  if (error) throw error
  notify()
}

export async function updatePaintingJob(id: string, input: Partial<PaintingInput>) {
  const { error } = await supabase.from('painting_jobs').update(input).eq('id', id)
  if (error) throw error
  notify()
}

export async function setPaintingStatus(id: string, status: PaintingStatus) {
  const { error } = await supabase
    .from('painting_jobs')
    .update({
      status,
      completed_at: status === 'pintado' ? new Date().toISOString() : null,
    })
    .eq('id', id)
  if (error) throw error
  notify()
}

export async function deletePaintingJob(id: string) {
  const { error } = await supabase.from('painting_jobs').delete().eq('id', id)
  if (error) throw error
  notify()
}

// ============================================================
// FOTOS
// ============================================================

/** Reduz a foto (máx. 1600 px) e carrega-a para o Supabase */
export async function uploadPaintingImage(file: File): Promise<string> {
  let blob: Blob = file

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const resized = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.85),
    )
    if (resized) blob = resized
  } catch {
    // formato que o browser não abre (ex.: HEIC): envia o original
  }

  const path = `pinturas/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`
  const { error } = await supabase.storage.from('produtos').upload(path, blob, {
    contentType: blob.type || 'image/jpeg',
    cacheControl: '3600',
    upsert: true,
  })
  if (error) throw error

  return supabase.storage.from('produtos').getPublicUrl(path).data.publicUrl
}

// ============================================================
// DATAS
// ============================================================

/** Hoje em 'AAAA-MM-DD' (hora local) */
export function todayISO() {
  const d = new Date()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

/** Dias até à data limite (negativo = atrasado) */
export function daysUntil(dueDate: string) {
  const [y, m, d] = dueDate.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

export function formatDate(dueDate: string, withWeekday = false) {
  const [y, m, d] = dueDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-PT', {
    weekday: withWeekday ? 'long' : undefined,
    day: 'numeric',
    month: 'long',
    year: y !== new Date().getFullYear() ? 'numeric' : undefined,
  })
}