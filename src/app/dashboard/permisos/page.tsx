import Link from 'next/link'
import { CalendarDays, Stethoscope, FileText, Plus, Trash2 } from 'lucide-react'
import { getPermisos, deletePermiso } from './actions'

export const dynamic = 'force-dynamic'

function formatDate(dateString: string) {
  if (!dateString) return '--/--/----'
  return new Date(dateString).toLocaleDateString('es-VE')
}

export default async function PermisosPage() {
  const { data: permisos, success, error } = await getPermisos()

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Cabecera con Botones de Acción */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-sys-border bg-sys-panel/50 p-6 shadow-xl">
        <div>
          <h1 className="text-2xl font-bold text-sys-text">Gestión de Permisos</h1>
          <p className="text-sm text-sys-text-muted mt-1">Historial de solicitudes y generación de planillas</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/dashboard/permisos/vacaciones" 
            className="flex items-center gap-2 rounded-xl bg-sys-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
          >
            <CalendarDays size={18} />
            Permiso de Vacaciones
          </Link>
          <Link 
            href="/dashboard/permisos/reposos" 
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Stethoscope size={18} />
            Permiso de Reposo
          </Link>
        </div>
      </div>

      {/* Historial de Permisos */}
      <div className="rounded-2xl border border-sys-border bg-sys-panel/50 shadow-xl overflow-hidden">
        <div className="p-5 border-b border-sys-border bg-sys-panel-hover flex items-center gap-2">
          <FileText size={20} className="text-sys-text-muted" />
          <h2 className="text-lg font-bold text-sys-text">Historial de Planillas Generadas</h2>
        </div>

        {error ? (
          <div className="p-6 text-sys-danger text-sm font-medium">Error al cargar el historial: {error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-sys-text-muted whitespace-nowrap">
              <thead className="border-b border-sys-border bg-sys-panel-hover text-xs uppercase text-sys-text-muted font-bold">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha Emisión</th>
                  <th className="px-6 py-4 font-medium">Trabajador</th>
                  <th className="px-6 py-4 font-medium">Cédula</th>
                  <th className="px-6 py-4 font-medium">Tipo de Permiso</th>
                  <th className="px-6 py-4 font-medium">Período del Permiso</th>
                  <th className="px-6 py-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {permisos.map((p: any) => (
                  <tr key={p.id} className="border-b border-sys-border transition-colors hover:bg-sys-panel-hover">
                    <td className="px-6 py-4 font-medium text-sys-text">
                      {formatDate(p.creado_en)}
                    </td>
                    <td className="px-6 py-4 font-medium text-sys-text">
                      {p.nombres}
                    </td>
                    <td className="px-6 py-4">
                      V-{p.cedula}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.tipo === 'vacaciones' 
                          ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}>
                        {p.tipo === 'vacaciones' ? <CalendarDays size={14} /> : <Stethoscope size={14} />}
                        {p.tipo === 'vacaciones' ? 'VACACIONES' : 'REPOSO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      Desde: {formatDate(p.fecha_inicio)}<br/>
                      Hasta: {formatDate(p.fecha_culminacion)}
                    </td>
                    <td className="px-6 py-4">
                      <form action={deletePermiso}>
                        <input type="hidden" name="id" value={p.id} />
                        <button 
                          type="submit" 
                          className="p-2 rounded-lg text-sys-text-muted hover:bg-red-50 hover:text-sys-danger transition-colors"
                          title="Eliminar historial"
                        >
                          <Trash2 size={18} />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {permisos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sys-text-muted">
                      <div className="flex flex-col items-center gap-2">
                        <FileText size={32} className="text-sys-border" />
                        <span className="font-semibold text-sm">No se han generado planillas aún.</span>
                        <span className="text-xs">Usa los botones superiores para crear una nueva solicitud.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
