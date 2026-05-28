'use client'

import { useState, useRef } from 'react'
import { UserCircle2, Camera, Shield, Eye, Calendar, MapPin, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

function formatDate(dateString: string) {
  if (!dateString) return '--/--/----'
  return dateString.split('-').reverse().join('/')
}
import { useRouter } from 'next/navigation'

export default function PerfilClient({ initialPerfil, userEmail }: { initialPerfil: any, userEmail: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [perfil, setPerfil] = useState(initialPerfil)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    nacionalidad: perfil.nacionalidad || 'V',
    cedula: perfil.cedula || '',
    nombres: perfil.nombres || '',
    apellidos: perfil.apellidos || '',
    sexo: perfil.sexo || 'M',
    lugar_nacimiento: perfil.lugar_nacimiento || '',
    fecha_nacimiento: perfil.fecha_nacimiento || '',
    telefono: perfil.telefono || '',
    direccion_habitacion: perfil.direccion_habitacion || '',
    cargo_nominal: perfil.cargo_nominal || '',
    codigo_nomina: perfil.codigo_nomina || '',
    situacion_laboral: perfil.situacion_laboral || '',
    tipo_personal: perfil.tipo_personal || '',
    ubicacion_administrativa: perfil.ubicacion_administrativa || '',
    vacaciones_disfrutadas: perfil.vacaciones_disfrutadas || '',
    fecha_ingreso_ministerio: perfil.fecha_ingreso_ministerio || '',
    fecha_ingreso_admin_publica: perfil.fecha_ingreso_admin_publica || '',
    nivel_academico: perfil.nivel_academico || '',
    profesion: perfil.profesion || '',
    especialidad: perfil.especialidad || ''
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')
    setSuccess('')

    const payload: any = { ...form }
    if (!payload.fecha_nacimiento) payload.fecha_nacimiento = null
    if (!payload.fecha_ingreso_ministerio) payload.fecha_ingreso_ministerio = null
    if (!payload.fecha_ingreso_admin_publica) payload.fecha_ingreso_admin_publica = null

    const { error: updateError } = await supabase
      .from('perfiles')
      .update(payload)
      .eq('id', perfil.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setPerfil({ ...perfil, ...form })
      setSuccess('Datos actualizados correctamente.')
      setIsEditing(false)
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    }
    setIsSaving(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('La imagen es muy pesada (Máx 2MB).')
      return
    }

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${perfil.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update perfiles table
      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ avatar_url: publicUrl })
        .eq('id', perfil.id)

      if (updateError) throw updateError

      setPerfil({ ...perfil, avatar_url: publicUrl })
      setSuccess('Foto de perfil actualizada correctamente.')
      
      router.refresh()
      
      // Auto-hide success message after 3s
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Hubo un error subiendo la imagen.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = '' // Reset input
    }
  }

  const handleRemoveAvatar = async () => {
    if (!perfil.avatar_url) return

    setIsUploading(true)
    setError('')
    setSuccess('')

    try {
      // Extract file path from URL
      const urlParts = perfil.avatar_url.split('/avatars/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        // Remove from storage
        await supabase.storage.from('avatars').remove([filePath])
      }

      // Update perfiles table
      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ avatar_url: null })
        .eq('id', perfil.id)

      if (updateError) throw updateError

      setPerfil({ ...perfil, avatar_url: null })
      setSuccess('Foto de perfil eliminada.')
      router.refresh()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Hubo un error eliminando la imagen.')
    } finally {
      setIsUploading(false)
    }
  }

  const nombreCompleto = perfil.nombres ? `${perfil.nombres} ${perfil.apellidos}` : 'Usuario'
  const rolName = perfil.rol === 'admin' ? 'Administrador' : 'Visor'
  
  return (
    <div className="flex flex-col gap-8 md:flex-row">
      
      {/* Columna Izquierda: Tarjeta Principal */}
      <div className="flex w-full flex-col gap-6 md:w-1/3">
        <div className="flex flex-col items-center rounded-2xl border border-sys-border bg-sys-panel/50 p-8 shadow-xl text-center">
          
          <div className="relative mb-6">
            <div className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-zinc-950 bg-sys-panel-hover flex items-center justify-center">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 size={64} className="text-sys-text-dark" />
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 rounded-full bg-sys-primary-dark p-2.5 text-sys-text shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
              title="Cambiar foto de perfil"
            >
              <Camera size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" 
              className="hidden" 
            />

            {perfil.avatar_url && (
              <button 
                onClick={handleRemoveAvatar}
                disabled={isUploading}
                className="absolute bottom-0 left-0 rounded-full bg-sys-danger p-2 text-sys-text shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                title="Eliminar foto de perfil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-sys-text">{nombreCompleto}</h2>
          <p className="mt-1 text-sm text-sys-text-muted">{userEmail}</p>

          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${perfil.rol === 'admin' ? 'bg-sys-admin/10 text-sys-admin' : 'bg-sys-visor/10 text-sys-visor'}`}>
            {perfil.rol === 'admin' ? <Shield size={14} /> : <Eye size={14} />}
            {rolName}
          </div>

          {isUploading && <p className="mt-4 text-xs text-sys-primary animate-pulse">Subiendo foto...</p>}
          {error && <p className="mt-4 text-xs text-sys-danger bg-sys-danger/10 p-2 rounded-lg">{error}</p>}
          {success && <p className="mt-4 text-xs text-sys-primary bg-sys-primary/10 p-2 rounded-lg flex items-center gap-1 justify-center"><CheckCircle2 size={14}/> {success}</p>}
        </div>
      </div>

      {/* Columna Derecha: Datos Personales */}
      <div className="flex flex-1 flex-col rounded-2xl border border-sys-border bg-sys-panel/50 shadow-xl overflow-hidden">
        <div className="flex justify-between items-center border-b border-sys-border px-6 py-5 bg-black/20">
          <div>
            <h3 className="font-semibold text-sys-text">Información del Perfil</h3>
            <p className="text-xs text-sys-text-muted mt-1">Tus datos registrados en el sistema administrativo.</p>
          </div>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-sys-text hover:bg-white/20 transition-colors">
              Editar Datos
            </button>
          )}
        </div>
        
        <div className="p-6">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-sys-text-muted">Nombres</label>
                  <input required type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.nombres} onChange={(e) => setForm({...form, nombres: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-sys-text-muted">Apellidos</label>
                  <input required type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.apellidos} onChange={(e) => setForm({...form, apellidos: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-sys-text-muted">Cédula</label>
                  <div className="flex">
                    <select className="rounded-l-xl border-r-0 border border-sys-border bg-sys-panel px-3 py-2 text-sm text-sys-text focus:outline-none" value={form.nacionalidad} onChange={(e) => setForm({...form, nacionalidad: e.target.value})}>
                      <option value="V">V</option><option value="E">E</option>
                    </select>
                    <input required type="number" className="w-full rounded-r-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.cedula} onChange={(e) => setForm({...form, cedula: e.target.value})} />
                  </div>
                </div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Sexo</label><select className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.sexo} onChange={(e) => setForm({...form, sexo: e.target.value})}><option value="M">Masculino</option><option value="F">Femenino</option></select></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Lugar de Nacimiento</label><input required type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.lugar_nacimiento} onChange={(e) => setForm({...form, lugar_nacimiento: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Fecha de Nacimiento</label><input required type="date" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.fecha_nacimiento} onChange={(e) => setForm({...form, fecha_nacimiento: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Teléfono</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.telefono} onChange={(e) => setForm({...form, telefono: e.target.value})} /></div>
                <div className="flex flex-col gap-1 sm:col-span-2"><label className="text-xs font-medium text-sys-text-muted">Dirección de Habitación</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.direccion_habitacion} onChange={(e) => setForm({...form, direccion_habitacion: e.target.value})} /></div>
                
                <div className="sm:col-span-2"><h4 className="mt-4 border-b border-sys-border pb-2 text-sm font-bold text-sys-primary-hover uppercase tracking-wider">Datos Laborales</h4></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Cargo Nominal</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.cargo_nominal} onChange={(e) => setForm({...form, cargo_nominal: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Código de Nómina</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.codigo_nomina} onChange={(e) => setForm({...form, codigo_nomina: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Situación Laboral</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.situacion_laboral} onChange={(e) => setForm({...form, situacion_laboral: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Tipo de Personal</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.tipo_personal} onChange={(e) => setForm({...form, tipo_personal: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Ubicación Administrativa</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.ubicacion_administrativa} onChange={(e) => setForm({...form, ubicacion_administrativa: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Vacaciones Disfrutadas</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.vacaciones_disfrutadas} onChange={(e) => setForm({...form, vacaciones_disfrutadas: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Ingreso Ministerio</label><input type="date" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.fecha_ingreso_ministerio} onChange={(e) => setForm({...form, fecha_ingreso_ministerio: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Ingreso Admin. Pública</label><input type="date" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.fecha_ingreso_admin_publica} onChange={(e) => setForm({...form, fecha_ingreso_admin_publica: e.target.value})} /></div>

                <div className="sm:col-span-2"><h4 className="mt-4 border-b border-sys-border pb-2 text-sm font-bold text-sys-primary-hover uppercase tracking-wider">Información Académica</h4></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Nivel Académico</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.nivel_academico} onChange={(e) => setForm({...form, nivel_academico: e.target.value})} /></div>
                <div className="flex flex-col gap-1"><label className="text-xs font-medium text-sys-text-muted">Profesión</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.profesion} onChange={(e) => setForm({...form, profesion: e.target.value})} /></div>
                <div className="flex flex-col gap-1 sm:col-span-2"><label className="text-xs font-medium text-sys-text-muted">Especialidad</label><input type="text" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm text-sys-text focus:border-sys-primary focus:outline-none" value={form.especialidad} onChange={(e) => setForm({...form, especialidad: e.target.value})} /></div>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-sys-border pt-4">
                <button type="button" onClick={() => { setIsEditing(false); setForm({...perfil}); }} className="rounded-xl px-4 py-2 text-sm font-medium text-sys-text-muted hover:bg-white/5 hover:text-sys-text">Cancelar</button>
                <button type="submit" disabled={isSaving} className="rounded-xl bg-sys-primary-dark px-4 py-2 text-sm font-medium text-sys-text hover:bg-sys-primary disabled:opacity-50">
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-2"><h4 className="border-b border-sys-border pb-2 text-sm font-bold text-sys-primary-hover uppercase tracking-wider">Datos Personales</h4></div>
              
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Cédula de Identidad</dt>
                <dd className="mt-1 text-sm text-sys-text font-medium">{perfil.cedula ? `${perfil.nacionalidad}-${perfil.cedula}` : 'No registrada'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Sexo</dt>
                <dd className="mt-1 text-sm text-sys-text font-medium">{perfil.sexo === 'M' ? 'Masculino' : perfil.sexo === 'F' ? 'Femenino' : 'No registrado'}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Fecha de Nacimiento</dt>
                <dd className="mt-1 text-sm text-sys-text flex items-center gap-2 font-medium">
                  <Calendar size={16} className="text-sys-text-muted" />
                  {perfil.fecha_nacimiento ? formatDate(perfil.fecha_nacimiento) : 'No registrada'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Lugar de Nacimiento</dt>
                <dd className="mt-1 text-sm text-sys-text flex items-center gap-2 font-medium">
                  <MapPin size={16} className="text-sys-text-muted" />
                  {perfil.lugar_nacimiento || 'No registrado'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Teléfono</dt>
                <dd className="mt-1 text-sm text-sys-text font-medium">{perfil.telefono || '--'}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Dirección de Habitación</dt>
                <dd className="mt-1 text-sm text-sys-text font-medium">{perfil.direccion_habitacion || '--'}</dd>
              </div>

              <div className="sm:col-span-2 mt-4"><h4 className="border-b border-sys-border pb-2 text-sm font-bold text-sys-primary-hover uppercase tracking-wider">Datos Laborales</h4></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Cargo Nominal</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.cargo_nominal || '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Situación Laboral</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.situacion_laboral || '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Tipo de Personal</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.tipo_personal || '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Ubicación Administrativa</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.ubicacion_administrativa || '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Código de Nómina</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.codigo_nomina || '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Vacaciones Disfrutadas</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.vacaciones_disfrutadas || '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Ingreso Ministerio</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.fecha_ingreso_ministerio ? formatDate(perfil.fecha_ingreso_ministerio) : '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Ingreso Admin. Pública</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.fecha_ingreso_admin_publica ? formatDate(perfil.fecha_ingreso_admin_publica) : '--'}</dd></div>

              <div className="sm:col-span-2 mt-4"><h4 className="border-b border-sys-border pb-2 text-sm font-bold text-sys-primary-hover uppercase tracking-wider">Información Académica</h4></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Nivel Académico</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.nivel_academico || '--'}</dd></div>
              <div className="sm:col-span-1"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Profesión</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.profesion || '--'}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs font-medium text-sys-text-dark uppercase tracking-wider">Especialidad</dt><dd className="mt-1 text-sm text-sys-text font-medium">{perfil.especialidad || '--'}</dd></div>
            </dl>
          )}
        </div>
      </div>

    </div>
  )
}
