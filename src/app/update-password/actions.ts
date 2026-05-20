'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePassword(newPassword: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  // Forzamos el cierre de sesión para que tengan que entrar con la nueva clave
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')

  return { success: true }
}
