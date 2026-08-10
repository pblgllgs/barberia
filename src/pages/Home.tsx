import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Feedback'
import { getServices, getBarbers } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import type { Service, Barber } from '@/lib/types'

const HERO_IMG = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=900&q=80'
const HOME_BASE = 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=80'

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getServices(), getBarbers()])
      .then(([s, b]) => {
        setServices(s)
        setBarbers(b)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="container-site grid items-center gap-12 py-[clamp(70px,10vw,130px)] md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="kicker">Barbershop · Desde 2012</span>
          <h1 className="font-display mt-5 text-[clamp(2.6rem,5.4vw,4.6rem)] font-normal leading-[1.06] tracking-[-0.01em]">
            Cortes con <em className="italic text-brass">carácter.</em>
            <br />
            Tradición moderna.
          </h1>
          <p className="mt-5 mb-7 max-w-[46ch] text-[17px] text-ash">
            Barbería clásica de barrio con barberos profesionales. Reserva tu hora en línea y deja el resto en manos
            del oficio.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/reservar">
              <Button size="lg">Reservar hora</Button>
            </Link>
            <a href="#servicios">
              <Button variant="outline" size="lg">
                Ver servicios
              </Button>
            </a>
          </div>
          <div className="mt-11 flex gap-12">
            <div>
              <div className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)]">12+</div>
              <div className="label-mono mt-1 text-[10.5px]!">Años de oficio</div>
            </div>
            <div>
              <div className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)]">4</div>
              <div className="label-mono mt-1 text-[10.5px]!">Barberos expertos</div>
            </div>
            <div>
              <div className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)]">9.8k</div>
              <div className="label-mono mt-1 text-[10.5px]!">Cortes realizados</div>
            </div>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-line">
          <img
            src={HERO_IMG}
            alt="Interior de la barbería"
            className="h-full w-full object-cover grayscale-[100%] contrast-[1.05]"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-carbon/85" />
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="section hairline-t">
        <div className="container-site">
          <span className="kicker">Servicios</span>
          <h2 className="section-title">Nuestra carta de cortes</h2>
          <p className="intro">Precios y duraciones orientativos. Tu barbero puede recomendar el servicio según tu tipo de pelo y estilo.</p>

          {loading ? (
            <div className="mt-10 flex justify-center py-16">
              <Spinner className="h-7 w-7" />
            </div>
          ) : (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <Link key={s.id} to="/reservar" className="card-surface group p-5 transition-colors hover:border-brass">
                  <div className="mb-4 aspect-[16/10] overflow-hidden rounded border border-line">
                    <img
                      src={s.image_url ?? ''}
                      alt={s.name}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale-[100%] contrast-[1.05] transition-[filter] duration-300 group-hover:grayscale-0"
                    />
                  </div>
                  <h3 className="font-display mb-2 text-xl">{s.name}</h3>
                  <p className="mb-4 text-[14.5px] text-ash">{s.description}</p>
                  <div className="meta-mono flex justify-between">
                    <span>{s.duration_min} min</span>
                    <span className="text-brass">{formatPrice(s.price)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Barberos */}
      <section id="barberos" className="section hairline-t">
        <div className="container-site">
          <span className="kicker">El equipo</span>
          <h2 className="section-title">Tus barberos</h2>

          {loading ? (
            <div className="mt-10 flex justify-center py-16">
              <Spinner className="h-7 w-7" />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 grid-cols-2 lg:grid-cols-4">
              {barbers.map((b) => (
                <Link
                  key={b.id}
                  to="/reservar"
                  className="group"
                >
                  <div className="mb-3.5 aspect-[4/5] overflow-hidden rounded border border-line">
                    <img
                      src={b.image_url ?? ''}
                      alt={b.name}
                      loading="lazy"
                      className="h-full w-full object-cover grayscale-[100%] contrast-[1.05] transition-[filter] duration-300 group-hover:grayscale-0"
                    />
                  </div>
                  <div className="font-display text-xl">{b.name}</div>
                  <div className="label-mono mt-0.5 text-[10.5px]! text-brass">{b.role ?? 'Barbero'}</div>
                  <div className="mt-1.5 text-[13.5px] text-ash">{b.specialty}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section hairline-t">
        <div className="container-site">
          <div className="card-surface grid items-center gap-6 p-[clamp(32px,4vw,56px)] md:grid-cols-[1fr_auto]">
            <div>
              <span className="kicker">Horas online</span>
              <h2 className="font-display mt-3 text-[clamp(1.7rem,3vw,2.5rem)] font-normal leading-tight">
                Reserva en menos de <em className="italic text-brass">60 segundos</em>
              </h2>
              <p className="mt-2.5 max-w-[48ch] text-ash">
                Elige servicio, barbero y hora. Confirmación inmediata y recordatorio por WhatsApp.
              </p>
            </div>
            <Link to="/reservar">
              <Button size="lg">Reservar hora</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Banda imagen completa */}
      <section className="section hairline-t py-0!">
        <img src={HOME_BASE} alt="Ambiente de la barbería" loading="lazy" className="h-64 w-full object-cover grayscale-[100%] contrast-[1.05] md:h-80" />
      </section>
    </>
  )
}