import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Gift } from 'lucide-react'
import Badge, { toneFromStatus } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Field, Select } from '@/components/ui/Field'
import { EmptyState, Spinner } from '@/components/ui/Feedback'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import { usePagination } from '@/lib/usePagination'
import { getMyBookings, getMyCoupons, getServices, redeemLoyalty } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Booking, Coupon, Service } from '@/lib/types'
import { formatDateLong, statusLabels, todayStr } from '@/lib/utils'

const TARGET = 10

export default function Perfil() {
  const { user, loading } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemOpen, setRedeemOpen] = useState(false)
  const [redeemError, setRedeemError] = useState('')
  const [redeemResult, setRedeemResult] = useState<Coupon | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([getMyBookings(user.id), getMyCoupons(user.id), getServices()])
      .then(([bk, cp, sv]) => {
        setBookings(bk)
        setCoupons(cp)
        setServices(sv)
      })
      .catch(() => {})
      .finally(() => setDataLoading(false))
  }, [user])

  const stats = useMemo(() => {
    const completed = bookings.filter((b) => b.status === 'completed').length
    const redeemed = coupons.filter((c) => c.status !== 'cancelled').reduce((acc, c) => acc + c.redeemed_visits, 0)
    const progress = completed - redeemed
    return {
      completed,
      redeemed,
      progress: Math.max(0, progress),
      pct: Math.min(100, (Math.max(0, progress) / TARGET) * 100),
      canRedeem: progress >= TARGET,
    }
  }, [bookings, coupons])

  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => (b.status === 'pending' || b.status === 'confirmed') && b.date >= todayStr())
        .sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)),
    [bookings],
  )

  const history = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'completed' || b.status === 'cancelled' || b.date < todayStr())
        .sort((a, b) => b.date.localeCompare(a.date) || b.start_time.localeCompare(b.start_time)),
    [bookings],
  )

  const { page, setPage, paged: historyPage } = usePagination(history, 10)

  const svcName = (id: string | null) => services.find((s) => s.id === id)?.name ?? 'Cualquier servicio'

  async function redeem(serviceId: string) {
    if (!user) return
    setRedeeming(true)
    setRedeemError('')
    const coupon = await redeemLoyalty(user.id, serviceId).catch((e) => {
      setRedeemError(e.message)
      return null
    })
    setRedeeming(false)
    if (coupon) {
      setRedeemResult(coupon)
      setRedeemOpen(false)
      setCoupons((prev) => [coupon, ...prev])
    }
  }

  if (loading || dataLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    )
  }

  if (!user) return <Navigate to="/iniciar-sesion" replace />

  return (
    <div className="container-site py-[clamp(48px,6vw,80px)]">
      <span className="kicker">Mi cuenta</span>
      <h1 className="font-display mt-3.5 mb-8 text-[clamp(2rem,4vw,3rem)] font-normal">
        Hola, {user.user_metadata?.full_name ?? 'cliente'}
      </h1>

      {/* Beneficio */}
      <div className="card-surface mb-10 p-6 md:p-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md border border-brass text-brass">
            <Gift size={20} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-normal">Beneficio de fidelidad</h2>
            <p className="text-sm text-ash">
              Con {TARGET} visitas completadas te regalamos un servicio a elección.
            </p>
          </div>
        </div>

        <div className="mb-2 flex justify-between font-mono text-[12px] uppercase tracking-[0.12em] text-ash">
          <span>
            {stats.progress} / {TARGET} visitas
          </span>
          <span>{Math.round(stats.pct)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-smoke">
          <div
            className="h-full rounded-full bg-brass transition-all duration-500"
            style={{ width: `${stats.pct}%` }}
          />
        </div>

        {stats.canRedeem ? (
          <Button className="mt-5" onClick={() => setRedeemOpen(true)} disabled={redeeming}>
            {redeeming ? 'Canjeando…' : 'Canjear mi servicio gratis'}
          </Button>
        ) : (
          <p className="mt-5 text-sm text-faint">
            Te faltan {TARGET - stats.progress} visita(s) para desbloquear tu beneficio.
          </p>
        )}
        {redeemError && <p className="mt-3 text-sm text-error">{redeemError}</p>}

        {coupons.length > 0 && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border border-line bg-smoke p-4">
                <div>
                  <div className="font-mono text-[13px] tracking-[0.1em] text-brass">{c.code}</div>
                  <div className="mt-1 text-sm text-ash">{svcName(c.service_id)} gratis</div>
                </div>
                <Badge tone={c.status === 'available' ? 'success' : c.status === 'used' ? 'info' : 'error'}>
                  {c.status === 'available' ? 'Disponible' : c.status === 'used' ? 'Usado' : 'Cancelado'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Próximas */}
      <h2 className="font-display mb-4 text-[clamp(1.4rem,2.4vw,1.8rem)] font-normal">Próximas reservas</h2>
      {upcoming.length === 0 ? (
        <EmptyState title="Sin próximas reservas" detail="Reserva tu hora desde la página de reservas." />
      ) : (
        <div className="mb-10 space-y-3">
          {upcoming.map((b) => (
            <BookingRow key={b.id} b={b} svcName={svcName} />
          ))}
        </div>
      )}

      {/* Historial */}
      <h2 className="font-display mb-4 text-[clamp(1.4rem,2.4vw,1.8rem)] font-normal">Historial de visitas</h2>
      {history.length === 0 ? (
        <EmptyState title="Sin visitas aún" detail="Tus visitas completadas aparecerán aquí." />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Fecha</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Servicio</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Código</th>
                  <th className="px-4.5 py-3 text-left font-mono text-[10.5px] font-medium uppercase tracking-[0.14em] text-ash">Estado</th>
                </tr>
              </thead>
              <tbody>
                {historyPage.map((b) => (
                  <tr key={b.id} className="border-t border-line hover:bg-smoke">
                    <td className="px-4.5 py-3.5">
                      <div className="font-mono text-[12.5px] text-ash">{formatDateLong(b.date)}</div>
                      <div className="font-mono text-[12.5px] text-brass">{b.start_time}</div>
                    </td>
                    <td className="px-4.5 py-3.5 text-sm">{svcName(b.service_id)}</td>
                    <td className="px-4.5 py-3.5 font-mono text-[12px] tracking-[0.06em] text-ash">{b.code}</td>
                    <td className="px-4.5 py-3.5">
                      <Badge tone={toneFromStatus(b.status)}>{statusLabels[b.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} total={history.length} pageSize={10} onPageChange={setPage} />
        </div>
      )}

      {redeemOpen && stats.canRedeem && !redeemResult && (
        <RedeemModal
          services={services}
          redeeming={redeeming}
          onRedeem={redeem}
          onClose={() => setRedeemOpen(false)}
        />
      )}
      {redeemResult && (
        <Modal title="¡Beneficio canjeado!" onClose={() => setRedeemResult(null)}>
          <div className="text-center">
            <p className="text-ash">
              Tu cupón de servicio gratis en <span className="text-ivory">{svcName(redeemResult.service_id)}</span>:
            </p>
            <div className="mt-4 rounded-md border border-brass bg-smoke py-4 font-mono text-xl tracking-[0.12em] text-brass">
              {redeemResult.code}
            </div>
            <p className="mt-4 text-sm text-ash">Muéstralo en la barbería al reservar tu atención.</p>
            <Button className="mt-5 w-full" onClick={() => setRedeemResult(null)}>
              Entendido
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function BookingRow({ b, svcName }: { b: Booking; svcName: (id: string | null) => string }) {
  return (
    <div className="card-surface flex flex-wrap items-start justify-between gap-3 p-5">
      <div>
        <div className="flex items-center gap-3">
          <span className="font-display text-lg">{svcName(b.service_id)}</span>
          <Badge tone={toneFromStatus(b.status)}>{statusLabels[b.status]}</Badge>
        </div>
        <div className="mt-1 font-mono text-[12.5px] tracking-[0.08em] text-brass">{b.code}</div>
        <div className="mt-1.5 text-sm text-ash">
          {formatDateLong(b.date)} · {b.start_time} · {b.duration_min} min
        </div>
      </div>
    </div>
  )
}

function RedeemModal({
  services,
  redeeming,
  onRedeem,
  onClose,
}: {
  services: Service[]
  redeeming: boolean
  onRedeem: (serviceId: string) => void
  onClose: () => void
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? '')

  return (
    <Modal title="Canjear servicio gratis" onClose={onClose}>
      <p className="mb-4 text-sm text-ash">Elige el servicio que quieres canjear con tu beneficio.</p>
      <Field label="Servicio">
        <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={() => onRedeem(serviceId)} disabled={redeeming || !serviceId}>
          {redeeming ? 'Canjeando…' : 'Confirmar canje'}
        </Button>
      </div>
    </Modal>
  )
}