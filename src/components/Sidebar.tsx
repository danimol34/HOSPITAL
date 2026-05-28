import Link from 'next/link'
import { LayoutDashboard, Users, Clock, CalendarDays, Settings, LogOut, UserCog } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'

export async function Sidebar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let rol = 'visor'
  if (user) {
    const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    if (perfil) rol = perfil.rol
  }

  const navigation = [
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Empleados', href: '/dashboard/empleados', icon: Users },
    { name: 'Vacaciones', href: '/dashboard/vacaciones', icon: CalendarDays },
  ]

  if (rol === 'admin') {
    navigation.push({ name: 'Asistencias', href: '/dashboard/asistencias', icon: Clock })
    navigation.push({ name: 'Estructura', href: '/dashboard/estructura', icon: Settings })
    navigation.push({ name: 'Usuarios', href: '/dashboard/usuarios', icon: UserCog })
  }

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r border-sys-border bg-sys-bg/50 backdrop-blur-xl">
      <div className="flex h-20 shrink-0 items-center justify-center border-b border-sys-border px-6">
        <Image 
          src="/logo.png" 
          alt="Nuestra Señora del Carmen" 
          width={110} 
          height={35} 
          className="object-contain"
          priority
        />
      </div>
      <nav className="flex flex-1 flex-col justify-between p-4">
        <ul className="flex flex-col gap-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sys-text-muted transition-colors hover:bg-white/5 hover:text-sys-text"
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        
        <form action="/auth/signout" method="post">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sys-text-muted transition-colors hover:bg-sys-danger/10 hover:text-sys-danger">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </form>
      </nav>
    </div>
  )
}
