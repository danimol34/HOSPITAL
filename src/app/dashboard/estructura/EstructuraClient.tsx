'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Pencil, Check, X, Circle, ChevronLeft, Building2 } from 'lucide-react'

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

  return (
    <div className="flex flex-col gap-6">
      {!selectedDivisionId ? (
        // VISTA: DIVISIONES
        <div className="flex flex-col gap-6">
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

          <div className="flex flex-col gap-4 rounded-2xl border border-sys-border bg-sys-panel/50 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
            <h3 className="text-base font-semibold text-sys-text">Añadir Departamento</h3>
            <form onSubmit={handleCrearDepartamento} className="flex w-full gap-2 md:max-w-md">
              <input type="text" placeholder="Nombre del nuevo departamento" className="flex-1 rounded-xl border border-sys-border bg-sys-panel-hover/50 px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={nuevoDeptoNombre} onChange={(e) => setNuevoDeptoNombre(e.target.value)} />
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-sys-visor px-4 py-2 text-sm font-medium text-white hover:bg-sys-visor">
                <Plus size={18} /> Crear
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {deptosMostrar.map((d: any) => (
              <div key={d.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-sys-border bg-sys-panel-hover shadow-sm p-5 shadow-lg transition-all hover:border-sys-visor/50 hover:bg-sys-panel-hover">
                {editDeptoId === d.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input type="text" value={editDeptoNombre} onChange={(e) => setEditDeptoNombre(e.target.value)} className="w-full rounded border border-sys-border bg-sys-panel-hover px-2 py-1 text-sm text-sys-text outline-none" autoFocus />
                    <button onClick={() => handleEditDepto(d.id)} className="text-sys-primary hover:text-sys-primary-hover"><Check size={18} /></button>
                    <button onClick={() => setEditDeptoId(null)} className="text-sys-text-muted font-semibold hover:text-sys-text"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sys-visor/20 text-sys-visor">
                          <Circle size={14} fill="currentColor" />
                        </div>
                        <h3 className="font-semibold text-sys-text">{d.nombre}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditDeptoId(d.id); setEditDeptoNombre(d.nombre); }} className="text-sys-text-muted font-semibold hover:text-sys-visor transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleEliminarDepartamento(d.id)} className="text-sys-text-muted font-semibold hover:text-sys-danger transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm font-medium text-sys-visor">
                        {d.empleados ? d.empleados.length : 0} Empleado{d.empleados?.length !== 1 ? 's' : ''} registrado{d.empleados?.length !== 1 ? 's' : ''}
                      </p>
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



