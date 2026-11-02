import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Clock,
  Edit3,
  History,
  Image as ImageIcon,
  ListTodo,
  Loader2,
  Lock,
  Paintbrush,
  Play,
  Plus,
  RotateCcw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import {
  CustomerUser,
  canManagePaintings,
  getCurrentUser,
  isAdmin,
  refreshCurrentUser,
} from '@/lib/auth'
import {
  PRIORITIES,
  PaintingJob,
  PaintingStatus,
  STATUS_LABELS,
  createPaintingJob,
  daysUntil,
  deletePaintingJob,
  formatDate,
  getPaintingJobs,
  setPaintingStatus,
  sortDone,
  sortPending,
  todayISO,
  updatePaintingJob,
  uploadPaintingImage,
} from '@/lib/paintings'
import { AuthModal } from '@/components/AuthModal'

export const Route = createFileRoute('/pinturas')({
  component: PaintingsPage,
})

type Tab = 'pending' | 'calendar' | 'done'

type FormState = {
  title: string
  client: string
  quantity: string
  dueDate: string
  priority: 1 | 2 | 3
  notes: string
  image: string
}

const emptyForm = (): FormState => ({
  title: '',
  client: '',
  quantity: '1',
  dueDate: '',
  priority: 2,
  notes: '',
  image: '',
})

function PaintingsPage() {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [checkingUser, setCheckingUser] = useState(true)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    const load = async () => {
      setUser(getCurrentUser())
      setUser(await refreshCurrentUser())
      setCheckingUser(false)
    }
    void load()

    const onAuth = () => setUser(getCurrentUser())
    window.addEventListener('auth_changed', onAuth)
    return () => window.removeEventListener('auth_changed', onAuth)
  }, [])

  if (checkingUser) {
    return <div className="py-24 text-center text-sm text-ink-3">A carregar...</div>
  }

  if (!canManagePaintings(user)) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-paper-2 text-ink-3">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-ink">Área reservada</h1>
        <p className="mt-2 text-sm text-ink-3">
          {user
            ? 'A tua conta não tem acesso à gestão das pinturas.'
            : 'Entra com o teu e-mail para veres as pinturas.'}
        </p>
        {!user && (
          <button
            type="button"
            onClick={() => setShowAuth(true)}
            className="mt-6 rounded-xl bg-ember px-6 py-2.5 text-sm font-semibold text-paper hover:bg-ember-deep"
          >
            Entrar
          </button>
        )}
        <Link to="/" className="mt-4 text-xs font-semibold text-ink-3 hover:text-ink">
          Voltar ao início
        </Link>

        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={(u) => setUser(u)}
        />
      </div>
    )
  }

  return <PaintingsManager user={user!} />
}

// ============================================================
// GESTOR DAS PINTURAS
// ============================================================

