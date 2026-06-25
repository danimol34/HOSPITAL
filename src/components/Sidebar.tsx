'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Clock, CalendarDays, Settings, UserCog, LogOut, HelpCircle } from 'lucide-react'

export function Sidebar({ rol }: { rol: string }) {
  const pathname = usePathname()

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
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-sys-border bg-white sticky top-0 shrink-0">
      {/* Logos */}
      <div className="flex items-center justify-between p-4 border-b border-sys-border h-20">
        <img src="/ministerio.png" alt="Ministerio" className="h-12 w-1/2 object-contain" />
        <img src="/salud.png" alt="Salud" className="h-12 w-1/2 object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-sys-primary' 
                  : 'text-sys-text-muted hover:bg-gray-50 hover:text-sys-text'
                }`}
            >
              <item.icon size={20} className={isActive ? 'text-sys-primary' : 'text-sys-text-muted'} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Ayuda / Cerrar Sesión */}
      <div className="p-4 border-t border-sys-border flex flex-col gap-4">
        <div className="rounded-xl border border-sys-border p-4 bg-gray-50/50">
          <h4 className="text-sm font-bold text-sys-text mb-1">¿Necesitas ayuda?</h4>
          <p className="text-xs text-sys-text-muted mb-3">Consulta nuestras guías o contacta soporte.</p>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-sys-border bg-white px-3 py-2 text-xs font-semibold text-sys-text hover:bg-gray-50">
            Ir a ayuda
            <HelpCircle size={14} />
          </button>
        </div>

        <form action="/auth/signout" method="post">
          <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-sys-text-muted hover:bg-red-50 hover:text-sys-danger transition-colors">
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </form>
      </div>
    </aside>
  )
}
