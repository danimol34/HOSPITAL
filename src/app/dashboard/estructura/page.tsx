import { createClient } from '@/utils/supabase/server'
import EstructuraClient from './EstructuraClient'

export default async function EstructuraPage() {
  const supabase = await createClient()

  // Fetch initial data
  const { data: servicios } = await supabase
    .from('servicios')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: departamentos } = await supabase
    .from('departamentos')
    .select('*, servicios(nombre), empleados(id, cargo_nominal)')
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sys-panel to-blue-50/50 border border-sys-border">
        <div className="relative z-10 p-8 md:w-2/3">
          <h1 className="text-2xl font-bold text-sys-text">Estructura del Hospital</h1>
          <p className="text-sm text-sys-text-muted mt-2">Gestiona las divisiones y departamentos.</p>
        </div>
        
        {/* Hospital Illustration SVG */}
        <div className="absolute right-0 bottom-0 z-0 hidden md:block">
          <svg width="250" height="140" viewBox="0 0 250 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="translate-y-2 opacity-90">
            {/* Background Trees */}
            <circle cx="30" cy="120" r="20" fill="#D1FAE5" />
            <circle cx="50" cy="110" r="25" fill="#A7F3D0" />
            <circle cx="210" cy="115" r="18" fill="#D1FAE5" />
            <circle cx="230" cy="125" r="15" fill="#A7F3D0" />
            
            {/* Background Building */}
            <path d="M50 140H220V60C220 54.4772 215.523 50 210 50H60C54.4772 50 50 54.4772 50 60V140Z" fill="#EFF6FF" />
            
            {/* Main Building */}
            <path d="M90 140H180V30C180 24.4772 175.523 20 170 20H100C94.4772 20 90 24.4772 90 30V140Z" fill="#DBEAFE" />
            
            {/* Cross */}
            <path d="M125 45H145M135 35V55" stroke="#3B82F6" strokeWidth="6" strokeLinecap="round" />
            
            {/* Windows */}
            <rect x="65" y="70" width="15" height="15" rx="3" fill="#BFDBFE" />
            <rect x="65" y="100" width="15" height="15" rx="3" fill="#BFDBFE" />
            <rect x="190" y="70" width="15" height="15" rx="3" fill="#BFDBFE" />
            <rect x="190" y="100" width="15" height="15" rx="3" fill="#BFDBFE" />
            
            <rect x="105" y="70" width="20" height="15" rx="3" fill="#BFDBFE" />
            <rect x="145" y="70" width="20" height="15" rx="3" fill="#BFDBFE" />
            
            {/* Door */}
            <path d="M120 140V110C120 104.477 124.477 100 130 100C135.523 100 140 104.477 140 110V140" fill="#60A5FA" />
            
            {/* Ground Line */}
            <path d="M0 140H250" stroke="#BFDBFE" strokeWidth="2" />
          </svg>
        </div>
      </div>
      
      <EstructuraClient 
        initialServicios={servicios || []} 
        initialDepartamentos={departamentos || []} 
      />
    </div>
  )
}



