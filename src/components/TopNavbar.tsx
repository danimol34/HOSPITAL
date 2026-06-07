import Link from 'next/link'
import { LayoutDashboard, Users, Clock, CalendarDays, Settings, UserCog, UserCircle2, Activity } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { MobileNav } from './MobileNav'
import { TopNavLinks } from './TopNavLinks'

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

  const navigation = [
    { name: 'INICIO', href: '/dashboard', icon: LayoutDashboard },
    { name: 'EMPLEADOS', href: '/dashboard/empleados', icon: Users },
    { name: 'VACACIONES', href: '/dashboard/vacaciones', icon: CalendarDays },
  ]

  if (rol === 'admin') {
    navigation.push({ name: 'ASISTENCIAS', href: '/dashboard/asistencias', icon: Clock })
    navigation.push({ name: 'ESTRUCTURA', href: '/dashboard/estructura', icon: Settings })
    navigation.push({ name: 'USUARIOS', href: '/dashboard/usuarios', icon: UserCog })
  }

  return (
    <header className="relative z-50 flex h-auto flex-col border-b border-sys-border bg-sys-panel shadow-sm">
      {/* Superior Bar: Logo and Profile */}
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Activity size={32} className="text-sys-primary" />
          <h1 className="text-lg font-bold text-sys-primary-dark hidden sm:block tracking-wide">
            HOSPITAL NUESTRA SEÑORA DEL CARMEN - RRHH
          </h1>
          <h1 className="text-lg font-bold text-sys-primary-dark sm:hidden tracking-wide">
            H. CARMEN - RRHH
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-sys-text-muted hidden md:block">
            {perfil?.nombre || 'Usuario'}
          </span>
          <Link href="/dashboard/perfil" className="group flex items-center justify-center h-9 w-9 overflow-hidden rounded-full bg-sys-panel-hover transition-all hover:ring-2 hover:ring-sys-primary hover:ring-offset-2">
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
      </div>

      {/* Navigation Bar (Desktop) */}
      <nav className="hidden md:flex h-12 items-center px-6 border-t border-sys-border bg-white">
        <TopNavLinks navigation={navigation} />
      </nav>
    </header>
  )
}
