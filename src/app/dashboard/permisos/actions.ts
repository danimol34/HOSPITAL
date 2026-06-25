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

export async function getPermisos() {
  const supabase = await createClient()
  
  const { data: result, error } = await supabase
    .from('permisos')
    .select('*')
    .order('creado_en', { ascending: false })

  if (error) {
    console.error('Error fetching permisos:', error)
    return { success: false, error: error.message, data: [] }
  }
  return { success: true, data: result || [] }
}
