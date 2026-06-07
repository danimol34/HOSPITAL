'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Clock, CalendarDays, Settings, UserCog, LogOut } from 'lucide-react'

export function TopNavLinks({ rol }: { rol: string }) {
  const pathname = usePathname()

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
    <ul className="flex items-center gap-8 h-full">
      {navigation.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
        
        return (
          <li key={item.name} className="h-full">
            <Link
              href={item.href}
              className={`flex items-center gap-2 h-full px-2 text-sm font-bold transition-colors border-b-2 
                ${isActive 
                  ? 'text-sys-primary border-sys-primary' 
                  : 'text-sys-text-muted border-transparent hover:text-sys-primary hover:border-sys-primary-transparent'
                }`}
            >
              <item.icon size={16} />
              {item.name}
            </Link>
          </li>
        )
      })}
      <li className="ml-auto h-full">
        <form action="/auth/signout" method="post" className="h-full">
          <button className="flex items-center gap-2 h-full px-2 text-sm font-bold text-sys-text-muted transition-colors hover:text-sys-danger border-b-2 border-transparent hover:border-sys-danger">
            <LogOut size={16} />
            CERRAR SESIÓN
          </button>
        </form>
      </li>
    </ul>
  )
}
