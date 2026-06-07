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
    .select('*, servicios(nombre), empleados(id)')
    .order('created_at', { ascending: true })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-sys-text">Estructura del Hospital</h1>
        <p className="text-sm text-sys-text-muted">Gestiona las divisiones y departamentos.</p>
      </div>
      
      <EstructuraClient 
        initialServicios={servicios || []} 
        initialDepartamentos={departamentos || []} 
      />
    </div>
  )
}



