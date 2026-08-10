import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Spinner } from '@/components/ui/Feedback'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    if (!isSupabaseConfigured()) {
      setError('Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env')
      return
    }
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) {
      setError('Credenciales inválidas.')
      return
    }
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="card-surface w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <div className="font-display text-2xl">
            Barba <span className="text-brass">Negra</span>
          </div>
          <div className="label-mono mt-1.5 text-[10px]!">Acceso al panel</div>
        </div>
        <form onSubmit={signIn} className="space-y-4">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </Field>
          <Field label="Contraseña">
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : 'Ingresar'}
          </Button>
        </form>
        <div className="mt-5 border-t border-line pt-4 text-center text-sm text-faint">
          Usuario de prueba: <span className="font-mono text-[11.5px] text-ash">admin@barbanegra.cl / admin123</span>
        </div>
      </div>
    </div>
  )
}