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
      <div className="flex items-center justify-end rounded-2xl border border-white/10 bg-zinc-900/50 p-5 shadow-xl">
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      {/* Table */}
      <div className="min-w-[800px] rounded-2xl border border-white/10 bg-zinc-900/50 shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm text-zinc-400 whitespace-nowrap">
            <thead className="border-b border-white/10 bg-black/20 text-xs uppercase text-zinc-300">
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
                  className="border-b border-white/5 transition-colors hover:bg-white/10 cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden ${u.rol === 'admin' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-400'}`}>
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          u.rol === 'admin' ? <Shield size={20} /> : <UserCircle size={20} />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-white">{u.nombres ? `${u.nombres} ${u.apellidos}` : 'Usuario del Sistema'}</div>
                        {u.cedula && <div className="text-xs text-zinc-500">{u.nacionalidad}-{u.cedula}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${u.rol === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
                      {u.rol === 'admin' ? 'Administrador' : 'Visor'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-3">
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }} className="text-zinc-500 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-zinc-500">No se encontraron usuarios.</td></tr>}
            </tbody>
          </table>
      </div>

      {/* Modal Detalles */}
      {isDetailsOpen && selectedUsuario && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="flex w-full max-w-5xl flex-col bg-zinc-950 shadow-2xl animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <h2 className="text-xl font-bold text-white">Perfil de Usuario</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            
            <div className="flex flex-1 flex-col overflow-y-auto p-6 md:flex-row md:gap-8">
              {/* Información Personal y Avatar */}
              <div className="flex flex-col gap-6 md:w-1/3 shrink-0">
                <div className="flex flex-col items-center pb-6 border-b border-white/10 text-center">
                  <div className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center mb-4 ring-4 ring-zinc-900 ${selectedUsuario.rol === 'admin' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-400'}`}>
                    {selectedUsuario.avatar_url ? (
                      <img src={selectedUsuario.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      selectedUsuario.rol === 'admin' ? <Shield size={48} /> : <UserCircle size={48} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedUsuario.nombres} {selectedUsuario.apellidos}</h3>
                  <p className="text-sm text-zinc-400">{selectedUsuario.email}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${selectedUsuario.rol === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
                    {selectedUsuario.rol === 'admin' ? 'Administrador' : 'Visor'}
                  </span>
                </div>
              </div>

              {/* Tabs Section like Empleados */}
              <div className="mt-8 flex flex-1 flex-col border-t border-white/10 pt-8 md:mt-0 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <div className="flex gap-4 border-b border-white/10 mb-6">
                  <button className="pb-3 text-sm font-medium transition-colors relative text-emerald-400">
                    <div className="flex items-center gap-2"><UserCircle size={16}/> Perfil</div>
                    <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-emerald-400 rounded-t-full"></div>
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Datos Personales</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Cédula</span><span className="font-medium text-white">{selectedUsuario.nacionalidad}-{selectedUsuario.cedula}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Sexo</span><span className="font-medium text-white">{selectedUsuario.sexo === 'M' ? 'Masculino' : 'Femenino'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Fecha de Nacimiento</span><span className="font-medium text-white">{formatDate(selectedUsuario.fecha_nacimiento)}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Teléfono</span><span className="font-medium text-white">{selectedUsuario.telefono || '--'}</span></div>
                      <div className="flex flex-col col-span-2"><span className="text-xs text-zinc-500">Dirección</span><span className="font-medium text-white leading-relaxed">{selectedUsuario.direccion_habitacion || '--'}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Datos Laborales</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Cargo Nominal</span><span className="font-medium text-white">{selectedUsuario.cargo_nominal || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Situación Laboral</span><span className="font-medium text-white">{selectedUsuario.situacion_laboral || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Tipo de Personal</span><span className="font-medium text-white">{selectedUsuario.tipo_personal || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Ubicación Administrativa</span><span className="font-medium text-white">{selectedUsuario.ubicacion_administrativa || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Código de Nómina</span><span className="font-medium text-white">{selectedUsuario.codigo_nomina || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Vacaciones Disfrutadas</span><span className="font-medium text-white">{selectedUsuario.vacaciones_disfrutadas || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Ingreso Ministerio</span><span className="font-medium text-white">{formatDate(selectedUsuario.fecha_ingreso_ministerio)}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Ingreso Admin. Pública</span><span className="font-medium text-white">{formatDate(selectedUsuario.fecha_ingreso_admin_publica)}</span></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-500">Información Académica</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Nivel Académico</span><span className="font-medium text-white">{selectedUsuario.nivel_academico || '--'}</span></div>
                      <div className="flex flex-col"><span className="text-xs text-zinc-500">Profesión</span><span className="font-medium text-white">{selectedUsuario.profesion || '--'}</span></div>
                      <div className="flex flex-col col-span-2"><span className="text-xs text-zinc-500">Especialidad</span><span className="font-medium text-white">{selectedUsuario.especialidad || '--'}</span></div>
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
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Crear Usuario</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">Datos de Cuenta</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-400">Correo Electrónico</label>
                    <input required type="email" placeholder="usuario@hospital.com" autoComplete="off" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-zinc-400">Contraseña temporal</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} placeholder="••••••••" minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 pr-10 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white z-10 touch-manipulation">
                        {showPassword ? <EyeOff size={16} className="pointer-events-none" /> : <Eye size={16} className="pointer-events-none" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-xs font-medium text-zinc-400">Rol de Sistema</label>
                    <select className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.rol} onChange={(e) => setForm({...form, rol: e.target.value})}>
                      <option value="visor">Visor (Solo Lectura)</option>
                      <option value="admin">Administrador (Control Total)</option>
                    </select>
                  </div>
                </div>
              </div>

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
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Fecha de Nacimiento</label><div className="flex gap-4 items-center"><input required type="date" className="flex-1 rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.fecha_nacimiento} onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})} /></div></div>
                  <div className="flex flex-col gap-1"><label className="text-xs font-medium text-zinc-400">Teléfono</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} /></div>
                  <div className="flex flex-col gap-1 col-span-2"><label className="text-xs font-medium text-zinc-400">Dirección de Habitación</label><input type="text" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.direccion_habitacion} onChange={(e) => setForm({...form, direccion_habitacion: e.target.value})} /></div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-2">Datos Laborales</h3>
                <div className="grid grid-cols-2 gap-4">
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

              {error && <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}

              <div className="mt-4 flex justify-end gap-3 border-t border-white/10 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white">Cancelar</button>
                <button type="submit" disabled={isLoading} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50">
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
