'use client'

import { useState } from 'react'
import { HelpCircle, Users, CalendarDays, Clock, FileText, UserCog, Settings, ChevronLeft, Download, Play, Image as ImageIcon, CheckCircle2 } from 'lucide-react'

type ModuleContent = {
  id: string
  title: string
  icon: any
  color: string
  description: string
  steps: string[]
  videoUrl?: string
  imageUrl?: string
}

const modules: ModuleContent[] = [
  {
    id: 'inicio',
    title: 'Inicio (Dashboard)',
    icon: FileText,
    color: 'text-sys-primary bg-sys-primary/10',
    description: 'Aprende a interpretar la pantalla principal y las estadísticas de tu hospital.',
    steps: [
      'Ingrese a la sección "Inicio" desde el menú de navegación lateral.',
      'En la parte superior, visualice el total de empleados activos y la estructura actual.',
      'Revise el panel de "Próximas Vacaciones" para anticipar ausencias en los siguientes días.',
      'Use los accesos rápidos para ir directamente a la gestión de empleados o estructura.'
    ],
    videoUrl: 'https://www.youtube.com/embed/SmhM33Axbho',
    imageUrl: '/tutorial-inicio.png'
  },
  {
    id: 'empleados',
    title: 'Empleados',
    icon: Users,
    color: 'text-emerald-600 bg-emerald-500/10',
    description: 'Descubre cómo registrar, editar y gestionar al personal del hospital.',
    steps: [
      'Ingrese a la sección "Empleados" desde el menú lateral.',
      'Haga clic en el botón superior azul "+ Nuevo Empleado".',
      'Complete los campos del formulario organizados por pestañas (Datos Personales, Laborales y Académicos).',
      'Presione el botón "Guardar" al final del formulario.',
      'Para editar o ver el perfil detallado, haga clic en el nombre de cualquier empleado en la tabla.',
      'Utilice el buscador superior para encontrar a un trabajador rápidamente por nombre o cédula.'
    ],
    videoUrl: 'https://www.youtube.com/embed/0vI54ydmCBA',
    imageUrl: '/tutorial-empleados.png'
  },
  {
    id: 'vacaciones',
    title: 'Vacaciones',
    icon: CalendarDays,
    color: 'text-amber-600 bg-amber-500/10',
    description: 'Controla los períodos vacacionales del personal y genera constancias.',
    steps: [
      'Ingrese a la sección "Vacaciones".',
      'Haga clic en "+ Registrar Vacaciones" y busque al empleado por cédula.',
      'Seleccione las fechas de inicio y culminación del período vacacional.',
      'Verifique que el estado inicial de la solicitud sea "Pendiente".',
      'Una vez guardado, use el botón de "Imprimir Constancia" (ícono de PDF) para generar el comprobante firmado.',
      'Cambie el estado a "Aprobada" o "En Curso" según corresponda usando las acciones de la tabla.'
    ]
  },
  {
    id: 'asistencias',
    title: 'Asistencias',
    icon: Clock,
    color: 'text-blue-600 bg-blue-500/10',
    description: 'Registra la asistencia diaria, inasistencias y reposos del personal.',
    steps: [
      'Acceda al módulo "Asistencias" (exclusivo para administradores).',
      'Seleccione la fecha y el departamento que desea evaluar.',
      'Para cada empleado, marque el estado correspondiente: Asistió, Faltó, Permiso o Reposo.',
      'Añada una observación opcional si el empleado llegó tarde o tiene justificación.',
      'Presione "Guardar Asistencia" para registrar el día.',
      'Use la pestaña de Reportes para exportar la nómina quincenal.'
    ]
  },
  {
    id: 'estructura',
    title: 'Estructura Organizativa',
    icon: Settings,
    color: 'text-purple-600 bg-purple-500/10',
    description: 'Define y gestiona los diferentes departamentos y servicios del hospital.',
    steps: [
      'Diríjase a "Estructura" en el menú lateral.',
      'Para crear un área principal, use el formulario superior de "Gestión de Divisiones" y presione "+ Crear".',
      'Haga clic en cualquier División (Ej: Servicios Hospitalarios) para ver sus departamentos internos.',
      'Dentro de la división, añada los departamentos específicos (Ej: Emergencia, Quirófano).',
      'Revise los "Badges" de la tarjeta para conocer instantáneamente la distribución del personal por cargo.',
      'Utilice los íconos de Lápiz y Papelera para editar o eliminar áreas (tenga cuidado, eliminar un departamento afecta a sus empleados).'
    ]
  },
  {
    id: 'usuarios',
    title: 'Usuarios del Sistema',
    icon: UserCog,
    color: 'text-rose-600 bg-rose-500/10',
    description: 'Gestiona quiénes tienen acceso al sistema y define sus roles.',
    steps: [
      'Entre a la sección "Usuarios".',
      'Presione "+ Crear Cuenta" para agregar un nuevo usuario.',
      'Asigne un Nombre, Correo Electrónico y una Contraseña segura.',
      'Seleccione el Nivel de Acceso: Administrador (acceso total) o Visor (solo lectura).',
      'Haga clic en "Guardar". Nota: Por seguridad, la eliminación de cuentas maestras está restringida, pero puede deshabilitar sus accesos.'
    ]
  }
]

