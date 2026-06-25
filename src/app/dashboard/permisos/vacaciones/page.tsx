'use client'

import { useState } from 'react'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import { savePermiso } from '../actions'

export default function VacacionesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    fecha_solicitud: '',
    nombres: '',
    cedula: '',
    cargo: '',
    codigo_cargo: '',
    fecha_ingreso_apn: '',
    fecha_ingreso_mpps: '',
    periodo_vacacional: '',
    dias_habiles: '',
    fecha_inicio: '',
    fecha_culminacion: '',
    fecha_reintegro: '',
    observacion: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess(false)

    try {
      // 1. Guardar en Base de Datos
      const dbResult = await savePermiso({
        tipo: 'vacaciones',
        nombres: form.nombres,
        cedula: form.cedula,
        fecha_solicitud: form.fecha_solicitud,
        fecha_inicio: form.fecha_inicio,
        fecha_culminacion: form.fecha_culminacion,
        datos: form
      })

      if (!dbResult.success) {
        throw new Error(dbResult.error || 'Error al guardar en la base de datos')
      }

      // 2. Generar el Documento Word
      const response = await fetch('/SOLICITUD DE VACACIONES.docx')
      if (!response.ok) throw new Error('No se pudo cargar la plantilla Word')
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true })

      // Setear los datos en la plantilla
      const [a_gen, m_gen, d_gen] = form.fecha_solicitud.split('-')
      doc.render({
        ...form,
        d_gen, m_gen, a_gen
      })

      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })

      // Descargar archivo
      saveAs(out, `Vacaciones_${form.cedula}_${form.fecha_solicitud}.docx`)
      
      setSuccess(true)
      // Opcional: limpiar formulario
      // setForm({ ...initialState })
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error desconocido al generar la planilla')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between rounded-2xl border border-sys-border bg-sys-panel/50 p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-sys-text">Generar Solicitud de Vacaciones</h1>
      </div>

      <div className="rounded-2xl border border-sys-border bg-sys-bg p-8 shadow-2xl">
        {success && (
          <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200">
            ¡Planilla generada y guardada en el historial con éxito! La descarga del documento de Word debería haber comenzado.
          </div>
        )}
        
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Fecha de Solicitud</label>
              <input required type="date" name="fecha_solicitud" value={form.fecha_solicitud} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Nombres y Apellidos</label>
              <input required type="text" name="nombres" value={form.nombres} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Cédula de Identidad</label>
              <input required type="text" name="cedula" value={form.cedula} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Cargo</label>
              <input type="text" name="cargo" value={form.cargo} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Código del Cargo</label>
              <input type="text" name="codigo_cargo" value={form.codigo_cargo} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Ingreso a la A.P.N.</label>
              <input type="date" name="fecha_ingreso_apn" value={form.fecha_ingreso_apn} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Ingreso al MPPS</label>
              <input type="date" name="fecha_ingreso_mpps" value={form.fecha_ingreso_mpps} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Período Vacacional</label>
              <input type="text" name="periodo_vacacional" value={form.periodo_vacacional} onChange={handleChange} placeholder="Ej: 2023-2024" className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Días Hábiles</label>
              <input type="number" name="dias_habiles" value={form.dias_habiles} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Fecha de Inicio</label>
              <input required type="date" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Fecha de Culminación</label>
              <input required type="date" name="fecha_culminacion" value={form.fecha_culminacion} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Fecha de Reintegro</label>
              <input required type="date" name="fecha_reintegro" value={form.fecha_reintegro} onChange={handleChange} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none" />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-sys-text-muted uppercase">Observación</label>
              <textarea name="observacion" value={form.observacion} onChange={handleChange} rows={3} className="rounded-xl border border-sys-border bg-sys-panel px-4 py-2 text-sm focus:border-sys-primary focus:outline-none"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-sys-border">
            <button type="submit" disabled={isLoading} className="rounded-xl bg-sys-primary px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {isLoading ? 'Generando...' : 'Guardar y Descargar Word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
