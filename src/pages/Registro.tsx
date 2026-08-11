import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { useAuth } from '@/lib/auth'

export default function Registro() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError('')
    const res = await signUp(email.trim(), password, fullName.trim())
    setLoading(false)
    if (res.error) {
      setError(res.error)
      return
    }
    if (res.needsConfirmation) {
      setInfo('Revisa tu correo para confirmar la cuenta antes de iniciar sesión.')
      return
    }
    navigate('/perfil')
  }

  return (
    <div className="container-site flex justify-center py-[clamp(48px,6vw,80px)]">
      <div className="card-surface w-full max-w-sm p-8">
        <span className="kicker">Cliente</span>
        <h1 className="font-display mt-3 mb-1 text-[clamp(1.7rem,3vw,2.2rem)] font-normal">Crear cuenta</h1>
        <p className="mb-6 text-sm text-ash">
          Registra tu cuenta para ver tus reservas y acumular visitas para tu beneficio.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Nombre">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required autoComplete="name" />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </Field>
          <Field label="Contraseña" hint="Mínimo 6 caracteres.">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </Field>
          {error && <p className="text-sm text-error">{error}</p>}
          {info && <p className="text-sm text-success">{info}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta…' : 'Registrarme'}
          </Button>
        </form>
        <div className="mt-5 border-t border-line pt-4 text-center text-sm text-ash">
          ¿Ya tienes cuenta?{' '}
          <Link to="/iniciar-sesion" className="text-brass hover:text-champagne">
            Inicia sesión
          </Link>
        </div>
      </div>
    </div>
  )
}