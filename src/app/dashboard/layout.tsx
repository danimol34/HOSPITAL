import { TopNavbar } from '@/components/TopNavbar'
import { Sidebar } from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let rol = 'visor'
  
  if (user) {
    const { data } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
    if (data) {
      rol = data.rol
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-[#f8fbff] to-[#e6f0fa]">
      <Sidebar rol={rol} />
      <div className="flex flex-col flex-1 min-w-0 h-screen">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
