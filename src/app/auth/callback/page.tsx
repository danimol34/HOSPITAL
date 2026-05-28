'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Activity } from 'lucide-react'

function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code')
      const next = searchParams.get('next') ?? '/dashboard'
      const hash = window.location.hash

      // 0. Si el enlace ya expiró o fue usado (ej. segundo clic), Supabase manda el error por query
      const queryError = searchParams.get('error')
      const queryErrorDesc = searchParams.get('error_description')
      if (queryError || queryErrorDesc) {
        setError(queryErrorDesc || queryError || 'El enlace ya fue utilizado o ha expirado.')
        return
      }

      // 1. Si hay un error en el hash, mostrarlo inmediatamente
      if (hash.includes('error=')) {
        const params = new URLSearchParams(hash.replace('#', '?'))
        setError(params.get('error_description') || params.get('error') || 'Error de autenticación')
        return
      }

      // 2. Manejar flujo PKCE (Code)
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (exchangeError) setError(exchangeError.message)
        else router.push(next === '/dashboard' ? '/update-password' : next)
        return
      }

      // 3. Manejar flujo Implícito (Hash) - EXTRACCIÓN MANUAL DIRECTA
      if (hash.includes('access_token=')) {
        const params = new URLSearchParams(hash.replace('#', '?'))
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')

        if (access_token && refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token
          })
          
          if (!setSessionError) {
            router.push('/update-password')
            return
          } else {
            setError(setSessionError.message)
            return
          }
        }
      }

      // 4. Fallback: Ver si ya hay sesión por otros medios
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Si el enlace original o el contexto sugieren que es para actualizar contraseña, forzar esa ruta
        const isRecovery = window.location.hash.includes('type=recovery') || 
                           window.location.search.includes('update-password') || 
                           next === '/update-password'
        
        router.push(isRecovery ? '/update-password' : next)
        return
      }

      // 5. Si después de un momento no hay nada, dar error
      const timeout = setTimeout(() => {
        setError('No se pudo establecer la sesión. El enlace podría haber expirado o ser inválido.')
      }, 5000)

      return () => clearTimeout(timeout)
    }

    handleAuth()
  }, [searchParams, supabase, router])

  if (error) {
    router.push(`/login?message=${encodeURIComponent(error)}`)
    return null
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-sys-bg text-sys-text">
      <div className="flex flex-col items-center gap-4">
        <Activity className="h-12 w-12 animate-pulse text-sys-primary" />
        <h1 className="text-xl font-bold">Validando credenciales...</h1>
        <p className="text-sm text-sys-text-dark text-center px-4">
          Por favor espera un momento mientras procesamos tu acceso seguro.
        </p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full flex-col items-center justify-center bg-sys-bg text-sys-text">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-12 w-12 animate-pulse text-sys-primary" />
          <h1 className="text-xl font-bold">Cargando...</h1>
        </div>
      </div>
    }>
      <AuthCallback />
    </Suspense>
  )
}
