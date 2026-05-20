import { Sidebar } from '@/components/Sidebar'
import { Topbar } from '@/components/Topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#09090b]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-x-auto scrollbar-custom">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
