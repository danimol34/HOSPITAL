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
          className="w-full rounded-xl border border-sys-border bg-sys-panel-hover/50 px-4 py-3 text-sm text-sys-text placeholder-zinc-500 outline-none transition-all focus:border-sys-primary focus:bg-sys-panel-hover focus:ring-1 focus:ring-emerald-500"
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
          <Link href="/forgot-password" className="text-xs text-sys-primary hover:text-sys-primary-hover hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            className="w-full rounded-xl border border-sys-border bg-sys-panel-hover/50 px-4 py-3 pr-12 text-sm text-sys-text placeholder-zinc-500 outline-none transition-all focus:border-sys-primary focus:bg-sys-panel-hover focus:ring-1 focus:ring-emerald-500"
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
            className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-sys-text-dark hover:text-sys-text transition-colors z-10 touch-manipulation"
          >
            {showPassword ? <EyeOff size={18} className="pointer-events-none" /> : <Eye size={18} className="pointer-events-none" />}
          </button>
        </div>
      </div>
      
      {message && (
        <div className="rounded-lg bg-sys-danger/10 p-3 text-center text-sm text-sys-danger">
          {message}
        </div>
      )}

      <button
        className="mt-2 flex w-full items-center justify-center rounded-xl bg-sys-primary-dark px-4 py-3 text-sm font-medium text-sys-text transition-all hover:bg-sys-primary active:scale-[0.98]"
        type="submit"
      >
        Iniciar Sesión
      </button>
    </form>
  )
}
