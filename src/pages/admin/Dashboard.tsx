import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Badge, { toneFromStatus } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import { getBookings, getBarbers, getServices } from '@/lib/api'
import type { Booking } from '@/lib/types'
import { statusLabels, todayStr, formatDateLong } from '@/lib/utils'

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getBookings().then(setBookings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const svc = useMemo(() => new Map<string, string>(), [])
  const brb = useMemo(() => new Map<string, string>(), [])

  useEffect(() => {
    Promise.all([getServices(), getBarbers()])
      .then(([s, b]) => {
        s.forEach((x) => svc.set(x.id, x.name))
        b.forEach((x) => brb.set(x.id, x.name))
      })
      .catch(() => {})
  }, [svc, brb])

  const today = todayStr()
  const active = bookings.filter((b) => b.status !== 'cancelled')
  const todayRow = active.filter((b) => b.date === today)
  const pending = bookings.filter((b) => b.status === 'pending')
  const week = active.filter(
    (b) => new Date(b.date) >= new Date(today) && new Date(b.date) <= new Date(new Date(today).getTime() + 6 * 86400000),
  )
  const revenue = week.reduce((acc, b) => acc + b.price, 0)

  const upcoming = bookings
    .filter((b) => b.date >= today && b.status !== 'cancelled')
    .sort((a, b) => (a.date + a.start_time).localeCompare(b.date + b.start_time))
    .slice(0, 12)

  const stats = [
    { l: 'Hoy', n: String(todayRow.length) },
    { l: 'Pendientes', n: String(pending.length) },
    { l: 'Esta semana', n: String(week.length) },
    { l: 'Ingresos', n: `$ ${revenue.toLocaleString('es-CL')}`, accent: true },
  ]

  return (
    <div>
      <h1 className="font-display mb-7 text-[clamp(1.5rem,2.6vw,2rem)] font-normal">Reservas</h1>

      <div className="mb-7 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.l} className="card-surface p-4.5">
            <div className="label-mono text-[10.5px]!">{s.l}</div>
            <div className={`font-display mt-1.5 text-[26px] ${s.accent ? 'text-brass' : ''}`}>{s.n}</div>
          </div>
        ))}
      </div>

      <div className="card-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4.5 py-3.5">
          <span className="label-mono">Próximas horas</span>
          <Link to="/admin/reservas">
            <Button variant="mono" size="sm">
              Ver todas →
            </Button>
          </Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner className="h-7 w-7" />
          </div>
        ) : upcoming.length === 0 ? (
          <div className="p-4">
            <EmptyState title="Sin próximas reservas" detail="Las reservas aparecerán aquí." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Fecha</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Cliente</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Servicio</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Barbero</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Estado</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((b) => (
                  <tr key={b.id} className="border-t border-line hover:bg-smoke">
                    <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-ash">
                      {b.date === today ? 'Hoy' : formatDateLong(b.date)} · {b.start_time}
                    </td>
                    <td className="px-4.5 py-3.5 text-sm font-semibold">{b.client_name}</td>
                    <td className="px-4.5 py-3.5 text-sm text-ash">{svc.get(b.service_id) ?? '—'}</td>
                    <td className="px-4.5 py-3.5 font-mono text-[12.5px] text-ash">{brb.get(b.barber_id) ?? '—'}</td>
                    <td className="px-4.5 py-3.5">
                      <Badge tone={toneFromStatus(b.status)}>{statusLabels[b.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}