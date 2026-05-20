import { LayoutDashboard, Users, Clock, CalendarDays, Settings, UserCog, UserCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { MobileNav } from './MobileNav'
import Link from 'next/link'

export async function Topbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let perfil: any = null
  if (user) {
    const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    perfil = data
  }

  const rol = perfil?.rol || 'visor'

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-zinc-950 px-6 md:justify-end">
      <div className="md:hidden">
        <MobileNav rol={rol} />
      </div>
      <div className="flex items-center gap-4">
        <Link href="/dashboard/perfil" className="group flex items-center justify-center h-8 w-8 overflow-hidden rounded-full bg-zinc-800 transition-all hover:ring-2 hover:ring-emerald-500 hover:ring-offset-2 hover:ring-offset-zinc-950">
          {perfil?.avatar_url ? (
            <img src={perfil.avatar_url} alt="Perfil" className="h-full w-full object-cover" />
          ) : (
            <UserCircle2 size={24} className="text-zinc-400 group-hover:text-white" />
          )}
        </Link>
      </div>
    </header>
  )
}
