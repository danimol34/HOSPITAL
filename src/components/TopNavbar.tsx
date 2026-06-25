import Link from 'next/link'
import { UserCircle2, Activity, Bell } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { MobileNav } from './MobileNav'

export async function TopNavbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let perfil: any = null
  let rol = 'visor'
  
  if (user) {
    const { data } = await supabase.from('perfiles').select('*').eq('id', user.id).single()
    if (data) {
      perfil = data
      rol = data.rol
    }
  }

  return (
    <header className="relative z-40 flex h-20 shrink-0 w-full items-center justify-between border-b border-sys-border bg-white px-4 shadow-sm md:px-8">
      {/* Title */}
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain hidden md:block" />
        <h1 className="text-base font-bold text-sys-primary-dark tracking-wide hidden sm:block">
          HOSPITAL NUESTRA SEÑORA DEL CARMEN - RRHH
        </h1>
        <h1 className="text-base font-bold text-sys-primary-dark tracking-wide sm:hidden">
          H. CARMEN - RRHH
        </h1>
      </div>

      {/* Profile & Mobile Menu */}
      <div className="flex items-center gap-4 md:gap-6">
        <Link href="/dashboard/perfil" className="group flex items-center justify-center h-10 w-10 overflow-hidden rounded-full bg-sys-panel-hover transition-all hover:ring-2 hover:ring-sys-primary hover:ring-offset-2">
          {perfil?.avatar_url ? (
            <img src={perfil.avatar_url} alt="Perfil" className="h-full w-full object-cover" />
          ) : (
            <UserCircle2 size={24} className="text-sys-text-muted group-hover:text-sys-primary" />
          )}
        </Link>
        
        <div className="md:hidden flex items-center">
          <MobileNav rol={rol} />
        </div>
      </div>
    </header>
  )
}
