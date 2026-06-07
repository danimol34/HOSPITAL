import { createClient } from '@/utils/supabase/server'
import { UserCircle, Shield, Eye, Plus, Trash2 } from 'lucide-react'
import UsuariosClient from './UsuariosClient'
import { redirect } from 'next/navigation'

export default async function UsuariosPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check role
  const { data: currentPerfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (!currentPerfil || currentPerfil.rol !== 'admin') {
    redirect('/dashboard') // Only admins can access this page
  }

  // Fetch all perfiles
  const { data: perfiles } = await supabase
    .from('perfiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-sys-text">Gestión de Usuarios</h1>
        <p className="text-sm text-sys-text-muted">Administra el acceso al sistema (Administradores y Visores).</p>
      </div>
      
      <UsuariosClient initialUsuarios={perfiles || []} />
    </div>
  )
}



