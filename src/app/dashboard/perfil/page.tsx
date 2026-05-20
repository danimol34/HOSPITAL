import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PerfilClient from './PerfilClient'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
        <p className="text-sm text-zinc-400">Información personal y configuración de cuenta.</p>
      </div>
      
      <PerfilClient initialPerfil={perfil || {}} userEmail={user.email || ''} />
    </div>
  )
}
