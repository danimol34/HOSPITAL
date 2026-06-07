import { createClient } from '@/utils/supabase/server'
import VacacionesClient from './VacacionesClient'

export default async function VacacionesPage() {
  const supabase = await createClient()

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]

  // Finalización: Vacaciones que terminan de hoy en adelante (En Curso)
  const { data: vacacionesActivas } = await supabase
    .from('vacaciones')
    .select(`
      *,
      empleados(
        nombres, 
        apellidos, 
        departamentos(
          nombre, 
          servicios(nombre)
        )
      )
    `)
    .lte('fecha_inicio', todayStr)
    .gte('fecha_fin', todayStr)
    .order('fecha_fin', { ascending: true })

  // Inicio: Vacaciones que inician en el futuro
  const { data: vacacionesProximas } = await supabase
    .from('vacaciones')
    .select(`
      *,
      empleados(
        nombres, 
        apellidos, 
        departamentos(
          nombre, 
          servicios(nombre)
        )
      )
    `)
    .gt('fecha_inicio', todayStr)
    .order('fecha_inicio', { ascending: true })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-sys-text">Listado Global de Vacaciones</h1>
        <p className="text-sm text-sys-text-muted">Consulta el estado de vacaciones de todos los empleados.</p>
      </div>

      <VacacionesClient 
        vacacionesActivas={vacacionesActivas || []} 
        vacacionesProximas={vacacionesProximas || []} 
      />
    </div>
  )
}



