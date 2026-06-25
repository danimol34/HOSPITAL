'use server'

import { createClient } from '@/utils/supabase/server'

export async function savePermiso(data: any) {
  const supabase = await createClient()
  
  const { data: result, error } = await supabase
    .from('permisos')
    .insert([data])
    .select()

  if (error) {
    console.error('Error saving permiso:', error)
    return { success: false, error: error.message }
  }
  return { success: true, data: result }
}
