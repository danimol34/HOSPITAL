'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
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

export async function deletePermiso(formData: FormData) {
  const id = formData.get('id') as string
  if (!id) return { success: false, error: 'ID is required' }
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('permisos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting permiso:', error)
    return { success: false, error: error.message }
  }
  
  revalidatePath('/dashboard/permisos')
  return { success: true }
}