export default function AyudaClient() {
  const [selectedModule, setSelectedModule] = useState<ModuleContent | null>(null)

  return (
    <div className="flex flex-col gap-8">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between rounded-2xl border border-sys-border bg-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <HelpCircle size={32} className="text-sys-primary" />
            <h1 className="text-2xl font-bold text-sys-text">Manual de Usuario</h1>
          </div>
          <p className="text-sys-text-muted max-w-2xl mt-1">
            {selectedModule 
              ? `Estás viendo la guía detallada para el módulo: ${selectedModule.title}`
              : 'Seleccione un módulo a continuación para aprender a utilizarlo paso a paso mediante guías visuales y videotutoriales.'}
          </p>
        </div>
        
        <button 
          className="flex shrink-0 items-center gap-2 rounded-xl bg-sys-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-sys-primary-hover transition-colors"
          onClick={() => alert("Función simulada: Iniciando descarga del Manual Completo en PDF...")}
        >
          <Download size={18} /> Descargar Manual PDF
        </button>
      </div>

      {/* Navegación Dinámica */}
      {!selectedModule ? (
        // VISTA 1: Cuadrícula de Selección
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setSelectedModule(mod)}
              className="group flex flex-col items-start rounded-2xl border border-sys-border bg-white p-6 shadow-sm transition-all hover:border-sys-primary/50 hover:shadow-lg text-left relative overflow-hidden"
            >
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`p-2.5 rounded-xl ${mod.color} transition-transform group-hover:scale-110`}>
                  <mod.icon size={26} />
                </div>
                <h2 className="text-lg font-bold text-sys-text group-hover:text-sys-primary transition-colors">{mod.title}</h2>
              </div>
              <p className="text-sm text-sys-text-muted leading-relaxed relative z-10">
                {mod.description}
              </p>
              
              <div className="mt-6 flex items-center gap-1 text-sm font-semibold text-sys-primary opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                Ver paso a paso <ChevronLeft size={16} className="rotate-180" />
              </div>
            </button>
          ))}
        </div>
      ) : (
        // VISTA 2: Detalle del Módulo (Interactivo)
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <button 
            onClick={() => setSelectedModule(null)}
            className="flex w-fit items-center gap-2 rounded-xl bg-white border border-sys-border px-4 py-2 text-sm font-bold text-sys-text-muted hover:bg-gray-50 hover:text-sys-text transition-colors"
          >
            <ChevronLeft size={18} /> Volver al índice
          </button>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Columna Izquierda: Instrucciones Paso a Paso */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm h-full">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-sys-border">
                  <div className={`p-2 rounded-lg ${selectedModule.color}`}>
                    <selectedModule.icon size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-sys-text">{selectedModule.title}</h2>
                </div>
                
                <h3 className="text-sm font-bold text-sys-text uppercase tracking-wider mb-4">Guía Paso a Paso</h3>
                <div className="flex flex-col gap-5">
                  {selectedModule.steps.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-sys-primary/10 text-sys-primary font-bold text-sm border border-sys-primary/20">
                        {idx + 1}
                      </div>
                      <p className="text-sm text-sys-text-muted leading-relaxed pt-1.5">
                        {step}
                      </p>
                    </div>
                  ))}
                  
                  <div className="mt-4 flex gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <div className="text-emerald-500 shrink-0"><CheckCircle2 size={24} /></div>
                    <p className="text-sm font-medium text-emerald-800">¡Listo! Siguiendo estos pasos habrás completado la tarea en este módulo.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Apoyo Visual Multimedia */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Video Tutorial (Real o Placeholder) */}
              <div className="rounded-2xl border border-sys-border bg-white overflow-hidden shadow-sm">
                <div className="p-4 border-b border-sys-border bg-gray-50/50">
                  <h3 className="text-sm font-bold text-sys-text flex items-center gap-2">
                    <Play size={16} className="text-red-500 fill-red-500" /> Video Tutorial
                  </h3>
                </div>
                
                {selectedModule.videoUrl ? (
                  <div className="relative aspect-video w-full bg-black">
                    <iframe 
                      className="absolute inset-0 w-full h-full" 
                      src={selectedModule.videoUrl} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div 
                    className="relative aspect-video bg-gray-900 group cursor-pointer flex items-center justify-center"
                    onClick={() => alert("Función simulada: El reproductor de video se abrirá aquí próximamente.")}
                  >
                    <div className="absolute inset-0 bg-sys-primary/20 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-600/90 text-white shadow-xl group-hover:scale-110 transition-transform">
                        <Play size={32} className="ml-1" fill="currentColor" />
                      </div>
                      <span className="font-bold text-white text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Ver Video (Próximamente)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Captura de Pantalla (Real o Placeholder) */}
              <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-sys-text flex items-center gap-2">
                    <ImageIcon size={16} className="text-sys-primary" /> Interfaz de Referencia
                  </h3>
                  <span className="text-xs font-semibold text-sys-text-muted bg-gray-100 px-2 py-1 rounded">Captura</span>
                </div>
                
                {selectedModule.imageUrl ? (
                  <div className="w-full rounded-xl border border-sys-border overflow-hidden bg-gray-50">
                    <img 
                      src={selectedModule.imageUrl} 
                      alt={`Captura de interfaz para ${selectedModule.title}`} 
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="aspect-[16/9] w-full rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
                    onClick={() => alert("Función simulada: Al hacer clic aquí se abriría la captura en pantalla completa.")}
                  >
                    <div className="absolute top-4 left-4 right-4 h-8 bg-white border border-gray-200 rounded flex items-center px-2 gap-2 shadow-sm">
                      <div className="h-3 w-3 rounded-full bg-red-400"></div>
                      <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                      <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                      <div className="h-2 w-32 bg-gray-200 rounded ml-4"></div>
                    </div>
                    
                    <ImageIcon size={48} className="text-gray-300 mb-4" />
                    <p className="text-sm font-bold text-gray-400">Espacio para Captura Explicativa</p>
                    <p className="text-xs text-gray-400 text-center mt-2 max-w-sm">
                      Aquí se insertará una imagen real de la interfaz de {selectedModule.title} indicando con flechas dónde hacer clic.
                    </p>
                    
                    {/* Mock Pointer */}
                    <div className="absolute bottom-1/4 right-1/3 flex flex-col items-center animate-bounce">
                      <div className="bg-sys-primary text-white text-xs font-bold px-2 py-1 rounded shadow-lg mb-1 relative">
                        Haz clic aquí
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-sys-primary rotate-45"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
