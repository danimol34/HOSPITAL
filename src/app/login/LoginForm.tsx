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
        <label className="text-sm font-bold text-slate-600" htmlFor="email">
          Correo Electrónico
        </label>
        <input
          className="w-full rounded-xl border border-sys-border bg-white px-4 py-3 text-sm text-sys-text placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
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
          <label className="text-sm font-bold text-slate-600" htmlFor="password">
            Contraseña
          </label>
          <Link href="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        <div className="relative">
          <input
            className="w-full rounded-xl border border-sys-border bg-white px-4 py-3 pr-12 text-sm text-sys-text placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
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
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
        type="submit"
      >
        Iniciar Sesión
      </button>
    </form>
  )
}
