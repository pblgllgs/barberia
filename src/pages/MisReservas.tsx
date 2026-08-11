import { useState } from 'react'
import Button from '@/components/ui/Button'
import Badge, { toneFromStatus } from '@/components/ui/Badge'
import { Field, Input } from '@/components/ui/Field'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import { useToast } from '@/components/ui/Toast'
import { cancelPublicBooking, findBookingByCodeOrPhone, getServices } from '@/lib/api'
import type { Booking } from '@/lib/types'
import { formatDateLong, formatPrice, statusLabels } from '@/lib/utils'

export default function MisReservas() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [services, setServices] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)
  const { toast } = useToast()

  async function search() {
    if (!query.trim()) return
    setSearching(true)
    setLoading(true)
    setError('')
    const q = query.trim()
    try {
      const isPhone = /^[+0-9\s]{8,}$/.test(q) && /\d{8}/.test(q.replace(/\D/g, ''))
      const found = await findBookingByCodeOrPhone(q, isPhone ? q : undefined)
      setBookings(found)
      if (found.length === 0) {
        setError('No encontramos reservas con ese código o teléfono.')
      } else {
        const svc = await getServices()
        setServices(Object.fromEntries(svc.map((s) => [s.id, s.name])))
      }
    } catch {
      setError('Ocurrió un error al buscar. Intenta de nuevo.')
    } finally {
      setLoading(false)
      setSearching(false)
    }
  }

  async function cancel(b: Booking) {
    await cancelPublicBooking(b.id, b.code)
    setBookings((prev) => (prev ?? []).map((x) => (x.id === b.id ? { ...x, status: 'cancelled' } : x)))
    toast('Reserva cancelada', 'info')
  }

  return (
    <div className="container-site py-[clamp(48px,6vw,80px)]">
      <span className="kicker">Tus visitas</span>
      <h1 className="font-display mt-3.5 mb-2 text-[clamp(2rem,4vw,3rem)] font-normal">Consultar mis reservas</h1>
      <p className="mb-8 max-w-[48ch] text-ash">
        Busca con el código (ej. BN-4F2K) o con tu teléfono. Podrás ver el estado y cancelar si no podrás asistir.
      </p>

      <div className="flex max-w-xl flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Field label="Código o teléfono">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="BN-XXXX o +56 9 ..."
              onKeyDown={(e) => e.key === 'Enter' && search()}
            />
          </Field>
        </div>
        <div className="self-end pb-0.5">
          <Button onClick={search} disabled={!query.trim() || searching}>
            {searching ? <Spinner className="h-4 w-4" /> : 'Buscar'}
          </Button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      <div className="mt-10 max-w-3xl space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner className="h-7 w-7" />
          </div>
        )}

        {!loading && bookings && bookings.length === 0 && (
          <EmptyState title="Sin resultados" detail="Intenta con otro código o teléfono." />
        )}

        {!loading &&
          bookings?.map((b) => (
            <div key={b.id} className="card-surface p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-display text-lg">{services[b.service_id] ?? 'Servicio'}</span>
                    <Badge tone={toneFromStatus(b.status)}>{statusLabels[b.status]}</Badge>
                  </div>
                  <div className="mt-1.5 font-mono text-[12.5px] tracking-[0.08em] text-brass">{b.code}</div>
                  <div className="mt-2 text-sm text-ash">
                    {formatDateLong(b.date)} · {b.start_time} · {b.duration_min} min
                  </div>
                  <div className="mt-0.5 text-sm text-ash">{formatPrice(b.price)}</div>
                </div>
                {b.status !== 'cancelled' && b.status !== 'completed' && (
                  <Button variant="mono" size="sm" onClick={() => cancel(b)}>
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}