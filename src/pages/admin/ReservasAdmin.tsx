import { useCallback, useEffect, useMemo, useState } from 'react'
import Badge, { toneFromStatus } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Field, Input, Select } from '@/components/ui/Field'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import { usePagination } from '@/lib/usePagination'
import { createBooking, deleteBooking, getBarbers, getBookings, getServices, updateBookingStatus } from '@/lib/api'
import type { Booking, BookingStatus } from '@/lib/types'
import { addDays, formatDateLong, formatPrice, statusLabels, todayStr } from '@/lib/utils'

const filters: Array<{ key: 'all' | BookingStatus; label: string }> = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendientes' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'completed', label: 'Completadas' },
  { key: 'cancelled', label: 'Canceladas' },
]

export default function ReservasAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<{ id: string; name: string; duration_min: number; price: number }[]>([])
  const [barbers, setBarbers] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | BookingStatus>('all')
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)

  const reload = useCallback(() => {
    getBookings().then(setBookings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    Promise.all([getBookings(), getServices(), getBarbers()]).then(([bk, sv, bb]) => {
      setBookings(bk)
      setServices(sv)
      setBarbers(bb)
      setLoading(false)
    })
  }, [])

  const shown = useMemo(() => {
    const sorted = [...bookings].sort((a, b) => b.date.localeCompare(a.date) || b.start_time.localeCompare(a.start_time))
    return filter === 'all' ? sorted : sorted.filter((b) => b.status === filter)
  }, [bookings, filter])

  const { page, setPage, paged } = usePagination(shown, 10)

  const svcName = (id: string) => services.find((s) => s.id === id)?.name ?? '—'
  const brbName = (id: string) => barbers.find((b) => b.id === id)?.name ?? '—'

  async function changeStatus(b: Booking, status: BookingStatus) {
    await updateBookingStatus(b.id, status).catch(() => {})
    setBookings((prev) => prev.map((x) => (x.id === b.id ? { ...x, status } : x)))
  }

  async function remove(b: Booking) {
    if (!confirm(`¿Eliminar la reserva de ${b.client_name}?`)) return
    await deleteBooking(b.id).catch(() => {})
    setBookings((prev) => prev.filter((x) => x.id !== b.id))
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[clamp(1.5rem,2.6vw,2rem)] font-normal">Reservas</h1>
        <Button onClick={() => setCreating(true)}>+ Nueva reserva</Button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key)
              setPage(1)
            }}
            className={`rounded-md border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              filter === f.key ? 'border-brass bg-smoke text-brass' : 'border-line text-ash hover:text-ivory'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card-surface overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner className="h-7 w-7" />
          </div>
        ) : shown.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Sin reservas" detail="No hay reservas con este filtro." />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr>
                    <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Fecha</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Cliente</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Servicio</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Barbero</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Estado</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((b) => (
                  <tr key={b.id} className="border-t border-line hover:bg-smoke">
                    <td className="px-4.5 py-3.5">
                      <div className="font-mono text-[12.5px] text-ash">{formatDateLong(b.date)}</div>
                      <div className="font-mono text-[12.5px] text-brass">{b.start_time}</div>
                    </td>
                    <td className="px-4.5 py-3.5">
                      <div className="text-sm font-semibold">{b.client_name}</div>
                      <div className="text-xs text-ash">{b.client_phone}</div>
                    </td>
                    <td className="px-4.5 py-3.5 text-sm text-ash">
                      {svcName(b.service_id)}
                      <div className="text-xs text-faint">{formatPrice(b.price)}</div>
                    </td>
                    <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-ash">{brbName(b.barber_id)}</td>
                    <td className="px-4.5 py-3.5">
                      <Badge tone={toneFromStatus(b.status)}>{statusLabels[b.status]}</Badge>
                    </td>
                    <td className="px-4.5 py-3.5">
                      <div className="flex gap-2">
                        <Select
                          className="w-auto! border-line bg-transparent px-2.5! py-1.5! font-mono! text-[11px]! uppercase tracking-[0.08em] text-ivory focus:border-brass"
                          value={b.status}
                          onChange={(e) => changeStatus(b, e.target.value as BookingStatus)}
                        >
                          {(['pending', 'confirmed', 'completed', 'cancelled'] as BookingStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </Select>
                        <button onClick={() => remove(b)} className="btn-act danger">
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            <Pagination page={page} total={shown.length} pageSize={10} onPageChange={setPage} />
          </>
        )}
      </div>

      {creating && (
        <NewBookingModal
          services={services}
          barbers={barbers}
          saving={saving}
          onSave={async (input) => {
            setSaving(true)
            const rec = await createBooking(input).catch(() => null)
            setSaving(false)
            if (rec) {
              setCreating(false)
              reload()
            }
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function NewBookingModal({
  services,
  barbers,
  saving,
  onSave,
  onClose,
}: {
  services: { id: string; name: string; duration_min: number; price: number }[]
  barbers: { id: string; name: string }[]
  saving: boolean
  onSave: (input: Omit<Booking, 'id' | 'code' | 'status' | 'created_at'>) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')
  const [barberId, setBarberId] = useState(barbers[0]?.id ?? '')
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('10:00')

  const svc = services.find((s) => s.id === serviceId)

  function submit() {
    if (!name.trim() || !phone.trim() || !serviceId || !barberId || !date || !time) return
    onSave({
      client_name: name.trim(),
      client_phone: phone.trim(),
      email: null,
      service_id: serviceId,
      barber_id: barberId,
      date,
      start_time: time,
      duration_min: svc?.duration_min ?? 30,
      price: svc?.price ?? 0,
      notes: null,
    })
  }

  return (
    <Modal title="Nueva reserva" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
        </div>
        <Field label="Servicio">
          <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} · {formatPrice(s.price)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Barbero">
          <Select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Fecha">
            <Input type="date" min={todayStr()} max={addDays(todayStr(), 30)} value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Hora">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar reserva'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}