'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Bell, Clock, Search, CheckCircle2, Pencil, Check, X, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// Helper para formato 12h
function format12h(timeString: string) {
  if (!timeString) return '--:--'
  const [hourStr, minuteStr] = timeString.split(':')
  let hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  hour = hour % 12 || 12
  return `${hour.toString().padStart(2, '0')}:${minuteStr} ${ampm}`
}

function formatDate(dateString: string) {
  if (!dateString) return '--/--/----'
  return dateString.split('-').reverse().join('/')
}

export default function AsistenciasClient({ empleados, initialAsistencias, departamentos, servicios }: any) {
  const supabase = createClient()
  const [asistencias, setAsistencias] = useState<any[]>(initialAsistencias)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startDay = getDay(monthStart)
  
  const blanks = Array(startDay === 0 ? 6 : startDay - 1).fill(null)
  const allDays = [...blanks, ...daysInMonth]
  useEffect(() => {
    const fetchAsistencias = async () => {
      setIsLoading(true)
      const { data } = await supabase
        .from('asistencias')
        .select('*')
        .eq('fecha', selectedDate)
      setAsistencias(data || [])
      setIsLoading(false)
    }
    fetchAsistencias()
  }, [selectedDate])

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterServicioId, setFilterServicioId] = useState('')
  const [filterDeptoId, setFilterDeptoId] = useState('')

  // Edit State
  const [editEmpId, setEditEmpId] = useState<string | null>(null)
  const [editEntrada, setEditEntrada] = useState('')
  const [editSalida, setEditSalida] = useState('')
  const [activeTab, setActiveTab] = useState<'pendientes' | 'registrados'>('pendientes')

  const handleMarcarEntrada = async (empleadoId: string) => {
    const hora = new Date().toTimeString().split(' ')[0].slice(0, 5) // HH:MM
    
    // Primero verificamos si ya existe el registro
    const { data: existing } = await supabase
      .from('asistencias')
      .select('id')
      .eq('empleado_id', empleadoId)
      .eq('fecha', selectedDate)
      .single()

    let res;
    if (existing) {
      res = await supabase
        .from('asistencias')
        .update({ hora_entrada: hora })
        .eq('id', existing.id)
        .select()
    } else {
      res = await supabase
        .from('asistencias')
        .insert([{ empleado_id: empleadoId, fecha: selectedDate, hora_entrada: hora }])
        .select()
    }

    const { data, error } = res

    if (data && !error) {
      // Actualizamos el estado si ya existía, o lo añadimos si es nuevo.
      const existingIndex = asistencias.findIndex(a => a.id === data[0].id)
      if (existingIndex >= 0) {
        setAsistencias(asistencias.map(a => a.id === data[0].id ? data[0] : a))
      } else {
        setAsistencias([...asistencias, data[0]])
      }
    } else {
      alert(error?.message || 'Error al marcar entrada.')
    }
  }

  const handleMarcarSalida = async (asistenciaId: string) => {
    const hora = new Date().toTimeString().split(' ')[0].slice(0, 5)
    const { data, error } = await supabase
      .from('asistencias')
      .update({ hora_salida: hora })
      .eq('id', asistenciaId)
      .select()

    if (data && !error) {
      setAsistencias(asistencias.map((a) => a.id === asistenciaId ? data[0] : a))
    } else {
      alert(error?.message || 'Error al marcar salida.')
    }
  }

  const handleSaveEdit = async (empleadoId: string, asistenciaId: string | undefined) => {
    // Si no hay hora de entrada, no se puede guardar solo salida
    if (!editEntrada && editSalida) {
      alert('Debes ingresar una hora de entrada primero.')
      return
    }

    const payload = {
      hora_entrada: editEntrada || null,
      hora_salida: editSalida || null,
    }

    if (asistenciaId) {
      // Actualizar
      const { data, error } = await supabase
        .from('asistencias')
        .update(payload)
        .eq('id', asistenciaId)
        .select()

      if (data && !error) {
        setAsistencias(asistencias.map((a) => a.id === asistenciaId ? data[0] : a))
        setEditEmpId(null)
      } else alert(error?.message || 'Error al actualizar.')
    } else {
      // Crear nuevo registro si no existía
      if (!editEntrada) {
        setEditEmpId(null) // Canceló porque todo está vacío
        return
      }

      // Verificamos por si acaso ya se creó uno
      const { data: existing } = await supabase
        .from('asistencias')
        .select('id')
        .eq('empleado_id', empleadoId)
        .eq('fecha', selectedDate)
        .single()

      let res;
      if (existing) {
        res = await supabase
          .from('asistencias')
          .update(payload)
          .eq('id', existing.id)
          .select()
      } else {
        res = await supabase
          .from('asistencias')
          .insert([{ empleado_id: empleadoId, fecha: selectedDate, ...payload }])
          .select()
      }

      const { data, error } = res

      if (data && !error) {
        const existingIndex = asistencias.findIndex(a => a.id === data[0].id)
        if (existingIndex >= 0) {
          setAsistencias(asistencias.map(a => a.id === data[0].id ? data[0] : a))
        } else {
          setAsistencias([...asistencias, data[0]])
        }
        setEditEmpId(null)
      } else alert(error?.message || 'Error al guardar.')
    }
  }

  const startEdit = (empId: string, asistencia: any) => {
    setEditEmpId(empId)
    setEditEntrada(asistencia?.hora_entrada ? asistencia.hora_entrada.slice(0, 5) : '07:00')
    setEditSalida(asistencia?.hora_salida ? asistencia.hora_salida.slice(0, 5) : '15:00') // 03:00 PM como salida predeterminada
  }

  // Filter Logic
  const filterDeptosDisponibles = filterServicioId 
    ? departamentos.filter((d: any) => d.servicio_id === filterServicioId)
    : departamentos

  const filteredEmpleados = empleados.filter((e: any) => {
    const matchSearch = e.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || e.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || e.cedula.includes(searchTerm)
    const matchServicio = filterServicioId ? e.departamentos?.servicio_id === filterServicioId : true
    const matchDepto = filterDeptoId ? e.departamento_id === filterDeptoId : true
    return matchSearch && matchServicio && matchDepto
  })

  return (
    <div className="flex flex-col gap-6">
      {/* BARRA DE FILTROS Y SELECTOR DE FECHA */}
      <div className="flex flex-col md:flex-row gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 shadow-xl md:items-center">
        <div className="flex flex-col gap-1 w-full md:max-w-[150px]">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Fecha</label>
          <button 
            onClick={() => setShowCalendar(!showCalendar)}
            className={`flex items-center justify-between gap-2 w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-2 text-sm font-bold transition-all ${showCalendar ? 'border-emerald-500 text-emerald-500' : 'text-white hover:bg-white/5'}`}
          >
            <CalendarDays size={18} />
            {formatDate(selectedDate)}
          </button>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Búsqueda</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              type="text"
              placeholder="Nombre o Cédula..."
              className="w-full rounded-xl border border-white/10 bg-zinc-800/50 py-2 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full md:max-w-[180px]">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">División</label>
          <select
            className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            value={filterServicioId}
            onChange={(e) => {
              setFilterServicioId(e.target.value);
              setFilterDeptoId('');
            }}
          >
            <option value="">Todas</option>
            {servicios.map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1 w-full md:max-w-[180px]">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold ml-1">Departamento</label>
          <select
            className="w-full rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50"
            value={filterDeptoId}
            onChange={(e) => setFilterDeptoId(e.target.value)}
            disabled={!filterServicioId}
          >
            <option value="">Todos</option>
            {filterDeptosDisponibles.map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* CALENDARIO PROFESIONAL (CONDICIONAL) */}
        {showCalendar && (
          <div className="absolute top-0 left-0 z-50 w-full lg:w-80 shrink-0 rounded-2xl border border-emerald-500/30 bg-zinc-950 p-5 shadow-2xl ring-1 ring-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Seleccionar Fecha</h3>
              <div className="flex gap-1">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            
            <div className="text-center text-sm font-bold text-white mb-4 capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                <span key={d} className="text-[10px] font-bold text-zinc-600">{d}</span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {allDays.map((date, i) => {
                if (!date) return <div key={`blank-${i}`} className="h-8 w-8" />
                const dateStr = format(date, 'yyyy-MM-dd')
                const isSelected = selectedDate === dateStr
                const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setShowCalendar(false); // Cerrar al seleccionar
                    }}
                    className={`h-8 w-8 rounded-lg text-[11px] font-medium transition-all flex items-center justify-center
                      ${isSelected ? 'bg-emerald-600 text-white shadow-lg scale-110' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}
                      ${isToday && !isSelected ? 'border border-emerald-500/50 text-emerald-500' : ''}
                    `}
                  >
                    {format(date, 'd')}
                  </button>
                )
              })}
            </div>
            <button 
              onClick={() => setShowCalendar(false)}
              className="mt-4 w-full py-2 text-[10px] uppercase font-bold text-zinc-500 hover:text-white transition-colors border-t border-white/5"
            >
              Cerrar Calendario
            </button>
          </div>
        )}

        {/* LISTAS */}
        <div className="flex-1 flex flex-col gap-6">

      {(() => {
        const asistenciasMap = new Map(asistencias.map(a => [a.empleado_id, a]))
        
        const asistieron = filteredEmpleados
          .filter((e: any) => asistenciasMap.has(e.id))
          .sort((a: any, b: any) => {
            const asisA = asistenciasMap.get(a.id)
            const asisB = asistenciasMap.get(b.id)
            const salA = asisA?.hora_salida ? 1 : 0
            const salB = asisB?.hora_salida ? 1 : 0
            return salA - salB // Los que no tienen salida (0) van antes que los que sí (1)
          })

        const pendientes = filteredEmpleados.filter((e: any) => !asistenciasMap.has(e.id))

        return (
          <div className="flex flex-col gap-6">
            {/* TABS SELECTOR */}
            <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-white/5 w-fit">
              <button
                onClick={() => setActiveTab('pendientes')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'pendientes' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Pendientes por Marcar ({pendientes.length})
              </button>
              <button
                onClick={() => setActiveTab('registrados')}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'registrados' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Asistencia Registrada ({asistieron.length})
              </button>
            </div>

            {/* PENDIENTES */}
            {activeTab === 'pendientes' && (
              <div className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                      <thead className="border-b border-white/10 bg-black/20 text-xs uppercase text-zinc-300">
                        <tr>
                          <th className="px-6 py-4 font-medium">Empleado</th>
                          <th className="px-6 py-4 font-medium">Cédula</th>
                          <th className="px-6 py-4 font-medium">Departamento</th>
                          <th className="px-6 py-4 font-medium text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {pendientes.map((emp: any) => {
                          const isEditing = editEmpId === emp.id
                          return (
                            <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-500">
                                    <Clock size={16} />
                                  </div>
                                  <span className="font-semibold text-white">{emp.nombres} {emp.apellidos}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-medium">{emp.nacionalidad}-{emp.cedula}</td>
                              <td className="px-6 py-4 text-xs">{emp.departamentos?.nombre || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-3">
                                  {isEditing ? (
                                    <div className="flex flex-col items-center gap-2">
                                      <div className="flex gap-2">
                                        <input type="time" className="rounded border border-white/20 bg-zinc-800 px-2 py-1 text-xs text-white" value={editEntrada} onChange={(e) => setEditEntrada(e.target.value)} />
                                        <input type="time" className="rounded border border-white/20 bg-zinc-800 px-2 py-1 text-xs text-white" value={editSalida} onChange={(e) => setEditSalida(e.target.value)} />
                                      </div>
                                      <div className="flex gap-2">
                                        <button onClick={() => handleSaveEdit(emp.id, undefined)} className="text-[10px] font-bold text-emerald-500 hover:underline">Guardar</button>
                                        <button onClick={() => setEditEmpId(null)} className="text-[10px] font-bold text-zinc-500 hover:underline">Cancelar</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <button onClick={() => startEdit(emp.id, null)} className="text-zinc-500 hover:text-blue-400" title="Editar manual"><Pencil size={16} /></button>
                                      <button onClick={() => handleMarcarEntrada(emp.id)} className="rounded-lg bg-emerald-600/20 px-3 py-1.5 text-xs font-bold text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/30">Marcar Entrada</button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {pendientes.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-500 italic">No hay empleados pendientes para este día.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* REGISTRADOS */}
            {activeTab === 'registrados' && (
              <div className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50 shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400">
                      <thead className="border-b border-white/10 bg-black/20 text-xs uppercase text-zinc-300">
                        <tr>
                          <th className="px-6 py-4 font-medium">Empleado</th>
                          <th className="px-6 py-4 font-medium text-center">Entrada</th>
                          <th className="px-6 py-4 font-medium text-center">Salida</th>
                          <th className="px-6 py-4 font-medium text-right w-[200px]">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {asistieron.map((emp: any) => {
                          const asistencia = asistencias.find((a) => a.empleado_id === emp.id)
                          const tieneSalida = !!asistencia?.hora_salida
                          const isEditing = editEmpId === emp.id
                          
                          return (
                            <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                                    <Check size={16} />
                                  </div>
                                  <span className="font-semibold text-white">{emp.nombres} {emp.apellidos}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center font-bold text-emerald-400">{format12h(asistencia.hora_entrada)}</td>
                              <td className="px-6 py-4 text-center font-bold text-blue-400">{tieneSalida ? format12h(asistencia.hora_salida) : '--:--'}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-3">
                                  {isEditing ? (
                                    <div className="flex flex-col items-end gap-2">
                                      <div className="flex gap-2">
                                        <input type="time" className="rounded border border-white/20 bg-zinc-800 px-2 py-1 text-xs text-white" value={editEntrada} onChange={(e) => setEditEntrada(e.target.value)} />
                                        <input type="time" className="rounded border border-white/20 bg-zinc-800 px-2 py-1 text-xs text-white" value={editSalida} onChange={(e) => setEditSalida(e.target.value)} />
                                      </div>
                                      <div className="flex gap-2">
                                        <button onClick={() => handleSaveEdit(emp.id, asistencia.id)} className="text-[10px] font-bold text-emerald-500 hover:underline">Guardar</button>
                                        <button onClick={() => setEditEmpId(null)} className="text-[10px] font-bold text-zinc-500 hover:underline">Cancelar</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <button onClick={() => startEdit(emp.id, asistencia)} className="text-zinc-500 hover:text-blue-400" title="Editar"><Pencil size={16} /></button>
                                      {!tieneSalida ? (
                                        <button onClick={() => handleMarcarSalida(asistencia.id)} className="rounded-lg bg-orange-600/20 px-3 py-1.5 text-xs font-bold text-orange-500 hover:bg-orange-600 hover:text-white transition-all border border-orange-500/30">Marcar Salida</button>
                                      ) : (
                                        <span className="text-[10px] font-bold text-emerald-500/50 uppercase tracking-widest px-3">Completado</span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                        {asistieron.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-500 italic">No hay registros de asistencia para este día.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })()}
        </div>
      </div>
    </div>
  )
}
