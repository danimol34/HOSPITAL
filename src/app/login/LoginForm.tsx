'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { login } from './actions'
import Link from 'next/link'

export function LoginForm({ message }: { message?: string }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <form action={login} className="flex flex-col gap-5" autoComplete="off">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-300" htmlFor="email">
          Correo Electrónico
        </label>
        <input
          className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:bg-zinc-800 focus:ring-1 focus:ring-emerald-500"
          id="email"
          name="email"
          type="email"
          placeholder="usuario@hospital.com"
          required
          autoComplete="off"
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300" htmlFor="password">
            Contraseña
          </label>
          <Link href="/forgot-password" className="text-xs text-emerald-500 hover:text-emerald-400 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-3 pr-12 text-sm text-white placeholder-zinc-500 outline-none transition-all focus:border-emerald-500 focus:bg-zinc-800 focus:ring-1 focus:ring-emerald-500"
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            required
            autoComplete="new-password"
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
      
      {message && (
        <div className="rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500">
          {message}
        </div>
      )}

      <button
        className="mt-2 flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
        type="submit"
      >
        Iniciar Sesión
      </button>
    </form>
  )
}
