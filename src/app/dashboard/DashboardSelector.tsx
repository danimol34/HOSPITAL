'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Settings2 } from 'lucide-react'

export default function DashboardSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentDays = searchParams.get('days') || '5'

  const handleChange = (days: string) => {
    router.push(`/dashboard?days=${days}`)
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-sys-border bg-sys-panel/50 px-4 py-2 shadow-lg">
      <div className="flex items-center gap-2 text-sys-text-muted">
        <Settings2 size={16} />
        <span className="text-xs font-medium uppercase tracking-wider">Ver próximos:</span>
      </div>
      <select 
        value={currentDays}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-transparent text-sm font-bold text-sys-primary outline-none cursor-pointer hover:text-sys-primary-hover"
      >
        <option value="5" className="bg-sys-panel text-sys-text">5 días</option>
        <option value="15" className="bg-sys-panel text-sys-text">15 días</option>
        <option value="30" className="bg-sys-panel text-sys-text">30 días</option>
        <option value="60" className="bg-sys-panel text-sys-text">60 días</option>
        <option value="90" className="bg-sys-panel text-sys-text">90 días</option>
        <option value="180" className="bg-sys-panel text-sys-text">6 meses</option>
        <option value="365" className="bg-sys-panel text-sys-text">1 año</option>
      </select>
    </div>
  )
}



