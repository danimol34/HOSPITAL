'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, LogOut, LayoutDashboard, Users, Clock, CalendarDays, Settings, UserCog } from 'lucide-react'

export function MobileNav({ rol }: { rol: string }) {
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="md:hidden">
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative z-10 rounded-lg p-2 text-sys-text-muted hover:bg-sys-primary-transparent hover:text-sys-primary transition-colors touch-manipulation"
      >
        <Menu size={24} className="pointer-events-none" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          <div className="relative flex w-64 max-w-xs flex-col bg-sys-panel p-6 shadow-2xl transition-transform border-r border-sys-border mr-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-sys-text-muted hover:bg-sys-primary-transparent hover:text-sys-primary"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-start justify-center mb-8 border-b border-sys-border pb-6 pt-4">
              <span className="font-bold text-sys-primary text-xl">H. CARMEN</span>
              <span className="text-sm text-sys-text-muted font-medium">Menú Principal</span>
            </div>

            <nav className="flex flex-1 flex-col justify-between">
              <ul className="flex flex-col gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                     <li key={item.name}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-sys-text-muted transition-colors hover:bg-sys-primary-transparent hover:text-sys-primary"
                      >
                        <Icon size={20} />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
              
              <form action="/auth/signout" method="post" className="mt-8 border-t border-sys-border pt-4">
                <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-sys-text-muted transition-colors hover:bg-sys-danger/10 hover:text-sys-danger">
                  <LogOut size={20} />
                  CERRAR SESIÓN
                </button>
              </form>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