function PaintingsManager({ user }: { user: CustomerUser }) {
  const [jobs, setJobs] = useState<PaintingJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('pending')
  const [busyId, setBusyId] = useState<string | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    try {
      setJobs(await getPaintingJobs())
      setError('')
    } catch (err: any) {
      setError(err?.message || 'Não foi possível carregar as pinturas.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    const onChange = () => void load()
    window.addEventListener('paintings_changed', onChange)
    return () => window.removeEventListener('paintings_changed', onChange)
  }, [])

  const pending = useMemo(
    () => sortPending(jobs.filter((j) => j.status !== 'pintado')),
    [jobs],
  )
  const done = useMemo(() => sortDone(jobs.filter((j) => j.status === 'pintado')), [jobs])

  const pendingPieces = pending.reduce((sum, j) => sum + j.quantity, 0)
  const inProgress = pending.filter((j) => j.status === 'a_pintar').length
  const overdue = pending.filter((j) => j.due_date && daysUntil(j.due_date) < 0).length
  const thisMonth = new Date().toISOString().slice(0, 7)
  const doneThisMonth = done
    .filter((j) => (j.completed_at ?? '').startsWith(thisMonth))
    .reduce((sum, j) => sum + j.quantity, 0)

  // ---------- Formulário ----------

  const openNew = () => {
    setEditingId(null)
    setForm(emptyForm())
    setFormOpen(true)
  }

  const openEdit = (job: PaintingJob) => {
    setEditingId(job.id)
    setForm({
      title: job.title,
      client: job.client ?? '',
      quantity: String(job.quantity),
      dueDate: job.due_date ?? '',
      priority: job.priority,
      notes: job.notes ?? '',
      image: job.image ?? '',
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
  }

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPaintingImage(file)
      setForm((f) => ({ ...f, image: url }))
    } catch (err: any) {
      alert('Erro ao carregar a foto: ' + (err?.message || 'tenta outra vez.'))
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setSaving(true)
    const input = {
      title: form.title.trim(),
      client: form.client.trim() || null,
      quantity: Math.max(1, parseInt(form.quantity, 10) || 1),
      due_date: form.dueDate || null,
      priority: form.priority,
      notes: form.notes.trim() || null,
      image: form.image || null,
    }

    try {
      if (editingId) {
        await updatePaintingJob(editingId, input)
      } else {
        await createPaintingJob(input, user.handle)
      }
      closeForm()
    } catch (err: any) {
      alert('Não foi possível guardar: ' + (err?.message || 'erro desconhecido.'))
    } finally {
      setSaving(false)
    }
  }

  // ---------- Ações ----------

  const changeStatus = async (job: PaintingJob, status: PaintingStatus) => {
    setBusyId(job.id)
    try {
      await setPaintingStatus(job.id, status)
    } catch (err: any) {
      alert('Erro: ' + (err?.message || 'tenta outra vez.'))
    } finally {
      setBusyId(null)
    }
  }

  const removeJob = async (job: PaintingJob) => {
    if (!confirm(`Apagar "${job.title}"?`)) return
    setBusyId(job.id)
    try {
      await deletePaintingJob(job.id)
    } catch (err: any) {
      alert('Erro: ' + (err?.message || 'tenta outra vez.'))
    } finally {
      setBusyId(null)
    }
  }

  // Agrupa por data para o calendário
  const calendarGroups = useMemo(() => {
    const groups: Array<{ key: string; jobs: PaintingJob[] }> = []
    pending.forEach((job) => {
      const key = job.due_date ?? 'sem-data'
      const last = groups[groups.length - 1]
      if (last && last.key === key) last.jobs.push(job)
      else groups.push({ key, jobs: [job] })
    })
    return groups
  }, [pending])

  const renderCard = (job: PaintingJob) => (
    <JobCard
      key={job.id}
      job={job}
      busy={busyId === job.id}
      canDelete={isAdmin(user)}
      onEdit={() => openEdit(job)}
      onDelete={() => void removeJob(job)}
      onStatus={(s) => void changeStatus(job, s)}
    />
  )

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-paper-3 bg-paper">
        <div className="mx-auto flex min-h-[72px] max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-semibold text-ink-2 transition hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
          <span className="rounded-full border border-paper-3 bg-paper-2 px-3 py-1.5 text-xs font-bold text-ink-2">
            @{user.handle}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ember">
              <Paintbrush className="h-4 w-4" />
              Atelier
            </div>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">Pinturas</h1>
            <p className="mt-1 text-sm text-ink-3">
              O que falta pintar, por ordem de entrega, e o histórico do que já está feito.
            </p>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="flex items-center justify-center gap-2 rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-md transition hover:bg-ember"
          >
            <Plus className="h-4 w-4" />
            Nova pintura
          </button>
        </div>

        {/* Números rápidos */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Peças por pintar" value={pendingPieces} />
          <Stat label="A pintar agora" value={inProgress} />
          <Stat label="Atrasadas" value={overdue} danger={overdue > 0} />
          <Stat label="Pintadas este mês" value={doneThisMonth} />
        </div>

        {/* Separadores */}
        <div className="mb-6 flex gap-2 overflow-x-auto border-b border-paper-3">
          <TabButton active={tab === 'pending'} onClick={() => setTab('pending')} icon={<ListTodo className="h-4 w-4" />}>
            Por pintar ({pending.length})
          </TabButton>
          <TabButton active={tab === 'calendar'} onClick={() => setTab('calendar')} icon={<CalendarDays className="h-4 w-4" />}>
            Calendário
          </TabButton>
          <TabButton active={tab === 'done'} onClick={() => setTab('done')} icon={<History className="h-4 w-4" />}>
            Histórico ({done.length})
          </TabButton>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-ink-3">A carregar pinturas...</div>
        ) : tab === 'pending' ? (
          pending.length === 0 ? (
            <Empty text="Nada por pintar. 🎉" />
          ) : (
            <div className="space-y-3">{pending.map(renderCard)}</div>
          )
        ) : tab === 'calendar' ? (
          calendarGroups.length === 0 ? (
            <Empty text="Não há datas marcadas." />
          ) : (
            <div className="space-y-6">
              {calendarGroups.map((group) => {
                const days = group.key === 'sem-data' ? null : daysUntil(group.key)
                return (
                  <section key={group.key}>
                    <div className="mb-2 flex items-baseline justify-between gap-3 border-b border-paper-3 pb-1.5">
                      <h2 className="font-bold capitalize text-ink">
                        {group.key === 'sem-data' ? 'Sem data' : formatDate(group.key, true)}
                      </h2>
                      {days !== null && <DueBadge days={days} />}
                    </div>
                    <div className="space-y-3">{group.jobs.map(renderCard)}</div>
                  </section>
                )
              })}
            </div>
          )
        ) : done.length === 0 ? (
          <Empty text="Ainda não há pinturas terminadas." />
        ) : (
          <div className="space-y-3">{done.map(renderCard)}</div>
        )}
      </main>

      {/* ===== Formulário (janela) ===== */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={closeForm}
        >
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-paper-3 bg-paper p-5 shadow-2xl sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-ink">
                {editingId ? 'Editar pintura' : 'Nova pintura'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full p-1.5 text-ink-3 hover:bg-paper-2 hover:text-ink"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Peça *">
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex.: Funko Homem-Aranha"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-[1fr_96px] gap-3">
                <Field label="Cliente / encomenda">
                  <input
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    placeholder="Ex.: Ana Ribeiro"
                    className={inputClass}
                  />
                </Field>
                <Field label="Qtd.">
                  <input
                    type="number"
                    min={1}
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Tem de estar pronto até">
                <input
                  type="date"
                  value={form.dueDate}
                  min={editingId ? undefined : todayISO()}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <Field label="Prioridade">
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setForm({ ...form, priority: p.value })}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                        form.priority === p.value
                          ? 'border-ember bg-ember/10 text-ink ring-1 ring-ember'
                          : 'border-paper-3 bg-paper text-ink-2 hover:bg-paper-2'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-ink-3">
                  Com a mesma data, as urgentes aparecem primeiro.
                </p>
              </Field>

              <Field label="Notas">
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Cores, detalhes, referências..."
                  className={inputClass}
                />
              </Field>

              <Field label="Foto de referência">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
                {form.image ? (
                  <div className="relative h-40 w-40 overflow-hidden rounded-xl border border-paper-3">
                    <img src={form.image} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '' })}
                      className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 p-1 text-paper hover:bg-red-600"
                      aria-label="Remover foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-paper-3 bg-paper-2/60 p-5 text-sm font-semibold text-ink transition hover:border-ember disabled:opacity-60"
                  >
                    {uploading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-ember" />
                    ) : (
                      <UploadCloud className="h-5 w-5 text-ember" />
                    )}
                    {uploading ? 'A carregar...' : 'Escolher foto'}
                  </button>
                )}
              </Field>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-ink py-3.5 text-sm font-semibold text-paper shadow-md transition hover:bg-ember disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingId ? 'Guardar alterações' : 'Adicionar pintura'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// ============================================================
