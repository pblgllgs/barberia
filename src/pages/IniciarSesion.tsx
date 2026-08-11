import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/lib/auth'
import { getProfileRole } from '@/lib/api'

export default function IniciarSesion() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn(email.trim(), password)
    setLoading(false)
    if (res.error) {
      setError(res.error)
      toast(res.error, 'error')
      return
    }
    const uid = res.user?.id
    const role = uid ? await getProfileRole(uid).catch(() => null) : null
    toast(role === 'admin' ? 'Bienvenido de nuevo, admin' : '¡Sesión iniciada!')
    navigate(role === 'admin' ? '/admin' : '/perfil')
  }

  return (
    <div className="container-site flex justify-center py-[clamp(48px,6vw,80px)]">
      <div className="card-surface w-full max-w-sm p-8">
        <span className="kicker">Cliente</span>
        <h1 className="font-display mt-3 mb-6 text-[clamp(1.7rem,3vw,2.2rem)] font-normal">Iniciar sesión</h1>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </Field>
          <Field label="Contraseña">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando…' : 'Ingresar'}
          </Button>
        </form>
        <div className="mt-5 border-t border-line pt-4 text-center text-sm text-ash">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-brass hover:text-champagne">
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  )
}