import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { CalendarDays, Scissors, User as UserIcon, Clock, LogOut } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Feedback'

const nav = [
  { to: '/admin', label: 'Reservas', icon: CalendarDays, end: true },
  { to: '/admin/servicios', label: 'Servicios', icon: Scissors },
  { to: '/admin/barberos', label: 'Barberos', icon: UserIcon },
  { to: '/admin/horarios', label: 'Horarios', icon: Clock },
]

export default function AdminLayout() {
  const [email, setEmail] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      navigate('/admin/login')
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null)
      setChecking(false)
      if (!data.session) navigate('/admin/login')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null)
      if (!session) navigate('/admin/login')
    })
    return () => sub.subscription.unsubscribe()
  }, [navigate])

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-7 w-7" />
      </div>
    )
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 border-r border-line bg-coal p-6 lg:flex">
        <div className="mb-5 px-3">
          <div className="font-display text-xl">Barba <span className="text-brass">Negra</span></div>
          <div className="label-mono mt-0.5 text-[9.5px]!">Panel admin</div>
        </div>
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-smoke text-brass' : 'text-ash hover:text-ivory'
              }`
            }
          >
            <item.icon size={16} />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ash transition-colors hover:text-error"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </aside>

      <div className="min-w-0 p-6 lg:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
          <div className="flex gap-1 md:hidden">
            {nav.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className="p-2 text-ash">
                <item.icon size={18} />
              </NavLink>
            ))}
            <button onClick={logout} className="p-2 text-ash">
              <LogOut size={18} />
            </button>
          </div>
          <span className="ml-auto hidden items-center gap-2.5 font-mono text-[11.5px] tracking-[0.08em] text-ash sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-smoke text-[13px] text-brass">
              {email?.slice(0, 2).toUpperCase()}
            </span>
            {email}
          </span>
        </div>
        <Outlet />
      </div>
    </div>
  )
}