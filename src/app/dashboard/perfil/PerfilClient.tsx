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
        <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-zinc-900/50 p-8 shadow-xl text-center">
          
          <div className="relative mb-6">
            <div className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-zinc-950 bg-zinc-800 flex items-center justify-center">
              {perfil.avatar_url ? (
                <img src={perfil.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 size={64} className="text-zinc-500" />
              )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 rounded-full bg-emerald-600 p-2.5 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
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
                className="absolute bottom-0 left-0 rounded-full bg-red-600 p-2 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
                title="Eliminar foto de perfil"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            )}
          </div>

          <h2 className="text-xl font-bold text-white">{nombreCompleto}</h2>
          <p className="mt-1 text-sm text-zinc-400">{userEmail}</p>

          <div className={`mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${perfil.rol === 'admin' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
            {perfil.rol === 'admin' ? <Shield size={14} /> : <Eye size={14} />}
            {rolName}
          </div>

          {isUploading && <p className="mt-4 text-xs text-emerald-500 animate-pulse">Subiendo foto...</p>}
          {error && <p className="mt-4 text-xs text-red-500 bg-red-500/10 p-2 rounded-lg">{error}</p>}
          {success && <p className="mt-4 text-xs text-emerald-500 bg-emerald-500/10 p-2 rounded-lg flex items-center gap-1 justify-center"><CheckCircle2 size={14}/> {success}</p>}
        </div>
      </div>

      {/* Columna Derecha: Datos Personales */}
      <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-zinc-900/50 shadow-xl overflow-hidden">
        <div className="border-b border-white/10 px-6 py-5 bg-black/20">
          <h3 className="font-semibold text-white">Información Personal</h3>
          <p className="text-xs text-zinc-400 mt-1">Tus datos registrados en el sistema administrativo.</p>
        </div>
        
        <div className="p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            
            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Cédula de Identidad</dt>
              <dd className="mt-1 text-sm text-white font-medium">
                {perfil.cedula ? `${perfil.nacionalidad}-${perfil.cedula}` : 'No registrada'}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Sexo</dt>
              <dd className="mt-1 text-sm text-white font-medium">
                {perfil.sexo === 'M' ? 'Masculino' : perfil.sexo === 'F' ? 'Femenino' : 'No registrado'}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Fecha de Nacimiento</dt>
              <dd className="mt-1 text-sm text-white flex items-center gap-2 font-medium">
                <Calendar size={16} className="text-zinc-400" />
                {perfil.fecha_nacimiento ? formatDate(perfil.fecha_nacimiento) : 'No registrada'}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Lugar de Nacimiento</dt>
              <dd className="mt-1 text-sm text-white flex items-center gap-2 font-medium">
                <MapPin size={16} className="text-zinc-400" />
                {perfil.lugar_nacimiento || 'No registrado'}
              </dd>
            </div>

          </dl>
        </div>
      </div>

    </div>
  )
}
