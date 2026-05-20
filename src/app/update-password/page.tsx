'use client'

import { useState } from 'react'
import { Activity, Eye, EyeOff } from 'lucide-react'
import { updatePassword } from './actions'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setStatus('error')
      setMessage('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Las contraseñas no coinciden')
      return
    }

    setStatus('loading')
    const res = await updatePassword(password)
    
    if (res.error) {
      setStatus('error')
      setMessage(res.error)
    } else {
      setStatus('success')
      setMessage('Contraseña actualizada con éxito. Redirigiendo al login...')
      setTimeout(() => {
        router.push('/login?message=Contraseña actualizada. Por favor inicia sesión.')
      }, 2000)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-zinc-900 shadow-2xl ring-1 ring-white/10">
        <div className="p-8">
          <div className="mb-8 flex flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Activity size={32} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Crea tu nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Por favor ingresa una nueva contraseña para tu cuenta.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="password">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:bg-zinc-800 focus:ring-1 focus:ring-emerald-500"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors z-10 touch-manipulation"
                >
                  {showPassword ? <EyeOff size={18} className="pointer-events-none" /> : <Eye size={18} className="pointer-events-none" />}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300" htmlFor="confirmPassword">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:bg-zinc-800 focus:ring-1 focus:ring-emerald-500"
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            {status === 'success' && (
              <div className="rounded-lg bg-emerald-500/10 p-3 text-center text-sm text-emerald-500">
                {message}
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500">
                {message}
              </div>
            )}

            <button
              disabled={status === 'loading'}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
              type="submit"
            >
              {status === 'loading' ? 'Guardando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
