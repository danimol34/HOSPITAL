'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function HashErrorListener() {
  const router = useRouter()

  useEffect(() => {
    // Si la URL tiene un error en el hash (ej. #error=unauthorized_client), lo capturamos
    const hash = window.location.hash
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', '?'))
      const errorMsg = params.get('error_description') || params.get('error') || 'Enlace inválido o expirado.'
      
      // Limpiamos el hash para evitar bucles
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      
      // Redirigimos al login con el mensaje
      router.push(`/login?message=${encodeURIComponent(errorMsg)}`)
    }
  }, [router])

  return null
}
