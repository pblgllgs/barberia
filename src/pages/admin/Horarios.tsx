import { useCallback, useEffect, useMemo, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import Modal from '@/components/ui/Modal'
import { getBarbers, getSchedules, saveSchedule, deleteSchedule } from '@/lib/api'
import type { Barber, Schedule } from '@/lib/types'
import { DAY_NAMES } from '@/lib/utils'

export default function Horarios() {
  const [rows, setRows] = useState<Schedule[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [barberFilter, setBarberFilter] = useState('all')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => {
    Promise.all([getSchedules(), getBarbers()])
      .then(([s, b]) => {
        setRows(s)
        setBarbers(b)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const barberName = (id: string) => barbers.find((b) => b.id === id)?.name ?? '—'

  const shown = useMemo(() => {
    const sorted = [...rows].sort((a, b) => a.barber_id.localeCompare(b.barber_id) || a.day_of_week - b.day_of_week)
    return barberFilter === 'all' ? sorted : sorted.filter((s) => s.barber_id === barberFilter)
  }, [rows, barberFilter])

  async function toggle(s: Schedule) {
    const next = { ...s, is_active: !s.is_active }
    setRows((prev) => prev.map((x) => (x.id === s.id ? next : x)))
    await saveSchedule(next).catch(() => reload())
  }

  async function remove(s: Schedule) {
    if (!confirm(`¿Eliminar horario de ${barberName(s.barber_id)} (${DAY_NAMES[s.day_of_week]})?`)) return
    await deleteSchedule(s.id).catch(() => {})
    reload()
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-normal">Horarios</h1>
        <Button onClick={() => setCreating(true)}>+ Nuevo horario</Button>
      </div>

      <div className="mb-6 max-w-xs">
        <Field label="Barbero">
          <Select value={barberFilter} onChange={(e) => setBarberFilter(e.target.value)}>
            <option value="all">Todos</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-7 w-7" />
          </div>
        ) : shown.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Sin horarios" detail="Agrega ventanas horarias para tus barberos." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Barbero</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Día</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Desde</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Hasta</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Estado</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((s) => (
                  <tr key={s.id} className="border-t border-line hover:bg-smoke">
                    <td className="px-4.5 py-3.5 text-sm font-semibold">{barberName(s.barber_id)}</td>
                    <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-ash">{DAY_NAMES[s.day_of_week]}</td>
                    <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-brass">{s.start_time}</td>
                    <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-brass">{s.end_time}</td>
                    <td className="px-4.5 py-3.5">
                      <Badge tone={s.is_active ? 'success' : 'neutral'}>{s.is_active ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td className="px-4.5 py-3.5">
                      <div className="flex gap-2">
                        <button className="btn-act" onClick={() => toggle(s)}>
                          {s.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button className="btn-act danger" onClick={() => remove(s)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {creating && (
        <ScheduleModal
          barbers={barbers}
          saving={saving}
          onSave={async (input) => {
            setSaving(true)
            await saveSchedule(input).catch(() => {})
            setSaving(false)
            setCreating(false)
            reload()
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function ScheduleModal({
  barbers,
  saving,
  onSave,
  onClose,
}: {
  barbers: Barber[]
  saving: boolean
  onSave: (input: Omit<Schedule, 'id' | 'created_at'>) => void
  onClose: () => void
}) {
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? '')
  const [day, setDay] = useState(1)
  const [start, setStart] = useState('10:00')
  const [end, setEnd] = useState('20:00')

  return (
    <Modal title="Nuevo horario" onClose={onClose}>
      <div className="space-y-4">
        <Field label="Barbero">
          <Select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Día de la semana">
          <Select value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {DAY_NAMES.map((d, i) => (
              <option key={i} value={i}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Desde">
            <Input type="time" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="Hasta">
            <Input type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => onSave({ barber_id: barberId, day_of_week: day, start_time: start, end_time: end, is_active: true })}
            disabled={saving || !barberId || !start || !end}
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}