import { useCallback, useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import { usePagination } from '@/lib/usePagination'
import { getServices, saveService } from '@/lib/api'
import type { Service } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

const empty: Omit<Service, 'id' | 'created_at'> = {
  name: '',
  description: '',
  duration_min: 30,
  price: 10000,
  image_url: null,
  is_active: true,
  sort_order: 1,
}

export default function Servicios() {
  const [rows, setRows] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Service | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const { page, setPage, paged } = usePagination(rows, 8)

  const reload = useCallback(() => {
    getServices().then(setRows).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  async function persist(input: Partial<Service> & { id?: string }) {
    setSaving(true)
    await saveService(input).catch(() => {})
    setSaving(false)
    setEditing(null)
    setCreating(false)
    reload()
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-normal">Servicios</h1>
        <Button onClick={() => setCreating(true)}>+ Nuevo servicio</Button>
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-7 w-7" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Sin servicios" detail="Crea tu primer servicio." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Nombre</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Duración</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Precio</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Estado</th>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((s) => (
                    <tr key={s.id} className="border-t border-line hover:bg-smoke">
                      <td className="px-4.5 py-3.5 text-sm font-semibold">{s.name}</td>
                      <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-ash">{s.duration_min} min</td>
                      <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-brass">{formatPrice(s.price)}</td>
                      <td className="px-4.5 py-3.5">
                        <Badge tone={s.is_active ? 'success' : 'neutral'}>{s.is_active ? 'Activo' : 'Oculto'}</Badge>
                      </td>
                      <td className="px-4.5 py-3.5">
                        <button className="btn-act" onClick={() => setEditing(s)}>
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
        <ServiceModal
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

function ServiceModal({
  initial,
  saving,
  onSave,
  onClose,
}: {
  initial: Omit<Service, 'id' | 'created_at'> & { id?: string }
  saving: boolean
  onSave: (input: Partial<Service> & { id?: string }) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...empty, ...initial })
  const set = (k: keyof Service, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Modal title={initial.id ? 'Editar servicio' : 'Nuevo servicio'} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Nombre">
          <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Descripción">
          <Textarea value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Duración (min)">
            <Input type="number" min={5} step={5} value={form.duration_min} onChange={(e) => set('duration_min', Number(e.target.value))} />
          </Field>
          <Field label="Precio ($)">
            <Input type="number" min={0} step={500} value={form.price} onChange={(e) => set('price', Number(e.target.value))} />
          </Field>
        </div>
        <Field label="Imagen (URL)">
          <Input value={form.image_url ?? ''} onChange={(e) => set('image_url', e.target.value || null)} placeholder="https://..." />
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