import { createClient } from '@/utils/supabase/server'
import AsistenciasClient from './AsistenciasClient'

export default async function AsistenciasPage() {
  const supabase = await createClient()

  // Fetch initial data (hoy)
  const today = new Date().toISOString().split('T')[0]
  
  const { data: empleados } = await supabase
    .from('empleados')
    .select('id, nombres, apellidos, cedula, nacionalidad, departamento_id, departamentos(nombre, servicio_id)')
    .order('nombres', { ascending: true })

  const { data: asistenciasHoy } = await supabase
    .from('asistencias')
    .select('*')
    .eq('fecha', today)

  const { data: departamentos } = await supabase
    .from('departamentos')
    .select('*')
    .order('nombre', { ascending: true })

  // Traer vacaciones activas hoy
  const { data: vacacionesHoy } = await supabase
    .from('vacaciones')
    .select('empleado_id')
    .lte('fecha_inicio', today)
    .gte('fecha_fin', today)

  // Filtrar empleados para que no aparezcan los que están de vacaciones
  const empleadosEnVacaciones = new Set((vacacionesHoy || []).map((v: any) => v.empleado_id))
  const empleadosActivos = (empleados || []).filter((e: any) => !empleadosEnVacaciones.has(e.id))

  const { data: servicios } = await supabase
    .from('servicios')
    .select('*')
    .order('nombre', { ascending: true })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-sys-text">Control de Asistencia</h1>
        <p className="text-sm text-sys-text-muted">Registra y monitorea las entradas y salidas del personal hoy.</p>
      </div>
      
      <AsistenciasClient 
        empleados={empleadosActivos} 
        initialAsistencias={asistenciasHoy || []} 
        departamentos={departamentos || []}
        servicios={servicios || []}
      />
    </div>
  )
}
