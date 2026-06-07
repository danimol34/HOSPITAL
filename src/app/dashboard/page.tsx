import { createClient } from '@/utils/supabase/server'
import { CalendarDays, ArrowRight } from 'lucide-react'
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

  return (
    <div className="flex flex-col gap-6">
      {/* Banner del Hospital */}
      <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden shadow-lg border border-sys-border">
        <img 
          src="/images/hospital-banner.jpg" 
          alt="Hospital Nuestra Señora del Carmen" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-sys-primary-dark/80 to-transparent flex flex-col justify-center p-6 md:p-10">
          <h2 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
            Hospital Nuestra Señora del Carmen
          </h2>
          <p className="text-white/90 mt-2 font-medium">Sistema Administrativo de Recursos Humanos</p>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-xl font-bold text-sys-text">Resumen de Vacaciones</h1>
        </div>
        <DashboardSelector />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Widget 1: Finalización Próxima */}
        <div className="flex flex-col rounded-2xl border border-sys-border bg-sys-panel p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-sys-text">Finalización de vacaciones</h2>
              <p className="text-xs text-sys-text-dark">Próximos {daysRange} días</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sys-primary-transparent text-sys-primary">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {vacacionesActivas && vacacionesActivas.length > 0 ? (
              vacacionesActivas.map((v) => {
                const days = Math.max(0, differenceInDays(parseISO(v.fecha_fin), today))
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-xl bg-sys-bg p-4 border border-sys-border">
                    <div>
                      <p className="font-semibold text-sys-text">{v.empleados.nombres} {v.empleados.apellidos}</p>
                      <p className="text-xs text-sys-text-muted">Hasta {formatDate(v.fecha_fin)}</p>
                    </div>
                    <div className="rounded-lg bg-sys-admin/10 px-3 py-1.5 text-sm font-bold text-sys-admin">
                      Regresa en {days} días
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-sys-text-dark text-center py-8 bg-sys-bg rounded-xl border border-dashed border-sys-border">No hay finalizaciones en los próximos {daysRange} días.</p>
            )}
          </div>
        </div>

        {/* Widget 2: Inicio Próximo */}
        <div className="flex flex-col rounded-2xl border border-sys-border bg-sys-panel p-6 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-sys-text">Inicio de vacaciones</h2>
              <p className="text-xs text-sys-text-dark">Próximos {daysRange} días</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sys-visor/10 text-sys-visor">
              <ArrowRight size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {vacacionesProximas && vacacionesProximas.length > 0 ? (
              vacacionesProximas.map((v) => {
                const days = Math.max(0, differenceInDays(parseISO(v.fecha_inicio), today))
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-xl bg-sys-bg p-4 border border-sys-border">
                    <div>
                      <p className="font-semibold text-sys-text">{v.empleados.nombres} {v.empleados.apellidos}</p>
                      <p className="text-xs text-sys-text-muted">Desde {formatDate(v.fecha_inicio)}</p>
                    </div>
                    <div className="rounded-lg bg-sys-visor/10 px-3 py-1.5 text-sm font-bold text-sys-visor">
                      Inicia en {days} días
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-sys-text-dark text-center py-8 bg-sys-bg rounded-xl border border-dashed border-sys-border">No hay inicios programados en los próximos {daysRange} días.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
