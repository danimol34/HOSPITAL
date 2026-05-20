import { createClient } from '@/utils/supabase/server'
import EmpleadosClient from './EmpleadosClient'

export default async function EmpleadosPage() {
  const supabase = await createClient()

  // Fetch initial data
  const { data: empleados } = await supabase
    .from('empleados')
    .select('*, departamentos(nombre, servicio_id)')
    .order('created_at', { ascending: false })

  const { data: departamentos } = await supabase
    .from('departamentos')
    .select('*')
    .order('nombre', { ascending: true })

  const { data: servicios } = await supabase
    .from('servicios')
    .select('*')
    .order('nombre', { ascending: true })

  const { data: vacaciones } = await supabase
    .from('vacaciones')
    .select('*')
    .order('fecha_inicio', { ascending: false })

  // Determine user role
  const { data: { user } } = await supabase.auth.getUser()
  let isVisor = true
  if (user) {
    const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    if (perfil && perfil.rol === 'admin') isVisor = false
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Directorio de Empleados</h1>
        <p className="text-sm text-zinc-400">Gestiona la información del personal del hospital.</p>
      </div>
      
      <EmpleadosClient 
        initialEmpleados={empleados || []} 
        departamentos={departamentos || []} 
        servicios={servicios || []}
        initialVacaciones={vacaciones || []}
        isVisor={isVisor}
      />
    </div>
  )
}
