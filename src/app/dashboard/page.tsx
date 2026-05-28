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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-sys-text">Hospital Nuestra Señora del Carmen</h1>
          <p className="text-sm text-sys-text-muted">Sistema Administrativo Interno</p>
        </div>
        <DashboardSelector />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Widget 1: Finalización Próxima */}
        <div className="flex flex-col rounded-2xl border border-sys-border bg-sys-panel/50 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-sys-text">Finalización de vacaciones</h2>
              <p className="text-xs text-sys-text-dark">Próximos {daysRange} días</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sys-primary/10 text-sys-primary">
              <CalendarDays size={20} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {vacacionesActivas && vacacionesActivas.length > 0 ? (
              vacacionesActivas.map((v) => {
                const days = Math.max(0, differenceInDays(parseISO(v.fecha_fin), today))
                return (
                  <div key={v.id} className="flex items-center justify-between rounded-xl bg-black/20 p-4">
                    <div>
                      <p className="font-medium text-zinc-200">{v.empleados.nombres} {v.empleados.apellidos}</p>
                      <p className="text-xs text-sys-text-dark">Hasta {formatDate(v.fecha_fin)}</p>
                    </div>
                    <div className="rounded-lg bg-sys-admin/10 px-3 py-1.5 text-sm font-medium text-sys-admin">
                      Regresa en {days} días
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-sys-text-dark text-center py-8">No hay finalizaciones en los próximos {daysRange} días.</p>
            )}
          </div>
        </div>

        {/* Widget 2: Inicio Próximo */}
        <div className="flex flex-col rounded-2xl border border-sys-border bg-sys-panel/50 p-6 shadow-xl">
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
                  <div key={v.id} className="flex items-center justify-between rounded-xl bg-black/20 p-4">
                    <div>
                      <p className="font-medium text-zinc-200">{v.empleados.nombres} {v.empleados.apellidos}</p>
                      <p className="text-xs text-sys-text-dark">Desde {formatDate(v.fecha_inicio)}</p>
                    </div>
                    <div className="rounded-lg bg-sys-visor/10 px-3 py-1.5 text-sm font-medium text-sys-visor">
                      Inicia en {days} días
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-sys-text-dark text-center py-8">No hay inicios programados en los próximos {daysRange} días.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
