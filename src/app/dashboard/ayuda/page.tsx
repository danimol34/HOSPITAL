import { HelpCircle, Users, CalendarDays, Clock, FileText, UserCog, Settings } from 'lucide-react'

export default function AyudaPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <HelpCircle size={32} className="text-sys-primary" />
          <h1 className="text-2xl font-bold text-sys-text">Manual de Usuario</h1>
        </div>
        <p className="text-sys-text-muted">
          Bienvenido a la sección de ayuda del Sistema Administrativo de Recursos Humanos. 
          A continuación, te explicamos cómo utilizar cada uno de los módulos del sistema.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inicio */}
        <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-sys-primary/10 p-2 rounded-lg text-sys-primary">
              <FileText size={24} />
            </div>
            <h2 className="text-lg font-bold text-sys-text">Inicio (Dashboard)</h2>
          </div>
          <p className="text-sm text-sys-text-muted leading-relaxed">
            Es la pantalla principal del sistema. Aquí puedes ver un resumen rápido y estadísticas generales, como el número total de empleados activos y un vistazo a las vacaciones que están por iniciar o finalizar en los próximos días.
          </p>
        </div>

        {/* Empleados */}
        <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-600">
              <Users size={24} />
            </div>
            <h2 className="text-lg font-bold text-sys-text">Empleados</h2>
          </div>
          <p className="text-sm text-sys-text-muted leading-relaxed">
            En este módulo puedes ver la lista completa del personal. Puedes registrar nuevos empleados haciendo clic en el botón "Nuevo Empleado". Para ver los detalles completos de un trabajador (datos personales, laborales y académicos), simplemente haz clic sobre su nombre en la tabla. También puedes editar su información o eliminarlo si es necesario.
          </p>
        </div>

        {/* Vacaciones */}
        <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-amber-500/10 p-2 rounded-lg text-amber-600">
              <CalendarDays size={24} />
            </div>
            <h2 className="text-lg font-bold text-sys-text">Vacaciones</h2>
          </div>
          <p className="text-sm text-sys-text-muted leading-relaxed">
            Controla los períodos vacacionales del personal. Puedes registrar nuevas solicitudes de vacaciones, visualizar el estado (pendientes, aprobadas, en curso, finalizadas) y generar la constancia de vacaciones en formato PDF lista para imprimir y firmar.
          </p>
        </div>

        {/* Asistencias */}
        <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-600">
              <Clock size={24} />
            </div>
            <h2 className="text-lg font-bold text-sys-text">Asistencias</h2>
          </div>
          <p className="text-sm text-sys-text-muted leading-relaxed">
            (Exclusivo para Administradores). Permite llevar el control diario de las asistencias, inasistencias y permisos de los empleados. Puedes registrar la asistencia diaria y generar reportes para el control de nómina.
          </p>
        </div>

        {/* Estructura */}
        <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-600">
              <Settings size={24} />
            </div>
            <h2 className="text-lg font-bold text-sys-text">Estructura Organizativa</h2>
          </div>
          <p className="text-sm text-sys-text-muted leading-relaxed">
            (Exclusivo para Administradores). Aquí puedes definir y gestionar los diferentes departamentos, coordinaciones y servicios que componen el hospital. Es fundamental mantener esta estructura actualizada para poder asignar correctamente a los empleados.
          </p>
        </div>

        {/* Usuarios */}
        <div className="rounded-2xl border border-sys-border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-rose-500/10 p-2 rounded-lg text-rose-600">
              <UserCog size={24} />
            </div>
            <h2 className="text-lg font-bold text-sys-text">Usuarios del Sistema</h2>
          </div>
          <p className="text-sm text-sys-text-muted leading-relaxed">
            (Exclusivo para Administradores). Gestiona quiénes tienen acceso al sistema informático. Puedes crear cuentas nuevas, asignarles el rol de Administrador (acceso total) o Visor (solo lectura), y revisar sus datos de acceso. Nota: Por seguridad, la opción de eliminar usuarios ha sido desactivada.
          </p>
        </div>
      </div>
    </div>
  )
}
