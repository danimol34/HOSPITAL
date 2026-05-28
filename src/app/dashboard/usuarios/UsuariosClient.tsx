'use client'

import { useState } from 'react'
import { Plus, Trash2, UserCircle, Shield, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { createUser, removeUser } from './actions'

function formatDate(dateString: string) {
  if (!dateString) return '--/--/----'
  return dateString.split('-').reverse().join('/')
}

export default function UsuariosClient({ initialUsuarios }: { initialUsuarios: any[] }) {
  const supabase = createClient()
  const [usuarios, setUsuarios] = useState(initialUsuarios)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedUsuario, setSelectedUsuario] = useState<any>(null)
  const initialFormState = { 
    email: '', password: '', rol: 'visor',
    nacionalidad: 'V', cedula: '', nombres: '', apellidos: '', sexo: 'M', lugar_nacimiento: '', fecha_nacimiento: '',
    telefono: '', direccion_habitacion: '',
    cargo_nominal: '', fecha_ingreso_ministerio: '', vacaciones_disfrutadas: '',
    fecha_ingreso_admin_publica: '', codigo_nomina: '', ubicacion_administrativa: '',
    situacion_laboral: 'ACTIVO', tipo_personal: 'FIJO', profesion: '', especialidad: '', nivel_academico: ''
  }
  const [form, setForm] = useState(initialFormState)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('email', form.email)
    formData.append('password', form.password)
    formData.append('rol', form.rol)
    formData.append('nacionalidad', form.nacionalidad)
    formData.append('cedula', form.cedula)
    formData.append('nombres', form.nombres)
    formData.append('apellidos', form.apellidos)
    formData.append('sexo', form.sexo)
    formData.append('lugar_nacimiento', form.lugar_nacimiento)
    formData.append('fecha_nacimiento', form.fecha_nacimiento)
    formData.append('telefono', form.telefono)
    formData.append('direccion_habitacion', form.direccion_habitacion)
    formData.append('cargo_nominal', form.cargo_nominal)
    formData.append('fecha_ingreso_ministerio', form.fecha_ingreso_ministerio)
    formData.append('vacaciones_disfrutadas', form.vacaciones_disfrutadas)
    formData.append('fecha_ingreso_admin_publica', form.fecha_ingreso_admin_publica)
    formData.append('codigo_nomina', form.codigo_nomina)
    formData.append('ubicacion_administrativa', form.ubicacion_administrativa)
    formData.append('situacion_laboral', form.situacion_laboral)
    formData.append('tipo_personal', form.tipo_personal)
    formData.append('profesion', form.profesion)
    formData.append('especialidad', form.especialidad)
    formData.append('nivel_academico', form.nivel_academico)

    const res = await createUser(formData)
    
    if (res.error) {
      setError(res.error)
    } else if (res.user) {
      // Optimistic update
      setUsuarios([{ 
        id: res.user.id, created_at: new Date().toISOString(),
        ...form
      }, ...usuarios])
      setIsModalOpen(false)
      setForm(initialFormState)
      setShowPassword(false)
    }
    
    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este usuario por completo? Esto también lo borrará de los accesos de Supabase.')) {
      const res = await removeUser(id)
      if (res.success) {
        setUsuarios(usuarios.filter(u => u.id !== id))
      } else {
        alert('Error al eliminar usuario: ' + res.error)
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end rounded-2xl border border-sys-border bg-sys-panel/50 p-5 shadow-xl">
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-sys-primary-dark px-4 py-2 text-sm font-medium text-sys-text hover:bg-sys-primary">
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="min-w-[800px] rounded-2xl border border-sys-border bg-sys-panel/50 shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm text-sys-text-muted whitespace-nowrap">
            <thead className="border-b border-sys-border bg-black/20 text-xs uppercase text-zinc-300">
              <tr>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Correo Electrónico</th>
                <th className="px-6 py-4 font-medium">Rol</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u: any) => (
                <tr 
                  key={u.id} 
                  onClick={() => { setSelectedUsuario(u); setIsDetailsOpen(true); }}
                  className="border-b border-sys-border transition-colors hover:bg-white/10 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden ${u.rol === 'admin' ? 'bg-sys-admin/20 text-sys-admin' : 'bg-sys-visor/20 text-sys-visor'}`}>
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          u.rol === 'admin' ? <Shield size={20} /> : <UserCircle size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-sys-text">{u.nombres ? `${u.nombres} ${u.apellidos}` : 'Usuario del Sistema'}</div>
                        {u.cedula && <div className="text-xs text-sys-text-dark">{u.nacionalidad}-{u.cedula}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sys-text-muted">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${u.rol === 'admin' ? 'bg-sys-admin/10 text-sys-admin' : 'bg-sys-visor/10 text-sys-visor'}`}>
                      {u.rol === 'admin' ? 'Administrador' : 'Visor'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }} className="text-sys-text-dark hover:text-sys-danger transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-sys-text-dark">No se encontraron usuarios.</td></tr>}
            </tbody>
          </table>
      </div>

      {/* Modal Detalles */}
      {isDetailsOpen && selectedUsuario && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex w-full max-w-5xl flex-col bg-sys-bg shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-sys-border p-6">
              <h2 className="text-xl font-bold text-sys-text">Perfil de Usuario</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-sys-text-dark hover:text-sys-text">✕</button>
            </div>
            
            <div className="flex flex-1 flex-col overflow-y-auto p-6 md:flex-row md:gap-8">
              {/* Información Personal y Avatar */}
              <div className="flex flex-col gap-6 md:w-1/3 shrink-0">
                <div className="flex flex-col items-center pb-6 border-b border-sys-border text-center">
                  <div className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center mb-4 ring-4 ring-zinc-900 ${selectedUsuario.rol === 'admin' ? 'bg-sys-admin/20 text-sys-admin' : 'bg-sys-visor/20 text-sys-visor'}`}>
                    {selectedUsuario.avatar_url ? (
                      <img src={selectedUsuario.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      selectedUsuario.rol === 'admin' ? <Shield size={48} /> : <UserCircle size={48} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-sys-text">{selectedUsuario.nombres} {selectedUsuario.apellidos}</h3>
                  <p className="text-sm text-sys-text-muted">{selectedUsuario.email}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${selectedUsuario.rol === 'admin' ? 'bg-sys-admin/10 text-sys-admin' : 'bg-sys-visor/10 text-sys-visor'}`}>
                    {selectedUsuario.rol === 'admin' ? 'Administrador' : 'Visor'}
                  </span>
                </div>
              </div>

              {/* Tabs Section like Empleados */}
              <div className="mt-8 flex flex-1 flex-col border-t border-sys-border pt-8 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex gap-4 border-b border-sys-border mb-6">
                  <button className="pb-3 text-sm font-medium transition-colors relative text-sys-primary-hover">
                    <div className="flex items-center gap-2"><UserCircle size={16}/> Perfil</div>
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full"></div>
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="rounded-xl border border-sys-border bg-black/20 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-sys-text-dark">Datos Personales</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Cédula</span><span className="font-medium text-sys-text">{selectedUsuario.nacionalidad}-{selectedUsuario.cedula}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Sexo</span><span className="font-medium text-sys-text">{selectedUsuario.sexo === 'M' ? 'Masculino' : 'Femenino'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Fecha de Nacimiento</span><span className="font-medium text-sys-text">{formatDate(selectedUsuario.fecha_nacimiento)}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Teléfono</span><span className="font-medium text-sys-text">{selectedUsuario.telefono || '--'}</span></div>
                      <div className="flex flex-col col-span-2"><span className="text-xs text-sys-text-dark">Dirección</span><span className="font-medium text-sys-text leading-relaxed">{selectedUsuario.direccion_habitacion || '--'}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sys-border bg-black/20 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-sys-text-dark">Datos Laborales</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Cargo Nominal</span><span className="font-medium text-sys-text">{selectedUsuario.cargo_nominal || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Situación Laboral</span><span className="font-medium text-sys-text">{selectedUsuario.situacion_laboral || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Tipo de Personal</span><span className="font-medium text-sys-text">{selectedUsuario.tipo_personal || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Ubicación Administrativa</span><span className="font-medium text-sys-text">{selectedUsuario.ubicacion_administrativa || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Código de Nómina</span><span className="font-medium text-sys-text">{selectedUsuario.codigo_nomina || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Vacaciones Disfrutadas</span><span className="font-medium text-sys-text">{selectedUsuario.vacaciones_disfrutadas || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Ingreso Ministerio</span><span className="font-medium text-sys-text">{formatDate(selectedUsuario.fecha_ingreso_ministerio)}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Ingreso Admin. Pública</span><span className="font-medium text-sys-text">{formatDate(selectedUsuario.fecha_ingreso_admin_publica)}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-sys-border bg-black/20 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-sys-text-dark">Información Académica</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Nivel Académico</span><span className="font-medium text-sys-text">{selectedUsuario.nivel_academico || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-sys-text-dark">Profesión</span><span className="font-medium text-sys-text">{selectedUsuario.profesion || '--'}</span></div>
                      <div className="flex flex-col col-span-2"><span className="text-xs text-sys-text-dark">Especialidad</span><span className="font-medium text-sys-text">{selectedUsuario.especialidad || '--'}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-sys-border bg-sys-bg p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-sys-text">Crear Usuario</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-sys-text-dark hover:text-sys-text">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sys-primary-hover border-b border-sys-border pb-2">Datos de Cuenta</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-sys-text-muted">Correo Electrónico</label>
                    <input required type="email" placeholder="usuario@hospital.com" autoComplete="off" className="w-full rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-sys-text-muted">Contraseña temporal</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} placeholder="••••••••" minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-sys-border bg-sys-panel px-4 py-2 pr-10 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-sys-text-dark hover:text-sys-text z-10 touch-manipulation">
                        {showPassword ? <EyeOff size={16} className="pointer-events-none" /> : <Eye size={16} className="pointer-events-none" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-xs font-medium text-sys-text-muted">Rol de Sistema</label>
                    <select className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.rol} onChange={(e) => setForm({...form, rol: e.target.value})}>
                      <option value="visor">Visor (Solo Lectura)</option>
                      <option value="admin">Administrador (Control Total)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sys-primary-hover border-b border-sys-border pb-2">Datos Personales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-sys-text-muted">Cédula</label>
                    <div className="flex">
                      <select className="rounded-l-xl border-r-0 border border-sys-border bg-sys-panel px-3 py-2 text-sm text-sys-text focus:outline-none" value={form.nacionalidad} onChange={(e) => setForm({...form, nacionalidad: e.target.value})}>
                        <option value="V">V</option><option value="E">E</option>
                      </select>
                      <input required type="number" className="w-full rounded-r-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Nombres</label><input required type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.nombres} onChange={(e) => setForm({...form, nombres: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Apellidos</label><input required type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.apellidos} onChange={(e) => setForm({...form, apellidos: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Sexo</label><select className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.sexo} onChange={(e) => setForm({...form, sexo: e.target.value})}><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Lugar de Nacimiento</label><input required type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.lugar_nacimiento} onChange={(e) => setForm({...form, lugar_nacimiento: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Fecha de Nacimiento</label><div className="flex gap-4 items-center"><input required type="date" className="flex-1 rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.fecha_nacimiento} onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})} /></div></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Teléfono</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} /></div>
                  <div className="flex flex-col gap-1 col-span-2"><label className="text-xs font-medium text-sys-text-muted">Dirección de Habitación</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.direccion_habitacion} onChange={(e) => setForm({...form, direccion_habitacion: e.target.value})} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sys-primary-hover border-b border-sys-border pb-2">Datos Laborales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Cargo Nominal</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.cargo_nominal} onChange={(e) => setForm({...form, cargo_nominal: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Código de Nómina</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.codigo_nomina} onChange={(e) => setForm({...form, codigo_nomina: e.target.value})} /></div>
                  
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Situación Laboral</label><input type="text" placeholder="Ej: Activo, Reposo, etc." className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.situacion_laboral} onChange={(e) => setForm({...form, situacion_laboral: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Tipo de Personal</label><input type="text" placeholder="Ej: Fijo, Contratado, etc." className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.tipo_personal} onChange={(e) => setForm({...form, tipo_personal: e.target.value})} /></div>
                  
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Ubicación Administrativa</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.ubicacion_administrativa} onChange={(e) => setForm({...form, ubicacion_administrativa: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Vacaciones Disfrutadas</label><input type="text" placeholder="Ej: 2012-2013" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.vacaciones_disfrutadas} onChange={(e) => setForm({...form, vacaciones_disfrutadas: e.target.value})} /></div>
                  
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Ingreso Ministerio</label><input type="date" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.fecha_ingreso_ministerio} onChange={(e) => setForm({...form, fecha_ingreso_ministerio: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Ingreso Admin. Pública</label><input type="date" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.fecha_ingreso_admin_publica} onChange={(e) => setForm({...form, fecha_ingreso_admin_publica: e.target.value})} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-sys-primary-hover border-b border-sys-border pb-2">Información Académica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Nivel Académico</label><input type="text" placeholder="Ej: TSU, Licenciado, Bachiller" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.nivel_academico} onChange={(e) => setForm({...form, nivel_academico: e.target.value})} /></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Profesión</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.profesion} onChange={(e) => setForm({...form, profesion: e.target.value})} /></div>
                  <div className="flex flex-col gap-1 col-span-2"><label className="text-xs font-medium text-sys-text-muted">Especialidad</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.especialidad} onChange={(e) => setForm({...form, especialidad: e.target.value})} /></div>
                </div>
              </div>

              {error && <div className="rounded-lg bg-sys-danger/10 p-3 text-sm text-sys-danger">{error}</div>}

              <div className="mt-4 flex justify-end gap-3 border-t border-sys-border pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-sys-text-muted hover:bg-white/5 hover:text-sys-text">Cancelar</button>
                <button type="submit" disabled={isLoading} className="rounded-xl bg-sys-primary-dark px-4 py-2 text-sm font-medium text-sys-text hover:bg-sys-primary disabled:opacity-50">
                  {isLoading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
