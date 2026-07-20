'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Pencil, Check, X, ChevronLeft, Building2, Siren, Bed, Scissors, Stethoscope, ShieldPlus, Activity, Syringe, TestTube } from 'lucide-react'

export default function EstructuraClient({ initialServicios, initialDepartamentos }: any) {
  const supabase = createClient()
  const [servicios, setServicios] = useState(initialServicios)
  const [departamentos, setDepartamentos] = useState(initialDepartamentos)

  // Navegación
  const [selectedDivisionId, setSelectedDivisionId] = useState<string | null>(null)

  // Formularios
  const [nuevoServicio, setNuevoServicio] = useState('')
  const [nuevoDeptoNombre, setNuevoDeptoNombre] = useState('')

  // Estados de edición
  const [editServicioId, setEditServicioId] = useState<string | null>(null)
  const [editServicioNombre, setEditServicioNombre] = useState('')
  
  const [editDeptoId, setEditDeptoId] = useState<string | null>(null)
  const [editDeptoNombre, setEditDeptoNombre] = useState('')

  // ---------------------------------------------------------
  // Lógica de División (Servicio)
  // ---------------------------------------------------------
  const handleCrearServicio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoServicio) return
    const { data, error } = await supabase.from('servicios').insert([{ nombre: nuevoServicio }]).select()
    if (data && !error) {
      setServicios([...servicios, data[0]])
      setNuevoServicio('')
    } else alert(error?.message || 'Error al crear la división.')
  }

  const handleEliminarServicio = async (id: string) => {
    if(!confirm('¿Eliminar división? Se eliminarán también sus departamentos y empleados.')) return
    await supabase.from('servicios').delete().eq('id', id)
    setServicios(servicios.filter((s: any) => s.id !== id))
    setDepartamentos(departamentos.filter((d: any) => d.servicio_id !== id))
  }

  const handleEditServicio = async (id: string) => {
    if (!editServicioNombre) return
    const { data, error } = await supabase.from('servicios').update({ nombre: editServicioNombre }).eq('id', id).select()
    if (data && !error) {
      setServicios(servicios.map((s: any) => s.id === id ? data[0] : s))
      setDepartamentos(departamentos.map((d: any) => d.servicio_id === id ? { ...d, servicios: { nombre: data[0].nombre } } : d))
      setEditServicioId(null)
    } else alert('Error al editar.')
  }

  // ---------------------------------------------------------
  // Lógica de Departamento
  // ---------------------------------------------------------
  const handleCrearDepartamento = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoDeptoNombre || !selectedDivisionId) return
    const { data, error } = await supabase.from('departamentos').insert([{ nombre: nuevoDeptoNombre, servicio_id: selectedDivisionId }]).select('*, servicios(nombre)')
    if (data && !error) {
      setDepartamentos([...departamentos, data[0]])
      setNuevoDeptoNombre('')
    } else alert(error?.message || 'Error al crear departamento.')
  }

  const handleEliminarDepartamento = async (id: string) => {
    if(!confirm('¿Eliminar departamento? Se eliminarán también sus empleados.')) return
    await supabase.from('departamentos').delete().eq('id', id)
    setDepartamentos(departamentos.filter((d: any) => d.id !== id))
  }

  const handleEditDepto = async (id: string) => {
    if (!editDeptoNombre) return
    const { data, error } = await supabase.from('departamentos').update({ nombre: editDeptoNombre }).eq('id', id).select('*, servicios(nombre)')
    if (data && !error) {
      setDepartamentos(departamentos.map((d: any) => d.id === id ? data[0] : d))
      setEditDeptoId(null)
    } else alert('Error al editar.')
  }

  // Variables derivadas
  const divisionActual = servicios.find((s: any) => s.id === selectedDivisionId)
  const deptosMostrar = departamentos.filter((d: any) => d.servicio_id === selectedDivisionId)

  const getCargosCount = (empleadosList: any[]) => {
    if (!empleadosList) return {}
    return empleadosList.reduce((acc: any, emp: any) => {
      const cargo = emp.cargo_nominal?.trim() || 'No especificado'
      acc[cargo] = (acc[cargo] || 0) + 1
      return acc
    }, {})
  }

  const globalCargos = getCargosCount(departamentos.flatMap((d: any) => d.empleados || []))
  const totalEmpleadosGlobal = Object.values(globalCargos).reduce((a: any, b: any) => a + b, 0) as number

  // Helper para asignar icono dinámico al departamento
  const getDepartmentIcon = (nombre: string) => {
    const lower = nombre.toLowerCase()
    if (lower.includes('emergencia')) return <Siren size={20} />
    if (lower.includes('hospitalización')) return <Bed size={20} />
    if (lower.includes('quirófano') || lower.includes('cirugía')) return <Scissors size={20} />
    if (lower.includes('consulta') || lower.includes('clínica')) return <Stethoscope size={20} />
    if (lower.includes('inmunización') || lower.includes('vacuna')) return <ShieldPlus size={20} />
    if (lower.includes('fisioterapia') || lower.includes('rehabilitación')) return <Activity size={20} />
    if (lower.includes('laboratorio')) return <TestTube size={20} />
    return <Building2 size={20} />
  }

  // Helper para asignar color al cargo
  const getCargoColor = (cargo: string) => {
    const lower = cargo.toLowerCase()
    if (lower.includes('médico') || lower.includes('medico')) return 'bg-red-500'
    if (lower.includes('enfermero') || lower.includes('enfermera')) return 'bg-blue-500'
    if (lower.includes('administrativo')) return 'bg-amber-500'
    if (lower.includes('técnico') || lower.includes('tecnico')) return 'bg-emerald-500'
    if (lower.includes('obrero') || lower.includes('limpieza')) return 'bg-purple-500'
    return 'bg-gray-400'
  }

  return (
    <div className="flex flex-col gap-6">
      {!selectedDivisionId ? (
        // VISTA: DIVISIONES
        <div className="flex flex-col gap-6">
          
          {/* Panel Resumen Global */}
          <div className="flex flex-col gap-4 rounded-2xl border border-sys-border bg-sys-panel/50 p-6 shadow-xl">
            <div>
              <h2 className="text-lg font-semibold text-sys-text">Resumen Global del Personal</h2>
              <p className="text-sm text-sys-text-muted">Totalidad de empleados activos registrados en la estructura: <span className="font-bold">{totalEmpleadosGlobal}</span></p>
            </div>
            {Object.keys(globalCargos).length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(globalCargos).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([cargo, count]) => (
                  <span key={cargo} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 border border-blue-200 shadow-sm">
                    {cargo}: {count as number}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-sys-text-muted italic">No hay empleados registrados en la estructura aún.</p>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-sys-border bg-sys-panel/50 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-sys-text">Gestión de Divisiones</h2>
              <p className="text-sm text-sys-text-muted">Selecciona una división para ver sus departamentos.</p>
            </div>
            <form onSubmit={handleCrearServicio} className="flex w-full gap-2 md:max-w-md">
              <input type="text" placeholder="Nombre de la nueva división" className="flex-1 rounded-xl border border-sys-border bg-sys-panel-hover/50 px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={nuevoServicio} onChange={(e) => setNuevoServicio(e.target.value)} />
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-sys-primary px-4 py-2 text-sm font-medium text-white hover:bg-sys-primary">
                <Plus size={18} /> Crear
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {servicios.map((s: any) => (
              <div key={s.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-sys-border bg-sys-panel-hover shadow-sm p-5 shadow-lg transition-all hover:border-sys-primary/50 hover:bg-sys-panel-hover">
                {editServicioId === s.id ? (
                  <div className="flex flex-1 items-center gap-2 z-10">
                    <input type="text" value={editServicioNombre} onChange={(e) => setEditServicioNombre(e.target.value)} className="w-full rounded border border-sys-border bg-sys-panel-hover px-2 py-1 text-sm text-sys-text outline-none" autoFocus />
                    <button onClick={() => handleEditServicio(s.id)} className="text-sys-primary hover:text-sys-primary-hover"><Check size={18} /></button>
                    <button onClick={() => setEditServicioId(null)} className="text-sys-text-muted font-semibold hover:text-sys-text"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <div 
                      className="absolute inset-0 z-0 cursor-pointer" 
                      onClick={() => setSelectedDivisionId(s.id)}
                    ></div>
                    
                    <div className="z-10 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sys-primary/20 text-sys-primary">
                          <Building2 size={20} />
                        </div>
                        <h3 className="font-semibold text-sys-text">{s.nombre}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditServicioId(s.id); setEditServicioNombre(s.nombre); }} className="text-sys-text-muted font-semibold hover:text-sys-visor transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEliminarServicio(s.id); }} className="text-sys-text-muted font-semibold hover:text-sys-danger transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 z-10">
                      <p className="text-sm font-medium text-sys-primary">
                        {departamentos.filter((d: any) => d.servicio_id === s.id).length} Departamentos registrados
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
            {servicios.length === 0 && <p className="col-span-full py-8 text-center text-sm text-sys-text-muted font-semibold">No hay divisiones registradas.</p>}
          </div>
        </div>
      ) : (
        // VISTA: DEPARTAMENTOS
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedDivisionId(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-sys-border bg-sys-panel/50 text-sys-text-muted transition-colors hover:bg-sys-panel-hover hover:text-sys-text"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-sys-text">{divisionActual?.nombre}</h2>
              <p className="text-sm text-sys-text-muted">Departamentos pertenecientes a esta división.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-sys-border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-base font-semibold text-sys-text">Añadir Departamento</h3>
              <p className="text-sm text-sys-text-muted mt-1">Crea un nuevo departamento dentro de esta división.</p>
            </div>
            <form onSubmit={handleCrearDepartamento} className="flex w-full gap-2 md:max-w-md">
              <input type="text" placeholder="Nombre del nuevo departamento" className="flex-1 rounded-xl border border-sys-border bg-white px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none focus:ring-2 focus:ring-sys-primary/10 transition-shadow" value={nuevoDeptoNombre} onChange={(e) => setNuevoDeptoNombre(e.target.value)} />
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-sys-primary px-4 py-2 text-sm font-medium text-white hover:bg-sys-primary-hover transition-colors shadow-sm">
                <Plus size={18} /> Crear
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {deptosMostrar.map((d: any) => (
              <div key={d.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-sys-border bg-white shadow-sm p-6 hover:border-sys-primary/30 hover:shadow-md transition-all">
                {editDeptoId === d.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input type="text" value={editDeptoNombre} onChange={(e) => setEditDeptoNombre(e.target.value)} className="w-full rounded border border-sys-border bg-sys-panel-hover px-2 py-1 text-sm text-sys-text outline-none focus:border-sys-primary" autoFocus />
                    <button onClick={() => handleEditDepto(d.id)} className="text-sys-primary hover:text-sys-primary-hover"><Check size={18} /></button>
                    <button onClick={() => setEditDeptoId(null)} className="text-sys-text-muted font-semibold hover:text-sys-text"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sys-primary">
                          {getDepartmentIcon(d.nombre)}
                        </div>
                        <h3 className="font-semibold text-sys-text">{d.nombre}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditDeptoId(d.id); setEditDeptoNombre(d.nombre); }} className="text-sys-text-muted hover:text-sys-primary transition-colors p-1" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleEliminarDepartamento(d.id)} className="text-sys-text-muted hover:text-sys-danger transition-colors p-1" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex-1 flex flex-col">
                      <p className="text-[13px] font-bold text-sys-text mb-3">Personal Nominal:</p>
                      
                      {d.empleados && d.empleados.length > 0 ? (
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3 mb-6">
                          {Object.entries(getCargosCount(d.empleados)).map(([cargo, count]) => (
                            <div key={cargo} className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${getCargoColor(cargo)}`}></div>
                              <span className="text-xs font-medium text-sys-text-muted truncate" title={cargo}>
                                {cargo}: <span className="text-sys-text font-bold">{count as number}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-sys-text-muted italic mb-6">No hay personal registrado</p>
                      )}
                      
                      <div className="mt-auto bg-gray-50 rounded-xl p-3 flex items-center justify-between border border-sys-border/50">
                        <span className="text-sm font-bold text-sys-text">Total Departamento:</span>
                        <span className="text-sm font-bold text-sys-primary">{d.empleados ? d.empleados.length : 0}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {deptosMostrar.length === 0 && <p className="col-span-full py-8 text-center text-sm text-sys-text-muted font-semibold">No hay departamentos en esta división.</p>}
          </div>
        </div>
      )}
    </div>
  )
}