// COMPONENTES PEQUENOS
// ============================================================

const inputClass =
  'w-full rounded-xl border border-paper-3 bg-paper-2 p-2.5 text-sm text-ink outline-none focus:border-ember'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-ink-2">
        {label}
      </label>
      {children}
    </div>
  )
}

function Stat({ label, value, danger = false }: { label: string; value: number; danger?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${danger ? 'border-red-300 bg-red-50' : 'border-paper-3 bg-paper'}`}>
      <p className="text-xs font-semibold text-ink-3">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${danger ? 'text-red-600' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${
        active ? 'border-ember text-ember' : 'border-transparent text-ink-2 hover:text-ink'
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-paper-3 bg-paper-2 p-12 text-center text-sm font-semibold text-ink-2">
      {text}
    </div>
  )
}

function DueBadge({ days }: { days: number }) {
  const { text, className } =
    days < 0
      ? { text: `Atrasado ${Math.abs(days)} ${Math.abs(days) === 1 ? 'dia' : 'dias'}`, className: 'bg-red-600 text-white' }
      : days === 0
        ? { text: 'Hoje', className: 'bg-red-100 text-red-700' }
        : days === 1
          ? { text: 'Amanhã', className: 'bg-amber-100 text-amber-800' }
          : days <= 7
            ? { text: `Faltam ${days} dias`, className: 'bg-amber-100 text-amber-800' }
            : { text: `Faltam ${days} dias`, className: 'bg-paper-2 text-ink-2' }

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${className}`}>
      <Clock className="mr-1 inline h-3 w-3 align-[-2px]" />
      {text}
    </span>
  )
}

