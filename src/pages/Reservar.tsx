import { useEffect, useMemo, useState } from 'react'
import { Check } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Spinner } from '@/components/ui/Feedback'
import { useToast } from '@/components/ui/Toast'
import { computeAvailableSlots, createBooking, getBarbers, getBlockedSlots, getBookedSlots, getSchedules, getServices } from '@/lib/api'
import type { BookedRange } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Service, Barber, Schedule, Booking, BlockedSlot } from '@/lib/types'
import { DAY_NAMES, addDays, dayOfWeek, formatDateLong, formatPrice, todayStr } from '@/lib/utils'

const steps = ['Servicio', 'Barbero', 'Fecha y hora', 'Confirmación']

export default function Reservar() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [booked, setBooked] = useState<BookedRange[]>([])
  const [blocked, setBlocked] = useState<BlockedSlot[]>([])

  const [step, setStep] = useState(1)
  const [service, setService] = useState<Service | null>(null)
  const [barber, setBarber] = useState<Barber | null>(null)
  const [date, setDate] = useState<string>(todayStr())
  const [slot, setSlot] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [result, setResult] = useState<Booking | null>(null)
  const [error, setError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    Promise.all([getServices(), getBarbers(), getSchedules(), getBlockedSlots()])
      .then(([s, b, sc, bl]) => {
        setServices(s)
        setBarbers(b)
        setSchedules(sc)
        setBlocked(bl)
      })
      .catch(() => setError('No se pudieron cargar los datos. Intenta de nuevo.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!barber || !service) return
    let active = true
    getBookedSlots(barber.id, date)
      .then((r) => active && setBooked(r))
      .catch(() => active && setBooked([]))
    return () => {
      active = false
    }
  }, [barber, date, service])

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ iso: addDays(todayStr(), i), dow: nameOf(addDays(todayStr(), i)) })),
    [],
  )

  const slots = useMemo(() => {
    if (!barber || !service) return []
    return computeAvailableSlots(date, service.duration_min, schedules, booked, blocked, barber.id)
  }, [barber, service, date, schedules, booked, blocked])

  const canContinue1 = Boolean(service)
  const canContinue2 = Boolean(barber)
  const canContinue3 = Boolean(slot && name.trim() && phone.trim().length >= 8)

  useEffect(() => {
    if (user?.user_metadata?.full_name) setName(user.user_metadata.full_name as string)
  }, [user])

  async function confirm() {
    if (!service || !barber || !slot) return
    setCreating(true)
    setError('')
    const booking = await createBooking({
      client_name: name.trim(),
      client_phone: phone.trim(),
      email: user?.email ?? null,
      user_id: user?.id ?? null,
      service_id: service.id,
      barber_id: barber.id,
      date,
      start_time: slot,
      duration_min: service.duration_min,
      price: service.price,
      notes: notes.trim() || null,
    }).catch((e) => {
      setError('No se pudo guardar la reserva. Intenta de nuevo.')
      console.error(e)
      return null
    })
    setCreating(false)
    if (booking) {
      setResult(booking)
      setStep(4)
      toast('¡Reserva confirmada!')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      toast('No se pudo guardar la reserva.', 'error')
    }
  }

  function reset() {
    setStep(1)
    setService(null)
    setBarber(null)
    setSlot(null)
    setName('')
    setPhone('')
    setNotes('')
    setResult(null)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    )
  }

  return (
    <div className="container-site py-[clamp(48px,6vw,80px)]">
      <span className="kicker">Reserva online</span>
      <h1 className="font-display mt-3.5 mb-7 text-[clamp(2rem,4vw,3rem)] font-normal">Elige y agenda tu hora</h1>

      <div className="mb-9 flex border-b border-line">
        {steps.map((label, i) => {
          const n = i + 1
          const active = n === step
          const done = n < step
          return (
            <div
              key={label}
              className={`flex-1 border-b-2 py-4 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                active ? 'border-brass text-brass' : done ? 'border-success/60 text-success' : 'border-transparent text-faint'
              }`}
            >
              <b className="font-sans text-sm font-semibold not-italic">{n}</b>
              <span> · </span>
              {label}
            </div>
          )
        })}
      </div>

      {step === 4 && result && (
        <div className="card-surface mx-auto max-w-[520px] px-8 py-10 text-center">
          <div className="mx-auto mb-5 flex h-13 w-13 items-center justify-center rounded-md border border-brass text-brass">
            <Check size={22} />
          </div>
          <h2 className="font-display mb-2.5 text-[28px] font-normal">Reserva confirmada</h2>
          <p className="text-ash">
            {formatDateLong(result.date)} · {result.start_time} · {service?.name} con {barber?.name}
          </p>
          <p className="text-ash">Te enviamos un recordatorio por WhatsApp.</p>
          <div className="mt-3 font-mono text-[13px] tracking-[0.08em] text-brass">CÓDIGO {result.code}</div>
          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={reset}>Hacer otra reserva</Button>
            <Button variant="ghost" onClick={() => (location.href = '/mis-reservas')}>
              Consultar mis reservas
            </Button>
          </div>
        </div>
      )}

      {step === 1 && (
        <Grid label="Elige tu servicio">
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <RadioCard key={s.id} selected={service?.id === s.id} onSelect={() => { setService(s); setSlot(null) }}>
                <div className="font-display text-lg">{s.name}</div>
                <p className="mt-1 text-[13.5px] text-ash">{s.description}</p>
                <div className="meta-mono mt-3 flex justify-between">
                  <span>{s.duration_min} min</span>
                  <span className="text-brass">{formatPrice(s.price)}</span>
                </div>
              </RadioCard>
            ))}
          </div>
          <StepNav back={null} next={() => setStep(2)} nextDisabled={!canContinue1} />
        </Grid>
      )}

      {step === 2 && (
        <Grid label="Elige tu barbero">
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {barbers.map((b) => (
              <RadioCard key={b.id} selected={barber?.id === b.id} onSelect={() => { setBarber(b); setSlot(null) }}>
                <div className="mb-3 aspect-[4/5] overflow-hidden rounded border border-line">
                  <img
                    src={b.image_url ?? ''}
                    alt={b.name}
                    className={`h-full w-full object-cover transition-[filter] ${barber?.id === b.id ? 'grayscale-0' : 'grayscale-[100%] contrast-[1.05]'}`}
                  />
                </div>
                <div className="font-display text-lg leading-snug">{b.name}</div>
                <div className="label-mono mt-1 text-[10px]! text-brass">{b.role ?? 'Barbero'}</div>
              </RadioCard>
            ))}
          </div>
          <StepNav back={() => setStep(1)} next={() => setStep(3)} nextDisabled={!canContinue2} />
        </Grid>
      )}

      {step === 3 && service && barber && (
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          <div>
            <span className="label-mono">Fecha</span>
            <div className="mt-2.5 grid grid-cols-4 gap-2 sm:grid-cols-7">
              {days.map((d) => {
                const sel = d.iso === date
                const past = d.iso < todayStr()
                return (
                  <button
                    key={d.iso}
                    disabled={past}
                    onClick={() => { setDate(d.iso); setSlot(null) }}
                    className={`rounded-md border px-1 py-2 text-center transition-colors disabled:cursor-not-allowed ${
                      sel ? 'border-brass bg-smoke' : 'border-line bg-coal hover:border-line-strong'
                    } ${past ? 'opacity-35' : ''}`}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-ash">{d.dow}</div>
                    <div className="font-display mt-1 text-xl">{d.iso.slice(8)}</div>
                  </button>
                )
              })}
            </div>

            <div className="mt-7">
              <span className="label-mono">Horario · {service.duration_min} min</span>
              <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    disabled={s.taken}
                    onClick={() => setSlot(s.time)}
                    className={`rounded-md border px-2 py-2.5 font-mono text-[13px] transition-colors disabled:cursor-not-allowed ${
                      slot === s.time
                        ? 'border-brass bg-brass text-carbon'
                        : s.taken
                          ? 'border-line border-dashed bg-coal opacity-35'
                          : 'border-line bg-smoke text-ivory hover:border-line-strong'
                    }`}
                  >
                    {s.time}
                  </button>
                ))}
                {slots.length === 0 && <p className="col-span-full text-sm text-faint">Sin horarios disponibles para este día.</p>}
              </div>
            </div>
          </div>

          <div>
            <div className="card-surface p-6">
              <span className="kicker">Resumen</span>
              <div className="mt-3">
                <SummaryRow k="Servicio" v={service.name} />
                <SummaryRow k="Barbero" v={barber.name} />
                <SummaryRow k="Fecha" v={slot ? `${formatDateLong(date)} · ${slot}` : 'Selecciona hora'} />
                <SummaryRow k="Duración" v={`${service.duration_min} min`} />
                <SummaryRow k="Total" v={<span className="font-mono text-brass">{formatPrice(service.price)}</span>} />
              </div>

              <div className="mt-5 space-y-4">
                <Field label="Tu nombre">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre y apellido" />
                </Field>
                <Field label="WhatsApp / Teléfono" hint="Te llegará el recordatorio aquí.">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+56 9 ..." type="tel" />
                </Field>
                <Field label="Notas (opcional)">
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="¿Algo que debamos saber?" />
                </Field>
                {error && <p className="text-sm text-error">{error}</p>}
                <Button className="w-full" onClick={confirm} disabled={!canContinue3 || creating}>
                  {creating ? 'Guardando…' : 'Confirmar reserva'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setStep(2)}>
                  ← Volver
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function nameOf(iso: string): string {
  return DAY_NAMES[dayOfWeek(iso)]
}

function Grid({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <span className="label-mono">{label}</span>
      {children}
    </>
  )
}

function RadioCard({
  selected,
  onSelect,
  children,
}: {
  selected: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`card-surface relative p-4.5 text-left transition-colors ${
        selected ? 'border-brass bg-smoke' : 'hover:border-line-strong'
      }`}
    >
      <span
        className={`absolute right-3 top-3 font-mono text-xs text-brass transition-opacity ${selected ? 'opacity-100' : 'opacity-0'}`}
      >
        ✓
      </span>
      {children}
    </button>
  )
}

function SummaryRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3 last:border-b-0">
      <span className="label-mono self-center normal-case! tracking-[0.12em]!">{k}</span>
      <span className="text-right text-[15px]">{v}</span>
    </div>
  )
}

function StepNav({ back, next, nextDisabled }: { back: (() => void) | null; next: () => void; nextDisabled: boolean }) {
  return (
    <div className="mt-7 flex justify-end gap-3">
      {back && (
        <Button variant="ghost" onClick={back}>
          ← Volver
        </Button>
      )}
      <Button onClick={next} disabled={nextDisabled}>
        Continuar →
      </Button>
    </div>
  )
}