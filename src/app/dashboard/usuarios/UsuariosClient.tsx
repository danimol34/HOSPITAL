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
  const [form, setForm] = useState({ 
    email: '', password: '', rol: 'visor',
    nacionalidad: 'V', cedula: '', nombres: '', apellidos: '', sexo: 'M', lugar_nacimiento: '', fecha_nacimiento: ''
  })
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
      setForm({ 
        email: '', password: '', rol: 'visor',
        nacionalidad: 'V', cedula: '', nombres: '', apellidos: '', sexo: 'M', lugar_nacimiento: '', fecha_nacimiento: ''
      })
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
                <tr key={u.id} className="border-b border-white/5 transition-colors hover:bg-white/5">
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
                      <button onClick={() => { setSelectedUsuario(u); setIsDetailsOpen(true); }} className="text-zinc-500 hover:text-emerald-400 transition-colors" title="Ver Detalles"><Eye size={18} /></button>
                      <button onClick={() => handleDelete(u.id)} className="text-zinc-500 hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Perfil de Usuario</h2>
              <button onClick={() => setIsDetailsOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>
            
            <div className="flex flex-col items-center mb-8 pb-6 border-b border-white/10">
              <div className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center mb-4 ring-4 ring-zinc-900 ${selectedUsuario.rol === 'admin' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-400'}`}>
                {selectedUsuario.avatar_url ? (
                  <img src={selectedUsuario.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <UserCircle size={48} />
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{selectedUsuario.nombres} {selectedUsuario.apellidos}</h3>
              <p className="text-sm text-zinc-400">{selectedUsuario.email}</p>
              <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-medium ${selectedUsuario.rol === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
                {selectedUsuario.rol === 'admin' ? 'Administrador' : 'Visor'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Cédula</dt>
                <dd className="mt-1 text-sm text-white font-medium">{selectedUsuario.nacionalidad}-{selectedUsuario.cedula || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sexo</dt>
                <dd className="mt-1 text-sm text-white font-medium">{selectedUsuario.sexo === 'M' ? 'Masculino' : 'Femenino'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Lugar de Nacimiento</dt>
                <dd className="mt-1 text-sm text-white font-medium">{selectedUsuario.lugar_nacimiento || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Fecha de Nacimiento</dt>
                <dd className="mt-1 text-sm text-white font-medium">{formatDate(selectedUsuario.fecha_nacimiento)}</dd>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button onClick={() => setIsDetailsOpen(false)} className="rounded-xl bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 transition-colors">
                Cerrar
              </button>
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
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <h3 className="text-sm font-semibold text-emerald-500">Datos Personales</h3>
                  <hr className="border-white/10" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Cédula</label>
                  <div className="flex gap-2">
                    <select className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.nacionalidad} onChange={(e) => setForm({...form, nacionalidad: e.target.value})}>
                      <option value="V">V</option>
                      <option value="E">E</option>
                    </select>
                    <input required type="number" placeholder="12345678" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Nombres</label>
                  <input required type="text" placeholder="Juan Pérez" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.nombres} onChange={(e) => setForm({...form, nombres: e.target.value})} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Apellidos</label>
                  <input required type="text" placeholder="Gómez" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.apellidos} onChange={(e) => setForm({...form, apellidos: e.target.value})} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Sexo</label>
                  <select className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.sexo} onChange={(e) => setForm({...form, sexo: e.target.value})}>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Lugar de Nacimiento</label>
                  <input required type="text" placeholder="Caracas" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.lugar_nacimiento} onChange={(e) => setForm({...form, lugar_nacimiento: e.target.value})} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Fecha de Nacimiento</label>
                  <input required type="date" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.fecha_nacimiento} onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <h3 className="text-sm font-semibold text-emerald-500 mt-2">Datos de Cuenta</h3>
                  <hr className="border-white/10" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Correo Electrónico</label>
                  <input required type="email" placeholder="usuario@hospital.com" autoComplete="off" className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-300">Contraseña temporal</label>
                  <div className="relative">
                    <input required type={showPassword ? "text" : "password"} placeholder="••••••••" minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 pr-10 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white z-10 touch-manipulation">
                      {showPassword ? <EyeOff size={16} className="pointer-events-none" /> : <Eye size={16} className="pointer-events-none" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm font-medium text-zinc-300">Rol de Sistema</label>
                  <select className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none" value={form.rol} onChange={(e) => setForm({...form, rol: e.target.value})}>
                    <option value="visor">Visor (Solo Lectura)</option>
                    <option value="admin">Administrador (Control Total)</option>
                  </select>
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
