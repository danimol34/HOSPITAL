'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Pencil, Check, X, Folder, ChevronLeft, Building2 } from 'lucide-react'

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
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Gestión de Divisiones</h2>
              <p className="text-sm text-zinc-400">Selecciona una división para ver sus departamentos.</p>
            </div>
            <form onSubmit={handleCrearServicio} className="flex w-full gap-2 md:max-w-md">
              <input type="text" placeholder="Nombre de la nueva división" className="flex-1 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={nuevoServicio} onChange={(e) => setNuevoServicio(e.target.value)} />
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
                <Plus size={18} /> Crear
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {servicios.map((s: any) => (
              <div key={s.id} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5 shadow-lg transition-all hover:border-emerald-500/50 hover:bg-white/5">
                {editServicioId === s.id ? (
                  <div className="flex flex-1 items-center gap-2 z-10">
                    <input type="text" value={editServicioNombre} onChange={(e) => setEditServicioNombre(e.target.value)} className="w-full rounded border border-white/20 bg-zinc-800 px-2 py-1 text-sm text-white outline-none" autoFocus />
                    <button onClick={() => handleEditServicio(s.id)} className="text-emerald-500 hover:text-emerald-400"><Check size={18} /></button>
                    <button onClick={() => setEditServicioId(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                  </div>
                ) : (
                  <>
                    <div 
                      className="absolute inset-0 z-0 cursor-pointer" 
                      onClick={() => setSelectedDivisionId(s.id)}
                    ></div>
                    
                    <div className="z-10 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500">
                          <Building2 size={20} />
                        </div>
                        <h3 className="font-semibold text-white">{s.nombre}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setEditServicioId(s.id); setEditServicioNombre(s.nombre); }} className="text-zinc-500 hover:text-blue-400 transition-colors" title="Editar">
                          <Pencil size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleEliminarServicio(s.id); }} className="text-zinc-500 hover:text-red-500 transition-colors" title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 z-10">
                      <p className="text-xs text-zinc-500">
                        {departamentos.filter((d: any) => d.servicio_id === s.id).length} Departamentos registrados
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
            {servicios.length === 0 && <p className="col-span-full py-8 text-center text-sm text-zinc-500">No hay divisiones registradas.</p>}
          </div>
        </div>
      ) : (
        // VISTA: DEPARTAMENTOS
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedDivisionId(null)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-zinc-900/50 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-bold text-white">{divisionActual?.nombre}</h2>
              <p className="text-sm text-zinc-400">Departamentos pertenecientes a esta división.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-6 shadow-xl md:flex-row md:items-center md:justify-between">
            <h3 className="text-base font-semibold text-white">Añadir Departamento</h3>
            <form onSubmit={handleCrearDepartamento} className="flex w-full gap-2 md:max-w-md">
              <input type="text" placeholder="Nombre del nuevo departamento" className="flex-1 rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={nuevoDeptoNombre} onChange={(e) => setNuevoDeptoNombre(e.target.value)} />
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                <Plus size={18} /> Crear
              </button>
            </form>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {deptosMostrar.map((d: any) => (
              <div key={d.id} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-5 shadow-lg transition-all hover:border-blue-500/50 hover:bg-white/5">
                {editDeptoId === d.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input type="text" value={editDeptoNombre} onChange={(e) => setEditDeptoNombre(e.target.value)} className="w-full rounded border border-white/20 bg-zinc-800 px-2 py-1 text-sm text-white outline-none" autoFocus />
                    <button onClick={() => handleEditDepto(d.id)} className="text-emerald-500 hover:text-emerald-400"><Check size={18} /></button>
                    <button onClick={() => setEditDeptoId(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-500">
                        <Folder size={20} />
                      </div>
                      <h3 className="font-semibold text-white">{d.nombre}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditDeptoId(d.id); setEditDeptoNombre(d.nombre); }} className="text-zinc-500 hover:text-blue-400 transition-colors" title="Editar">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleEliminarDepartamento(d.id)} className="text-zinc-500 hover:text-red-500 transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {deptosMostrar.length === 0 && <p className="col-span-full py-8 text-center text-sm text-zinc-500">No hay departamentos en esta división.</p>}
          </div>
        </div>
      )}
    </div>
  )
}
