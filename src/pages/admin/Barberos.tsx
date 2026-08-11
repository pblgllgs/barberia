import { useCallback, useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import ImageUpload from '@/components/ui/ImageUpload'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import { useToast } from '@/components/ui/Toast'
import { usePagination } from '@/lib/usePagination'
import { getBarbers, saveBarber } from '@/lib/api'
import type { Barber } from '@/lib/types'

const empty: Omit<Barber, 'id' | 'created_at'> = {
  name: '',
  role: '',
  specialty: '',
  bio: '',
  image_url: null,
  is_active: true,
  sort_order: 1,
}

export default function Barberos() {
  const [rows, setRows] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Barber | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const { page, setPage, paged } = usePagination(rows, 8)
  const { toast } = useToast()

  const reload = useCallback(() => {
    getBarbers().then(setRows).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function persist(input: Partial<Barber> & { id?: string }) {
    setSaving(true)
    try {
      await saveBarber(input)
      toast(input.id ? 'Barbero actualizado' : 'Barbero creado')
    } catch {
      toast('No se pudo guardar el barbero', 'error')
    }
    setSaving(false)
    setEditing(null)
    setCreating(false)
    reload()
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-normal">Barberos</h1>
        <Button onClick={() => setCreating(true)}>+ Nuevo barbero</Button>
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Sin barberos" detail="Agrega tu primer barbero." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Nombre</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Rol</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Especialidad</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Estado</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((b) => (
                    <tr key={b.id} className="border-t border-line hover:bg-smoke">
                      <td className="px-4.5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={b.image_url ?? ''} alt="" className="h-9 w-9 rounded-md border border-line object-cover" />
                          <span className="text-sm font-semibold">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4.5 py-3.5 text-sm text-ash">{b.role ?? '—'}</td>
                      <td className="px-4.5 py-3.5 text-sm text-ash">{b.specialty ?? '—'}</td>
                      <td className="px-4.5 py-3.5">
                        <Badge tone={b.is_active ? 'success' : 'neutral'}>{b.is_active ? 'Activo' : 'Oculto'}</Badge>
                      </td>
                      <td className="px-4.5 py-3.5">
                        <button className="btn-act" onClick={() => setEditing(b)}>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={rows.length} pageSize={8} onPageChange={setPage} />
          </>
        )}
      </div>

      {(creating || editing) && (
        <BarberModal
          initial={editing ?? empty}
          saving={saving}
          onSave={persist}
          onClose={() => {
            setCreating(false)
            setEditing(null)
          }}
        />
      )}
    </div>
  )
}

function BarberModal({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial: Omit<Barber, 'id' | 'created_at'> & { id?: string }
  saving: boolean
  onSave: (input: Partial<Barber> & { id?: string }) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...empty, ...initial })
  const set = (k: keyof Barber, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Modal title={initial.id ? 'Editar barbero' : 'Nuevo barbero'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nombre">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Rol">
            <Input value={form.role ?? ''} onChange={(e) => set('role', e.target.value)} placeholder="Corte · Barba" />
          </Field>
          <Field label="Especialidad">
            <Input value={form.specialty ?? ''} onChange={(e) => set('specialty', e.target.value)} />
          </Field>
        </div>
        <Field label="Bio">
          <Textarea value={form.bio ?? ''} onChange={(e) => set('bio', e.target.value)} />
        </Field>
        <Field label="Imagen">
          <ImageUpload value={form.image_url} onChange={(u) => set('image_url', u || null)} />
        </Field>
        <Field label="Orden">
          <Input type="number" value={form.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} />
        </Field>
        <Field label="Estado">
          <Select value={form.is_active ? '1' : '0'} onChange={(e) => set('is_active', e.target.value === '1')}>
            <option value="1">Activo</option>
            <option value="0">Oculto</option>
          </Select>
        </Field>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={() => onSave({ ...form, id: initial.id })} disabled={!form.name.trim() || saving}>
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}