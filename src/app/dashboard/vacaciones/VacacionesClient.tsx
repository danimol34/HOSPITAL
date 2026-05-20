'use client'

import { useState } from 'react'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'

function formatDate(dateString: string) {
  if (!dateString) return '--/--/----'
  return dateString.split('-').reverse().join('/')
}

export default function VacacionesClient({ vacacionesActivas, vacacionesProximas }: any) {
  const [activeTab, setActiveTab] = useState<'inicio' | 'finalizacion'>('inicio')

  const today = new Date()

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs Navigation */}
      <div className="flex gap-6 border-b border-white/10 mb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('inicio')}
          className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'inicio' ? 'text-blue-400' : 'text-zinc-500 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><ArrowRight size={16}/> Inicio de Vacaciones</div>
          {activeTab === 'inicio' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-blue-400 rounded-t-full"></div>}
        </button>

        <button 
          onClick={() => setActiveTab('finalizacion')}
          className={`pb-3 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'finalizacion' ? 'text-orange-400' : 'text-zinc-500 hover:text-white'}`}
        >
          <div className="flex items-center gap-2"><CalendarDays size={16}/> Finalización de Vacaciones</div>
          {activeTab === 'finalizacion' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-orange-400 rounded-t-full"></div>}
        </button>
      </div>

      {/* Tabs Content */}
      <div className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-xl">
        {activeTab === 'inicio' && (
          <div className="flex flex-col">
            {vacacionesProximas.length > 0 ? (
              vacacionesProximas.map((v: any) => {
                const days = Math.max(0, differenceInDays(parseISO(v.fecha_inicio), today))
                const depto = v.empleados?.departamentos?.nombre || 'Sin Depto'
                const division = v.empleados?.departamentos?.servicios?.nombre || 'Sin División'

                return (
                  <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 py-4 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 font-medium">
                        {days}d
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium text-white text-base">{v.empleados.nombres} {v.empleados.apellidos}</p>
                        <p className="text-xs text-zinc-400">{division} • {depto}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <div className="text-sm font-medium text-blue-400">Inicia en {days} días</div>
                      <div className="text-xs text-zinc-500 font-medium">El {formatDate(v.fecha_inicio)}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-zinc-500 py-4 text-center">No hay vacaciones programadas a futuro.</p>
            )}
          </div>
        )}

        {activeTab === 'finalizacion' && (
          <div className="flex flex-col">
            {vacacionesActivas.length > 0 ? (
              vacacionesActivas.map((v: any) => {
                const days = Math.max(0, differenceInDays(parseISO(v.fecha_fin), today))
                const depto = v.empleados?.departamentos?.nombre || 'Sin Depto'
                const division = v.empleados?.departamentos?.servicios?.nombre || 'Sin División'

                return (
                  <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 py-4 last:border-0 hover:bg-white/5 transition-colors px-2 rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/10 text-orange-400 font-medium">
                        {days}d
                      </div>
                      <div className="flex flex-col">
                        <p className="font-medium text-white text-base">{v.empleados.nombres} {v.empleados.apellidos}</p>
                        <p className="text-xs text-zinc-400">{division} • {depto}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end">
                      <div className="text-sm font-medium text-orange-400">Regresa en {days} días</div>
                      <div className="text-xs text-zinc-500 font-medium">El {formatDate(v.fecha_fin)}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-zinc-500 py-4 text-center">No hay empleados de vacaciones actualmente.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
