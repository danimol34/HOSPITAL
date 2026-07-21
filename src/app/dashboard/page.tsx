import { createClient } from '@/utils/supabase/server'
import { CalendarDays, ArrowRight, Users, UserCheck, UserX } from 'lucide-react'
import { differenceInDays, parseISO } from 'date-fns'
import DashboardSelector from './DashboardSelector'

function formatDate(dateString: string) {
  if (!dateString) return '--/--/----'
  return dateString.split('-').reverse().join('/')
}

export default async function DashboardPage(props: { searchParams: Promise<{ days?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const daysRange = searchParams.days ? parseInt(searchParams.days) : 5
  
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const futureDate = new Date()
  futureDate.setDate(today.getDate() + daysRange)
  const futureDateStr = futureDate.toISOString().split('T')[0]

  const { data: vacacionesActivas } = await supabase
    .from('vacaciones')
    .select('*, empleados(nombres, apellidos)')
    .lte('fecha_inicio', todayStr)
    .gte('fecha_fin', todayStr)
    .lte('fecha_fin', futureDateStr)
    .order('fecha_fin', { ascending: true })
    .limit(10)

  const { data: vacacionesProximas } = await supabase
    .from('vacaciones')
    .select('*, empleados(nombres, apellidos)')
    .gt('fecha_inicio', todayStr)
    .lte('fecha_inicio', futureDateStr)
    .order('fecha_inicio', { ascending: true })
    .limit(10)

  const { data: empleadosData } = await supabase
    .from('empleados')
    .select('situacion_laboral')

  const totalEmpleados = empleadosData?.length || 0;
  const activos = empleadosData?.filter(e => e.situacion_laboral === 'ACTIVO').length || 0;
  const inactivos = totalEmpleados - activos;

  return (
    <div className="flex flex-col gap-6">
      {/* Banner del Hospital */}
      <div className="relative w-full h-48 md:h-64 rounded-3xl overflow-hidden shadow-xl border border-sys-border bg-gradient-to-r from-blue-700 to-cyan-500">
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40"
          style={{ backgroundImage: "url('/images/hospital-banner.jpg')" }}
        />
        <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-md tracking-tight">
            Hospital Nuestra Señora del Carmen
          </h2>
          <p className="text-white/90 mt-3 text-lg md:text-xl font-medium drop-shadow-sm">Sistema Administrativo de Recursos Humanos</p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center mt-4">
        <h1 className="text-2xl font-bold text-sys-text">Resumen General</h1>
        <div className="flex-shrink-0">
          <DashboardSelector />
        </div>
      </div>

      {/* Empleados Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-500/5 transition-all hover:shadow-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-md shadow-blue-500/20">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Total Empleados</p>
              <p className="text-3xl font-extrabold text-gray-900">{totalEmpleados}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-500/5 transition-all hover:shadow-blue-500/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Activos</p>
              <p className="text-3xl font-extrabold text-gray-900">{activos}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col rounded-2xl border border-red-100 bg-white p-6 shadow-lg shadow-red-500/5 transition-all hover:shadow-red-500/10">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-white shadow-md shadow-red-500/20">
              <UserX size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500">Inactivos</p>
              <p className="text-3xl font-extrabold text-gray-900">{inactivos}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Widget 1: Finalización Próxima */}
        <div className="flex flex-col rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-900">Finalización de vacaciones</h2>
              <p className="text-sm text-blue-700/80 font-semibold">Próximos {daysRange} días</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm shadow-blue-500/20">
              <CalendarDays size={24} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {vacacionesActivas && vacacionesActivas.length > 0 ? (
              vacacionesActivas.map((v) => {
                const days = Math.max(0, differenceInDays(parseISO(v.fecha_fin), today))
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{v.empleados.nombres} {v.empleados.apellidos}</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">Hasta {formatDate(v.fecha_fin)}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 border border-blue-100">
                      Regresa en {days} días
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex items-center justify-center text-center">
                <p className="text-sm text-gray-500 font-semibold">No hay finalizaciones en los próximos {daysRange} días.</p>
              </div>
            )}
          </div>
        </div>

        {/* Widget 2: Inicio Próximo */}
        <div className="flex flex-col rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-blue-900">Inicio de vacaciones</h2>
              <p className="text-sm text-blue-700/80 font-semibold">Próximos {daysRange} días</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm shadow-blue-500/20">
              <ArrowRight size={24} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {vacacionesProximas && vacacionesProximas.length > 0 ? (
              vacacionesProximas.map((v) => {
                const days = Math.max(0, differenceInDays(parseISO(v.fecha_inicio), today))
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{v.empleados.nombres} {v.empleados.apellidos}</p>
                      <p className="text-sm text-gray-500 font-medium mt-1">Desde {formatDate(v.fecha_inicio)}</p>
                    </div>
                    <div className="rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 border border-blue-100">
                      Inicia en {days} días
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100 flex items-center justify-center text-center">
                <p className="text-sm text-gray-500 font-semibold">No hay inicios programados en los próximos {daysRange} días.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



