'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=No%20se%20pudo%20iniciar%20sesi%C3%B3n.%20Revisa%20tus%20credenciales.')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
