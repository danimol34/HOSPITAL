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

  // Automatización: Si es vacaciones, registrar automáticamente en la tabla vacaciones
  if (data.tipo === 'vacaciones' && data.cedula) {
    const { data: empData } = await supabase
      .from('empleados')
      .select('id')
      .eq('cedula', data.cedula)
      .single()

    if (empData) {
      const { error: vacError } = await supabase
        .from('vacaciones')
        .insert([{
          empleado_id: empData.id,
          fecha_inicio: data.fecha_inicio,
          fecha_fin: data.fecha_culminacion
        }])
      
      if (vacError) {
        console.error('Error auto-syncing vacaciones:', vacError)
      }
    }
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

export async function deletePermiso(formData: FormData): Promise<void> {
  const id = formData.get('id') as string
  if (!id) return
  
  const supabase = await createClient()
  const { error } = await supabase
    .from('permisos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting permiso:', error)
    return
  }
  
  revalidatePath('/dashboard/permisos')
}
