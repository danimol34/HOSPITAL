-- Copia y pega esto en el SQL Editor de Supabase para crear la tabla de historial de permisos

CREATE TABLE public.permisos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL, -- 'vacaciones' o 'reposo'
    nombres VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL,
    fecha_solicitud DATE NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_culminacion DATE NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    datos JSONB NOT NULL -- Aquí guardaremos el resto de los campos de la planilla
);

-- Habilitar Row Level Security
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir inserción y lectura
CREATE POLICY "Permitir leer permisos a todos" ON public.permisos FOR SELECT USING (true);
CREATE POLICY "Permitir insertar permisos a todos" ON public.permisos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir actualizar permisos a todos" ON public.permisos FOR UPDATE USING (true);
CREATE POLICY "Permitir eliminar permisos a todos" ON public.permisos FOR DELETE USING (true);
