'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { sendWelcomeEmail } from '@/utils/email'

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rol = formData.get('rol') as string
  
  const user_metadata = {
    rol,
    nacionalidad: formData.get('nacionalidad') as string,
    cedula: parseInt(formData.get('cedula') as string),
    nombres: formData.get('nombres') as string,
    apellidos: formData.get('apellidos') as string,
    sexo: formData.get('sexo') as string,
    lugar_nacimiento: formData.get('lugar_nacimiento') as string,
    fecha_nacimiento: formData.get('fecha_nacimiento') as string
  }

  // We need to use the service role key to use the Admin API
  // This avoids logging out the current user and allows silent creation
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Create user in Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the email
    user_metadata // Pass the data so the trigger picks it up
  })

  if (authError) {
    return { error: authError.message }
  }

  // Enviar el correo
  try {
    await sendWelcomeEmail(email, password, rol)
  } catch (err) {
    console.error('Error enviando correo:', err)
    // We don't return error here because the user was already created successfully in DB
  }

  revalidatePath('/dashboard/usuarios')
  
  return { user: authData.user }
}

export async function removeUser(userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Primero eliminamos de Auth, lo cual debería disparar el borrado en cascada en perfiles
  // o al menos liberar el email para futuros registros.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  // Por si acaso no hay cascada, intentamos borrar el perfil explícitamente
  await supabaseAdmin.from('perfiles').delete().eq('id', userId)

  revalidatePath('/dashboard/usuarios')
  return { success: true }
}
