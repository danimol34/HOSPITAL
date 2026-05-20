'use client'

import { useState } from 'react'
import { Activity } from 'lucide-react'
import Link from 'next/link'
import { resetPassword } from './actions'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    
    const res = await resetPassword(email)
    
    if (res.error) {
      setStatus('error')
      setMessage(res.error)
    } else {
      setStatus('success')
      setMessage('Te hemos enviado un correo con el enlace para restablecer tu contraseña. Por favor, revisa tu bandeja de entrada.')
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
              Recuperar Contraseña
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Ingresa tu correo para recibir un enlace de recuperación.
            </p>
          </div>

          {status === 'success' ? (
            <div className="flex flex-col gap-6 text-center">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 text-sm">
                {message}
              </div>
              <Link href="/login" className="text-sm font-medium text-white hover:text-emerald-400 transition-colors">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300" htmlFor="email">
                  Correo Electrónico
                </label>
                <input
                  className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:bg-zinc-800 focus:ring-1 focus:ring-emerald-500"
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@hospital.com"
                  required
                />
              </div>
              
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
                {status === 'loading' ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
              
              <div className="text-center mt-2">
                <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                  Cancelar y volver
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
