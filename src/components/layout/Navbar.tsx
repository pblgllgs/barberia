import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Button from '@/components/ui/Button'

const links = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/#servicios', label: 'Servicios', hash: true },
  { to: '/#barberos', label: 'Barberos', hash: true },
  { to: '/mis-reservas', label: 'Mis reservas', end: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const onNav = (link: (typeof links)[number]) => {
    setOpen(false)
    if (link.hash) {
      if (location.pathname !== '/') {
        navigate('/', { state: { scrollTo: link.to.replace('/', '') } })
      } else {
        document.querySelector(link.to)?.scrollIntoView({ behavior: 'smooth' })
      }
      return
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-carbon/90 backdrop-blur-md">
      <div className="container-site flex h-[72px] items-center justify-between">
        <Link to="/" className="font-display text-xl tracking-[0.02em]" onClick={() => setOpen(false)}>
          Barba <span className="text-brass">Negra</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) =>
            l.hash ? (
              <button
                key={l.to}
                onClick={() => onNav(l)}
                className="text-[13px] text-ash transition-colors hover:text-ivory"
              >
                {l.label}
              </button>
            ) : (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-[13px] transition-colors hover:text-ivory ${isActive ? 'border-b border-brass pb-0.5 text-ivory' : 'text-ash'}`
                }
              >
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/reservar">
            <Button variant="mono" size="sm" className="hidden sm:inline-flex">
              Reservar hora
            </Button>
          </Link>
          <button
            className="text-ivory md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menú"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-carbon px-6 py-4 md:hidden">
          {links.map((l) => (
            <button
              key={l.to}
              className="block w-full py-3 text-left font-mono text-xs uppercase tracking-[0.14em] text-ivory"
              onClick={() => onNav(l)}
            >
              {l.label}
            </button>
          ))}
          <Link to="/reservar" className="mt-2 block" onClick={() => setOpen(false)}>
            <Button className="w-full">Reservar hora</Button>
          </Link>
        </nav>
      )}
    </header>
  )
}