function JobCard({
  job,
  busy,
  canDelete,
  onEdit,
  onDelete,
  onStatus,
}: {
  job: PaintingJob
  busy: boolean
  canDelete: boolean
  onEdit: () => void
  onDelete: () => void
  onStatus: (status: PaintingStatus) => void
}) {
  const priority = PRIORITIES.find((p) => p.value === job.priority) ?? PRIORITIES[1]
  const isDone = job.status === 'pintado'
  const days = job.due_date ? daysUntil(job.due_date) : null

  return (
    <article
      className={`rounded-2xl border bg-white p-4 transition ${busy ? 'opacity-60' : ''} ${
        job.status === 'a_pintar' ? 'border-ember ring-1 ring-ember/30' : 'border-paper-3'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-paper-2">
          {job.image ? (
            <a href={job.image} target="_blank" rel="noreferrer">
              <img src={job.image} alt={job.title} className="h-20 w-20 object-cover" />
            </a>
          ) : (
            <ImageIcon className="h-6 w-6 text-ink-3" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-ink">
              {job.title}
              {job.quantity > 1 && <span className="ml-1 text-ink-3">× {job.quantity}</span>}
            </h3>
            {!isDone && job.priority !== 2 && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priority.className}`}>
                {priority.label}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                job.status === 'a_pintar'
                  ? 'bg-ember/15 text-ember'
                  : isDone
                    ? 'bg-green-100 text-green-700'
                    : 'bg-paper-2 text-ink-3'
              }`}
            >
              {STATUS_LABELS[job.status]}
            </span>
          </div>

          <p className="mt-0.5 text-xs text-ink-3">
            {job.client && <>Para {job.client} · </>}
            {job.due_date ? `Entrega ${formatDate(job.due_date)}` : 'Sem data'}
            {isDone && job.completed_at && (
              <> · Pintado a {new Date(job.completed_at).toLocaleDateString('pt-PT')}</>
            )}
          </p>

          {!isDone && days !== null && (
            <div className="mt-1.5">
              <DueBadge days={days} />
            </div>
          )}

          {job.notes && (
            <p className="mt-2 whitespace-pre-line text-xs leading-5 text-ink-2">{job.notes}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {job.status === 'por_pintar' && (
              <ActionButton onClick={() => onStatus('a_pintar')} disabled={busy}>
                <Play className="h-3.5 w-3.5" /> Começar
              </ActionButton>
            )}
            {!isDone && (
              <ActionButton onClick={() => onStatus('pintado')} disabled={busy} primary>
                <Check className="h-3.5 w-3.5" /> Pintado
              </ActionButton>
            )}
            {job.status === 'a_pintar' && (
              <ActionButton onClick={() => onStatus('por_pintar')} disabled={busy}>
                <RotateCcw className="h-3.5 w-3.5" /> Parar
              </ActionButton>
            )}
            {isDone && (
              <ActionButton onClick={() => onStatus('por_pintar')} disabled={busy}>
                <RotateCcw className="h-3.5 w-3.5" /> Voltar a «por pintar»
              </ActionButton>
            )}

            <span className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                disabled={busy}
                className="rounded-lg p-2 text-ink-3 hover:bg-paper-2 hover:text-ink"
                aria-label="Editar"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              {canDelete && (
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={busy}
                  className="rounded-lg p-2 text-ink-3 hover:bg-red-50 hover:text-red-600"
                  aria-label="Apagar"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}

function ActionButton({
  onClick,
  disabled,
  primary = false,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
        primary
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'border border-paper-3 bg-paper text-ink hover:bg-paper-2'
      }`}
    >
      {children}
    </button>
  )
}