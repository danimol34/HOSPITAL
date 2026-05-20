'use server'

import { createAdminClient } from '@/utils/supabase/server'
import { sendPasswordResetEmail } from '@/utils/email'
import { headers } from 'next/headers'

export async function resetPassword(email: string) {
  const supabase = await createAdminClient()

  const host = (await headers()).get('host')
  const protocol = host?.includes('localhost') ? 'http' : 'https'
  const origin = `${protocol}://${host}`

  // Generamos el enlace de recuperación usando el admin client
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email: email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/update-password`,
    }
  })

  if (error) {
    return { error: error.message }
  }

  // Enviamos el correo personalizado con nuestro transporter
  if (data?.properties?.action_link) {
    await sendPasswordResetEmail(email, data.properties.action_link)
  }

  return { success: true }
}
