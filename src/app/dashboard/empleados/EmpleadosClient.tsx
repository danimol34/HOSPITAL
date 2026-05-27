'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Search, UserCircle2, Eye, CalendarDays, Clock, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { differenceInYears, differenceInDays, parseISO, format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

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

export default function EmpleadosClient({ initialEmpleados, departamentos, servicios, initialVacaciones, isVisor }: any) {
  const supabase = createClient()
  const [empleados, setEmpleados] = useState(initialEmpleados)
  const [vacaciones, setVacaciones] = useState(initialVacaciones)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'perfil' | 'vacaciones' | 'asistencias'>('perfil')

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterServicioId, setFilterServicioId] = useState('')
  const [filterDeptoId, setFilterDeptoId] = useState('')

  // Modal Form State (Create Employee)
  const initialFormState = {
    nacionalidad: 'V', cedula: '', nombres: '', apellidos: '', sexo: 'M', lugar_nacimiento: '', fecha_nacimiento: '', departamento_id: '',
    correo_electronico: '', direccion_habitacion: '', telefono: '',
    cargo_nominal: '', fecha_ingreso_ministerio: '', vacaciones_disfrutadas: '',
    fecha_ingreso_admin_publica: '', codigo_nomina: '', ubicacion_administrativa: '',
    situacion_laboral: 'ACTIVO', tipo_personal: 'FIJO', profesion: '', especialidad: '', nivel_academico: ''
  }
  const [form, setForm] = useState(initialFormState)
  const [formServicioId, setFormServicioId] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Vacaciones Form State
  const [vacForm, setVacForm] = useState({ fecha_inicio: '', fecha_fin: '' })

  // Asistencias Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [employeeAsistencias, setEmployeeAsistencias] = useState<any[]>([])
  const [selectedAsistencia, setSelectedAsistencia] = useState<any | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [editAsisForm, setEditAsisForm] = useState({ hora_entrada: '', hora_salida: '' })
  const [isSavingAsis, setIsSavingAsis] = useState(false)

  const edadCalculada = form.fecha_nacimiento ? differenceInYears(new Date(), parseISO(form.fecha_nacimiento)) : '--'

  useEffect(() => {
    if (selectedEmployee && isDetailsOpen && activeTab === 'asistencias') {
      const fetchAsistencias = async () => {
        const start = startOfMonth(currentMonth).toISOString().split('T')[0]
        const end = endOfMonth(currentMonth).toISOString().split('T')[0]
        const { data } = await supabase
          .from('asistencias')
          .select('*')
          .eq('empleado_id', selectedEmployee.id)
          .gte('fecha', start)
          .lte('fecha', end)
        setEmployeeAsistencias(data || [])
      }
      fetchAsistencias()
      setSelectedAsistencia(null)
    }
  }, [selectedEmployee, currentMonth, isDetailsOpen, activeTab])

  const handleUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `employees/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    let avatar_url = isEditing && selectedEmployee ? selectedEmployee.avatar_url : null
    if (selectedFile) {
      const newUrl = await handleUpload(selectedFile)
      if (newUrl) avatar_url = newUrl
    }

    const payload: any = { ...form, avatar_url }
    if (!payload.fecha_nacimiento) payload.fecha_nacimiento = null
    if (!payload.fecha_ingreso_ministerio) payload.fecha_ingreso_ministerio = null
    if (!payload.fecha_ingreso_admin_publica) payload.fecha_ingreso_admin_publica = null

    if (isEditing && selectedEmployee) {
      const { data, error } = await supabase.from('empleados').update(payload).eq('id', selectedEmployee.id).select('*, departamentos(nombre, servicio_id)')
      if (data && !error) {
        setEmpleados(empleados.map((emp: any) => emp.id === selectedEmployee.id ? data[0] : emp))
        setSelectedEmployee(data[0]) // Update the selected employee details view
        setIsModalOpen(false)
        setForm(initialFormState)
        setFormServicioId('')
        setSelectedFile(null)
        setIsEditing(false)
      } else alert(error?.message || 'Error al actualizar empleado.')
    } else {
      const { data, error } = await supabase.from('empleados').insert([payload]).select('*, departamentos(nombre, servicio_id)')
      if (data && !error) {
        setEmpleados([data[0], ...empleados])
        setIsModalOpen(false)
        setForm(initialFormState)
        setFormServicioId('')
        setSelectedFile(null)
      } else alert(error?.message || 'Error al crear empleado.')
    }
    setIsUploading(false)
  }

  const handleUpdatePhoto = async (file: File) => {
    if (!selectedEmployee) return
    setIsUploading(true)
    const url = await handleUpload(file)
    if (url) {
      const { error } = await supabase.from('empleados').update({ avatar_url: url }).eq('id', selectedEmployee.id)
      if (!error) {
        setEmpleados(empleados.map((e: any) => e.id === selectedEmployee.id ? { ...e, avatar_url: url } : e))
        setSelectedEmployee({ ...selectedEmployee, avatar_url: url })
      } else alert('Error al actualizar foto.')
    }
    setIsUploading(false)
  }

  const handleDeletePhoto = async () => {
    if (!selectedEmployee) return
    if (!confirm('¿Seguro que deseas eliminar la foto de perfil de este empleado?')) return
    setIsUploading(true)
    const { error } = await supabase
      .from('empleados')
      .update({ avatar_url: null })
      .eq('id', selectedEmployee.id)

    if (!error) {
      setEmpleados(empleados.map((e: any) => e.id === selectedEmployee.id ? { ...e, avatar_url: null } : e))
      setSelectedEmployee({ ...selectedEmployee, avatar_url: null })
    } else {
      alert('Error al eliminar la foto de perfil.')
    }
    setIsUploading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este empleado?')) {
      await supabase.from('empleados').delete().eq('id', id)
      setEmpleados(empleados.filter((e: any) => e.id !== id))
    }
  }

  const handleAssignVacation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEmployee) return
    if (vacForm.fecha_inicio >= vacForm.fecha_fin) { alert('La fecha de fin debe ser mayor a la fecha de inicio.'); return }
    const { data, error } = await supabase.from('vacaciones').insert([{ empleado_id: selectedEmployee.id, ...vacForm }]).select('*')
    if (data && !error) { setVacaciones([data[0], ...vacaciones]); setVacForm({ fecha_inicio: '', fecha_fin: '' }) } 
    else alert('Error al asignar vacaciones.')
  }

  const handleDeleteVacation = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar estas vacaciones?')) {
      await supabase.from('vacaciones').delete().eq('id', id)
      setVacaciones(vacaciones.filter((v: any) => v.id !== id))
    }
  }

  const handleManualSaveAttendance = async () => {
    if (!selectedEmployee || !selectedAsistencia) return
    setIsSavingAsis(true)
    
    const payload = {
      empleado_id: selectedEmployee.id,
      fecha: selectedAsistencia.fecha,
      hora_entrada: editAsisForm.hora_entrada || null,
      hora_salida: editAsisForm.hora_salida || null
    }

    // Check if record already exists for that day
    const { data: existing } = await supabase
      .from('asistencias')
      .select('id')
      .eq('empleado_id', selectedEmployee.id)
      .eq('fecha', selectedAsistencia.fecha)
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
        .insert([payload])
        .select()
    }

    if (res.data && !res.error) {
      // Update local state for asistencias in calendar
      const updatedAsis = res.data[0]
      const existingInLocal = employeeAsistencias.find(a => a.id === updatedAsis.id)
      if (existingInLocal) {
        setEmployeeAsistencias(employeeAsistencias.map(a => a.id === updatedAsis.id ? updatedAsis : a))
      } else {
        setEmployeeAsistencias([...employeeAsistencias, updatedAsis])
      }
      setSelectedAsistencia(updatedAsis)
    } else {
      alert('Error al guardar asistencia.')
    }
    setIsSavingAsis(false)
  }

  // Filter Logic
  const filterDeptosDisponibles = filterServicioId ? departamentos.filter((d: any) => d.servicio_id === filterServicioId) : departamentos
  const filteredEmpleados = empleados.filter((e: any) => {
    const matchSearch = e.nombres.toLowerCase().includes(searchTerm.toLowerCase()) || e.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) || e.cedula.includes(searchTerm)
    const matchServicio = filterServicioId ? e.departamentos?.servicio_id === filterServicioId : true
    const matchDepto = filterDeptoId ? e.departamento_id === filterDeptoId : true
    return matchSearch && matchServicio && matchDepto
  })

  const employeeVacations = selectedEmployee ? vacaciones.filter((v: any) => v.empleado_id === selectedEmployee.id) : []
  
  // Calendar variables
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startDayOfWeek = getDay(startOfMonth(currentMonth)) // 0: Sun, 1: Mon...

  return (
    <div className="flex flex-col gap-6">
      {/* Filters & Add Button */}
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-zinc-900/50 p-5 shadow-xl md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input type="text" placeholder="Buscar por cédula o nombre..." className="w-full rounded-xl border border-white/10 bg-zinc-800/50 py-2 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select className="w-full max-w-xs rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={filterServicioId} onChange={(e) => { setFilterServicioId(e.target.value); setFilterDeptoId(''); }}>
            <option value="">Todas las Divisiones</option>
            {servicios.map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
          <select className="w-full max-w-xs rounded-xl border border-white/10 bg-zinc-800/50 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none disabled:opacity-50" value={filterDeptoId} onChange={(e) => setFilterDeptoId(e.target.value)} disabled={!filterServicioId}>
            <option value="">Todos los Departamentos</option>
            {filterDeptosDisponibles.map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
          </select>
        </div>
          <div className="flex gap-3">
            {!isVisor && (
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setForm(initialFormState)
                  setFormServicioId('')
                  setIsModalOpen(true)
                }} 
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
              >
                <Plus size={18} /> Registrar Empleado
              </button>
            )}
          </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/50 shadow-xl">
        <table className="min-w-[1000px] w-full text-left text-sm text-zinc-400 whitespace-nowrap">
            <thead className="border-b border-white/10 bg-black/20 text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-6 py-4 font-medium">Empleado</th>
                <th className="px-6 py-4 font-medium">Cédula</th>
                <th className="px-6 py-4 font-medium">Edad</th>
                <th className="px-6 py-4 font-medium">Departamento</th>
                <th className="px-6 py-4 font-medium">Vacaciones</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmpleados.map((emp: any) => {
                const today = new Date().toISOString().split('T')[0]
                const empVacations = vacaciones.filter((v: any) => v.empleado_id === emp.id)
                let vacStatus: { type: string, days: number } | null = null;
                if (empVacations.length > 0) {
                  const active = empVacations.find((v: any) => today >= v.fecha_inicio && today <= v.fecha_fin)
                  if (active) vacStatus = { type: 'En Curso', days: Math.max(0, differenceInDays(parseISO(active.fecha_fin), new Date())) }
                  else {
                    const future = empVacations.filter((v: any) => today < v.fecha_inicio).sort((a: any, b: any) => a.fecha_inicio.localeCompare(b.fecha_inicio))[0]
                    if (future) vacStatus = { type: 'Programada', days: Math.max(0, differenceInDays(parseISO(future.fecha_inicio), new Date())) }
                  }
                }
                return (
                <tr 
                  key={emp.id} 
                  onClick={() => { setSelectedEmployee(emp); setIsDetailsOpen(true); }}
                  className="border-b border-white/5 transition-colors hover:bg-white/10 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 overflow-hidden">
                        {emp.avatar_url ? <img src={emp.avatar_url} alt="Avatar" className="h-full w-full object-cover" /> : <UserCircle2 size={16} />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{emp.nombres} {emp.apellidos}</div>
                        <div className="text-xs text-zinc-500">{emp.sexo === 'M' ? 'Masculino' : 'Femenino'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{emp.nacionalidad}-{emp.cedula}</td>
                  <td className="px-6 py-4">{differenceInYears(new Date(), parseISO(emp.fecha_nacimiento))} años</td>
                  <td className="px-6 py-4">{emp.departamentos?.nombre || 'N/A'}</td>
                  <td className="px-6 py-4">
                    {vacStatus ? (
                      <div className="flex flex-col">
                        <span className={`text-xs font-medium ${vacStatus.type === 'En Curso' ? 'text-orange-500' : 'text-blue-400'}`}>{vacStatus.type}</span>
                        <span className="text-xs text-zinc-500">{vacStatus.type === 'En Curso' ? `Quedan ${vacStatus.days} días` : `Faltan ${vacStatus.days} días`}</span>
                      </div>
                    ) : <span className="text-xs text-zinc-600">Ninguna</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      {!isVisor && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(emp.id); }} 
                          className="text-zinc-500 hover:text-red-500 transition-colors" 
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
              {filteredEmpleados.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-zinc-500">No se encontraron empleados.</td></tr>}
            </tbody>
          </table>
      </div>

      {/* Modal Detalles del Empleado (Asistencias y Vacaciones) */}
      {isDetailsOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Detalles del Empleado</h2>
              <div className="flex items-center gap-4">
                {!isVisor && (
                  <button 
                    onClick={() => {
                      setIsEditing(true)
                      setForm({
                        nacionalidad: selectedEmployee.nacionalidad || 'V',
                        cedula: selectedEmployee.cedula || '',
                        nombres: selectedEmployee.nombres || '',
                        apellidos: selectedEmployee.apellidos || '',
                        sexo: selectedEmployee.sexo || 'M',
                        lugar_nacimiento: selectedEmployee.lugar_nacimiento || '',
                        fecha_nacimiento: selectedEmployee.fecha_nacimiento || '',
                        departamento_id: selectedEmployee.departamento_id || '',
                        correo_electronico: selectedEmployee.correo_electronico || '',
                        direccion_habitacion: selectedEmployee.direccion_habitacion || '',
                        telefono: selectedEmployee.telefono || '',
                        cargo_nominal: selectedEmployee.cargo_nominal || '',
                        fecha_ingreso_ministerio: selectedEmployee.fecha_ingreso_ministerio || '',
                        vacaciones_disfrutadas: selectedEmployee.vacaciones_disfrutadas || '',
                        fecha_ingreso_admin_publica: selectedEmployee.fecha_ingreso_admin_publica || '',
                        codigo_nomina: selectedEmployee.codigo_nomina || '',
                        ubicacion_administrativa: selectedEmployee.ubicacion_administrativa || '',
                        situacion_laboral: selectedEmployee.situacion_laboral || 'ACTIVO',
                        tipo_personal: selectedEmployee.tipo_personal || 'FIJO',
                        profesion: selectedEmployee.profesion || '',
                        especialidad: selectedEmployee.especialidad || '',
                        nivel_academico: selectedEmployee.nivel_academico || ''
                      })
                      setFormServicioId(selectedEmployee.departamentos?.servicio_id || '')
                      setIsModalOpen(true)
                    }}
                    className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                )}
                <button onClick={() => { setIsDetailsOpen(false); setSelectedEmployee(null); }} className="text-zinc-500 hover:text-white">✕</button>
              </div>
            </div>
            
            <div className="flex flex-1 flex-col overflow-y-auto p-6 md:flex-row md:gap-8">
              {/* Información Personal */}
              <div className="flex flex-col gap-6 md:w-1/3 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 overflow-hidden ring-2 ring-white/10">
                      {selectedEmployee.avatar_url ? <img src={selectedEmployee.avatar_url} alt="Avatar" className="h-full w-full object-cover" /> : <UserCircle2 size={32} />}
                    </div>
                    {!isVisor && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                        <Pencil size={14} className="text-white" />
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleUpdatePhoto(e.target.files[0])} />
                      </label>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedEmployee.nombres} {selectedEmployee.apellidos}</h3>
                    <p className="text-sm text-zinc-400">{selectedEmployee.departamentos?.nombre || 'Sin Departamento'}</p>
                    {selectedEmployee.avatar_url && !isVisor && (
                      <button 
                        onClick={handleDeletePhoto}
                        disabled={isUploading}
                        className="mt-1 text-[11px] font-bold text-red-500 hover:text-red-400 disabled:opacity-50 transition-colors uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} /> Eliminar Foto
                      </button>
                    )}
                  </div>
                </div>
                

              </div>

              {/* Tabs Section */}
              <div className="mt-8 flex flex-1 flex-col border-t border-white/10 pt-8 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex gap-4 border-b border-white/10 mb-6">
                  <button 
                    onClick={() => setActiveTab('perfil')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'perfil' ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2"><UserCircle2 size={16}/> Perfil</div>
                    {activeTab === 'perfil' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('asistencias')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'asistencias' ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2"><Clock size={16}/> Asistencias</div>
                    {activeTab === 'asistencias' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('vacaciones')}
                    className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'vacaciones' ? 'text-emerald-400' : 'text-zinc-500 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-2"><CalendarDays size={16}/> Vacaciones</div>
                    {activeTab === 'vacaciones' && <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full"></div>}
                  </button>
                </div>

                {/* PERFIL TAB */}
                {activeTab === 'perfil' && (
                  <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Datos Personales</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Cédula</span><span className="font-medium text-white">{selectedEmployee.nacionalidad}-{selectedEmployee.cedula}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Sexo</span><span className="font-medium text-white">{selectedEmployee.sexo === 'M' ? 'Masculino' : 'Femenino'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Fecha de Nacimiento</span><span className="font-medium text-white">{formatDate(selectedEmployee.fecha_nacimiento)} ({differenceInYears(new Date(), parseISO(selectedEmployee.fecha_nacimiento))} años)</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Teléfono</span><span className="font-medium text-white">{selectedEmployee.telefono || '--'}</span></div>
                        <div className="flex flex-col col-span-2"><span className="text-xs text-zinc-500">Correo Electrónico</span><span className="font-medium text-white">{selectedEmployee.correo_electronico || '--'}</span></div>
                        <div className="flex flex-col col-span-2"><span className="text-xs text-zinc-500">Dirección</span><span className="font-medium text-white leading-relaxed">{selectedEmployee.direccion_habitacion || '--'}</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Datos Laborales</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Cargo Nominal</span><span className="font-medium text-white">{selectedEmployee.cargo_nominal || '--'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Situación Laboral</span><span className="font-medium text-white">{selectedEmployee.situacion_laboral || '--'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Tipo de Personal</span><span className="font-medium text-white">{selectedEmployee.tipo_personal || '--'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Ubicación Administrativa</span><span className="font-medium text-white">{selectedEmployee.ubicacion_administrativa || '--'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Código de Nómina</span><span className="font-medium text-white">{selectedEmployee.codigo_nomina || '--'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Vacaciones Disfrutadas</span><span className="font-medium text-white">{selectedEmployee.vacaciones_disfrutadas || '--'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Ingreso Ministerio</span><span className="font-medium text-white">{formatDate(selectedEmployee.fecha_ingreso_ministerio)}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Ingreso Admin. Pública</span><span className="font-medium text-white">{formatDate(selectedEmployee.fecha_ingreso_admin_publica)}</span></div>
                        <div className="flex flex-col col-span-2"><span className="text-xs text-zinc-500">Años de Servicio</span><span className="font-medium text-emerald-400">{selectedEmployee.fecha_ingreso_admin_publica ? differenceInYears(new Date(), parseISO(selectedEmployee.fecha_ingreso_admin_publica)) : '--'} años</span></div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Información Académica</h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Nivel Académico</span><span className="font-medium text-white">{selectedEmployee.nivel_academico || '--'}</span></div>
                        <div className="flex flex-col"><span className="text-xs text-zinc-500">Profesión</span><span className="font-medium text-white">{selectedEmployee.profesion || '--'}</span></div>
                        <div className="flex flex-col col-span-2"><span className="text-xs text-zinc-500">Especialidad</span><span className="font-medium text-white">{selectedEmployee.especialidad || '--'}</span></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ASISTENCIAS TAB */}
                {activeTab === 'asistencias' && (
                  <div className="flex flex-col gap-6">
                    {/* Header del Calendario */}
                    <div className="flex items-center justify-between rounded-xl bg-zinc-900 px-4 py-3">
                      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="text-zinc-400 hover:text-white"><ChevronLeft size={20}/></button>
                      <h3 className="font-medium text-white capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h3>
                      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="text-zinc-400 hover:text-white"><ChevronRight size={20}/></button>
                    </div>

                    {/* Grid del Calendario */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-zinc-500 mb-2">
                          <div>Do</div><div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div>
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: startDayOfWeek }).map((_, i) => <div key={`empty-${i}`} className="h-10"></div>)}
                          {daysInMonth.map(date => {
                            const dateStr = format(date, 'yyyy-MM-dd')
                            const asis = employeeAsistencias.find(a => a.fecha === dateStr)
                            const isAsistencia = asis && !asis.falta && asis.hora_entrada
                            
                            // Verificar si está de vacaciones en esta fecha
                            const isVacacion = employeeVacations.some((v: any) => 
                              dateStr >= v.fecha_inicio && dateStr <= v.fecha_fin
                            )
                            
                            const todayStr = format(new Date(), 'yyyy-MM-dd')
                            const empCreatedStr = selectedEmployee.created_at ? selectedEmployee.created_at.split('T')[0] : '2000-01-01'
                            
                            // Es una falta si es pasado o hoy, después de su fecha de creación, y no asistió NI está de vacaciones
                            const isPastOrToday = dateStr <= todayStr
                            const isAfterCreation = dateStr >= empCreatedStr
                            const isFalta = !isVacacion && ((asis && asis.falta) || (isPastOrToday && isAfterCreation && !isAsistencia))
                            
                            let style = 'text-zinc-400 hover:bg-white/5'
                            if (isVacacion) style = 'bg-orange-500/20 text-orange-500 border border-orange-500/50 font-bold'
                            else if (isAsistencia) style = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                            else if (isFalta) style = 'bg-red-500/10 text-red-400 border border-red-500/30'

                            return (
                              <button 
                                key={dateStr}
                                onClick={() => {
                                  setSelectedAsistencia(asis || { fecha: dateStr, missing: !isAsistencia && !isVacacion, falta: isFalta, vacacion: isVacacion });
                                  setEditAsisForm({ 
                                    hora_entrada: asis?.hora_entrada?.slice(0,5) || '07:00', 
                                    hora_salida: asis?.hora_salida?.slice(0,5) || '15:00' 
                                  });
                                }}
                                className={`h-10 w-full rounded-lg text-sm transition-all flex items-center justify-center ${style} ${selectedAsistencia?.fecha === dateStr ? 'ring-2 ring-white' : ''}`}
                              >
                                {format(date, 'd')}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Detalles del día seleccionado */}
                      <div className="md:w-64 shrink-0 rounded-xl border border-white/5 bg-black/20 p-4">
                        <h4 className="text-sm font-medium text-zinc-300 mb-4 pb-2 border-b border-white/5">Detalle del Día</h4>
                        {selectedAsistencia ? (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase text-zinc-500">Fecha</span>
                              <span className="text-sm text-white">{formatDate(selectedAsistencia.fecha)}</span>
                            </div>
                            
                            {(() => {
                              const dateStr = selectedAsistencia.fecha;
                              const todayStr = new Date().toISOString().split('T')[0];
                              const isFuture = dateStr > todayStr;
                              const isVacacion = employeeVacations.some((v: any) => dateStr >= v.fecha_inicio && dateStr <= v.fecha_fin);
                              const hasAttendance = !!selectedAsistencia.hora_entrada;

                              return (
                                <>
                                  {/* Etiquetas de Estado */}
                                  {isFuture && !hasAttendance && (
                                    <div className="rounded-lg bg-zinc-800 p-3 border border-white/5 mb-2">
                                      <p className="text-xs text-zinc-400 text-center font-medium">Día no transcurrido</p>
                                    </div>
                                  )}

                                  {isVacacion && (
                                    <div className="rounded-lg bg-orange-500/10 p-3 border border-orange-500/20 mb-2">
                                      <p className="text-xs text-orange-400 text-center font-bold">En Vacaciones</p>
                                    </div>
                                  )}

                                  {!hasAttendance && !isVacacion && !isFuture && (
                                    <div className="rounded-lg bg-red-500/10 p-3 border border-red-500/20 mb-2">
                                      <p className="text-xs text-red-400 text-center font-bold">No asistió este día</p>
                                    </div>
                                  )}

                                  {/* Contenido: Horario Registrado o Formulario para marcar */}
                                  {hasAttendance ? (
                                    <div className="flex flex-col gap-4">
                                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                        <span className="text-xs text-zinc-400">Entrada</span>
                                        <span className="text-sm font-bold text-emerald-400">{format12h(selectedAsistencia.hora_entrada)}</span>
                                      </div>
                                      <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5">
                                        <span className="text-xs text-zinc-400">Salida</span>
                                        <span className="text-sm font-bold text-blue-400">{selectedAsistencia.hora_salida ? format12h(selectedAsistencia.hora_salida) : '--:--'}</span>
                                      </div>
                                      <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
                                        <p className="text-[10px] text-emerald-400 text-center font-medium">Asistencia Registrada</p>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Si no asistió o está de vacaciones, permitimos marcar horario (solo para admins) */
                                    !isVisor && (
                                      <div className="flex flex-col gap-4 mt-2">
                                        <div className="flex flex-col gap-2">
                                          <label className="text-[10px] uppercase text-zinc-500">Marcar Hora Entrada</label>
                                          <input 
                                            type="time" 
                                            className="rounded border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                            value={editAsisForm.hora_entrada}
                                            onChange={(e) => setEditAsisForm({...editAsisForm, hora_entrada: e.target.value})}
                                          />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                          <label className="text-[10px] uppercase text-zinc-500">Marcar Hora Salida</label>
                                          <input 
                                            type="time" 
                                            className="rounded border border-white/10 bg-zinc-800 px-3 py-1.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                                            value={editAsisForm.hora_salida}
                                            onChange={(e) => setEditAsisForm({...editAsisForm, hora_salida: e.target.value})}
                                          />
                                        </div>
                                        <button 
                                          onClick={handleManualSaveAttendance}
                                          disabled={isSavingAsis}
                                          className="w-full rounded-lg bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition-all active:scale-95 disabled:opacity-50"
                                        >
                                          {isSavingAsis ? 'Guardando...' : 'Asignar Horario Manualmente'}
                                        </button>
                                      </div>
                                    )
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <p className="text-xs text-zinc-500 text-center py-4">Haz clic en un día del calendario para ver o registrar la asistencia.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* VACACIONES TAB */}
                {activeTab === 'vacaciones' && (
                  <div className="flex flex-col gap-4">
                    {!isVisor && (
                      <form onSubmit={handleAssignVacation} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-zinc-900/50 p-4 xl:flex-row xl:items-end">
                        <div className="flex flex-1 flex-col gap-1">
                          <label className="text-xs font-medium text-zinc-400">Inicio</label>
                          <input required type="date" className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={vacForm.fecha_inicio} onChange={(e) => setVacForm({...vacForm, fecha_inicio: e.target.value})} />
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <label className="text-xs font-medium text-zinc-400">Fin</label>
                          <input required type="date" className="rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={vacForm.fecha_fin} onChange={(e) => setVacForm({...vacForm, fecha_fin: e.target.value})} />
                        </div>
                        <button type="submit" className="mt-2 flex h-[38px] items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white hover:bg-emerald-500 xl:mt-0">Añadir</button>
                      </form>
                    )}
                    <div className="flex flex-col gap-2">
                      {employeeVacations.map((v: any) => {
                        const isActiva = new Date().toISOString().split('T')[0] >= v.fecha_inicio && new Date().toISOString().split('T')[0] <= v.fecha_fin
                        const isFutura = new Date().toISOString().split('T')[0] < v.fecha_inicio
                        return (
                          <div key={v.id} className="flex items-center justify-between rounded-xl bg-black/20 p-4">
                            <div>
                              <div className="flex gap-4 text-sm font-medium text-zinc-200">
                                <span>Desde: <span className="text-white">{formatDate(v.fecha_inicio)}</span></span>
                                <span>Hasta: <span className="text-white">{formatDate(v.fecha_fin)}</span></span>
                              </div>
                              <div className="mt-1 text-xs text-zinc-500">Duración: {differenceInDays(parseISO(v.fecha_fin), parseISO(v.fecha_inicio))} días</div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isActiva && <span className="rounded bg-orange-500/10 px-2 py-1 text-xs font-medium text-orange-500">En Curso</span>}
                              {isFutura && <span className="rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">Programada</span>}
                              {!isActiva && !isFutura && <span className="rounded bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400">Finalizada</span>}
                              {!isVisor && (
                                <button onClick={() => handleDeleteVacation(v.id)} className="text-zinc-500 hover:text-red-500"><Trash2 size={16} /></button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                      {employeeVacations.length === 0 && <p className="text-sm text-zinc-500 text-center py-4">Este empleado no tiene vacaciones registradas.</p>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Empleado */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h2>
              <button onClick={() => { setIsModalOpen(false); setIsEditing(false); setForm(initialFormState); }} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">Datos Personales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-400">Cédula</label>
                    <div className="flex">
                      <select className="rounded-l-xl border-r-0 border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:outline-none" value={form.nacionalidad} onChange={(e) => setForm({...form, nacionalidad: e.target.value})}>
                        <option value="V">V</option><option value="E">E</option>
                      </select>
                      <input required type="number" className="w-full rounded-r-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Nombres</label><input required type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.nombres} onChange={(e) => setForm({...form, nombres: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Apellidos</label><input required type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.apellidos} onChange={(e) => setForm({...form, apellidos: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Sexo</label><select className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.sexo} onChange={(e) => setForm({...form, sexo: e.target.value})}><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Lugar de Nacimiento</label><input required type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.lugar_nacimiento} onChange={(e) => setForm({...form, lugar_nacimiento: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Fecha de Nacimiento</label><div className="flex gap-4 items-center"><input required type="date" className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.fecha_nacimiento} onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})} /><span className="rounded bg-emerald-500/20 px-3 py-2 text-sm font-bold text-emerald-400">{edadCalculada}</span></div></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Teléfono</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Correo Electrónico</label><input type="email" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.correo_electronico} onChange={(e) => setForm({...form, correo_electronico: e.target.value})} /></div>
                  <div className="flex flex-col gap-1 col-span-2"><label className="text-xs font-medium text-zinc-400">Dirección de Habitación</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.direccion_habitacion} onChange={(e) => setForm({...form, direccion_habitacion: e.target.value})} /></div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-xs font-medium text-zinc-400">Foto de Perfil (Opcional)</label>
                    <input type="file" name="avatar" accept="image/*" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20" onChange={(e) => { if (e.target.files && e.target.files.length > 0) { setSelectedFile(e.target.files[0]) } else { setSelectedFile(null) } }} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">Datos Laborales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">División (Opcional para filtrar)</label><select className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={formServicioId} onChange={(e) => { setFormServicioId(e.target.value); setForm({...form, departamento_id: ''}) }}><option value="">Seleccionar...</option>{servicios.map((s: any) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Departamento</label><select required className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.departamento_id} onChange={(e) => setForm({...form, departamento_id: e.target.value})}><option value="">Seleccionar...</option>{(formServicioId ? departamentos.filter((d: any) => d.servicio_id === formServicioId) : departamentos).map((d: any) => <option key={d.id} value={d.id}>{d.nombre}</option>)}</select></div>
                  
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Cargo Nominal</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.cargo_nominal} onChange={(e) => setForm({...form, cargo_nominal: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Código de Nómina</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.codigo_nomina} onChange={(e) => setForm({...form, codigo_nomina: e.target.value})} /></div>
                  
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Situación Laboral</label><input type="text" placeholder="Ej: Activo, Reposo, etc." className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.situacion_laboral} onChange={(e) => setForm({...form, situacion_laboral: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Tipo de Personal</label><input type="text" placeholder="Ej: Fijo, Contratado, etc." className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.tipo_personal} onChange={(e) => setForm({...form, tipo_personal: e.target.value})} /></div>
                  
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Ubicación Administrativa</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.ubicacion_administrativa} onChange={(e) => setForm({...form, ubicacion_administrativa: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Vacaciones Disfrutadas</label><input type="text" placeholder="Ej: 2012-2013" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.vacaciones_disfrutadas} onChange={(e) => setForm({...form, vacaciones_disfrutadas: e.target.value})} /></div>
                  
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Ingreso Ministerio</label><input type="date" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.fecha_ingreso_ministerio} onChange={(e) => setForm({...form, fecha_ingreso_ministerio: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Ingreso Admin. Pública</label><input type="date" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.fecha_ingreso_admin_publica} onChange={(e) => setForm({...form, fecha_ingreso_admin_publica: e.target.value})} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">Información Académica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Nivel Académico</label><input type="text" placeholder="Ej: TSU, Licenciado, Bachiller" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.nivel_academico} onChange={(e) => setForm({...form, nivel_academico: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Profesión</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.profesion} onChange={(e) => setForm({...form, profesion: e.target.value})} /></div>
                  <div className="flex flex-col gap-1 col-span-2"><label className="text-xs font-medium text-zinc-400">Especialidad</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.especialidad} onChange={(e) => setForm({...form, especialidad: e.target.value})} /></div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setIsEditing(false); setForm(initialFormState); }} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white">Cancelar</button>
                <button type="submit" disabled={isUploading} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
                  {isUploading ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Registrar Empleado')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
