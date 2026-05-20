import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (type === 'recovery' || next === '/update-password') {
        return redirect('/update-password')
      }
      return redirect(next)
    }
    // Si hay error en el intercambio, mandarlo al login con el mensaje de error
    return redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Redirigir si no hay código
  return redirect('/login?error=no_code_provided')
}
