<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Proyecto e-mstore V2.0 — Reglas y Convenciones

### Stack
- Next.js 16.2.6 (App Router, proxy.ts NO middleware.ts)
- React 19.2.4
- TypeScript 5+
- Tailwind CSS v4
- shadcn/ui v4 (componentes en src/components/ui/)
- Supabase (PostgreSQL + Auth + RLS + Storage)
- Zustand 5 (state management)
- Zod 4 (validación)
- lucide-react (iconos)
- Sonner (toasts)

### Supabase
- Proyecto: `dcfoecfeujhoknuganhc`
- Admin: `admin@emstore.bo` / `Admin123456`
- Dashboard: https://supabase.com/dashboard/project/dcfoecfeujhoknuganhc
- Migraciones SQL en: `supabase/migrations/`
- **IMPORTANTE**: Las migraciones se ejecutan manualmente en SQL Editor del Dashboard

### Convenciones de Código
1. **TypeScript estricto**: No usar `any` — definir tipos explícitos
2. **React 19 patterns**: No usar `setState` dentro de `useEffect` — usar "adjust state while rendering"
3. **Supabase SSR**: Usar `createServerClient` de `@supabase/ssr` para server-side
4. **Supabase Browser**: Usar `createBrowserClient` de `@supabase/ssr` para client-side
5. **Supabase Admin**: Usar `createClient` de `@supabase/supabase-js` con service_role key (solo para operaciones admin)
6. **Zod**: Usar `safeParse` para validación, nunca `parse` directo
7. **Zustand**: Crear stores con `create<State>()((set) => ({...}))`
8. **Hooks**: Si una función no usa hooks de React, no empezar con `use` — renombrar a `*-utils.ts`
9. **Imports**: Eliminar todos los imports no usados
10. **Error handling**: Usar `translateAuthError` para errores de Supabase

### Archivos Importantes
- `src/proxy.ts` — Reemplaza middleware.ts (Next.js 16)
- `src/lib/supabase/client.ts` — Browser client
- `src/lib/supabase/server.ts` — Server client (async cookies)
- `src/lib/supabase/admin.ts` — Admin client (service_role)
- `src/lib/supabase/middleware.ts` — Session update logic
- `src/lib/validations/auth.ts` — Auth schemas (login, register, profile)
- `src/lib/validations/product.ts` — Product/category/banner schemas
- `src/types/index.ts` — TypeScript interfaces
- `src/hooks/` — Zustand stores y custom hooks
- `src/components/ui/` — shadcn/ui components

### SQL Migrations Status
- `00001_schema.sql` — **EJECUTADO** (esquema completo + RLS + triggers)
- `00002_fix_rls_app_metadata.sql` — **EJECUTADO** (migración user_metadata → app_metadata)
- `00003_status_afiliados` — **EJECUTADO** (campo status para afiliados)
- `00005_fix_codigo_afiliado_trigger` — **EJECUTADO** (columna codigo_afiliado + trigger)
- `00006_rls_affiliate_links_insert` — **EJECUTADO** (policy INSERT para afiliados)
- `00007_short_code_affiliates` — **EJECUTADO** (código corto + mensaje WhatsApp)
- `00009_fix_rls_products` — **EJECUTADO** (TO public → TO anon)

### Next.js 16 Breaking Changes (relevantes)
1. **proxy.ts**: Reemplaza middleware.ts — edge runtime NO soportado
2. **Async Request APIs**: `searchParams`, `params`, `cookies`, `headers` son async
3. **Turbopack by default**: Ya no necesita `--turbopack` flag
4. **revalidateTag**: Requiere segundo argumento `cacheLife`
5. **next/image**: `images.domains` deprecado, usar `images.remotePatterns`

### Errores Conocidos (pendientes de fix)
1. `src/lib/supabase/admin.ts` — Usar `@supabase/ssr` en vez de `@supabase/supabase-js` (baja prioridad, funciona correctamente)

---

## Skill: Consulta Context7 — Documentación Actualizada

### Cuándo Consultar Context7
**SIEMPRE** consultar Context7 cuando:
1. **Errores críticos** — Cualquier error de ESLint, TypeScript o build fallido
2. **Corrección de bugs** — Antes de implementar un fix, verificar la mejor práctica actual
3. **Nuevas funcionalidades** — Antes de crear componentes, hooks o routes
4. **Migraciones de código** — Cuando se cambia de un patrón a otro (ej: window.location → router.push)
5. **Configuración de librerías** — Supabase, Next.js, React, Zustand, Zod, etc.

### Cómo Consultar Context7
```
1. resolve-library-id → Nombre de la librería
2. query-docs → Pregunta específica sobre el problema
3. Aplicar la solución documentada
```

### Librerías del Proyecto (IDs de Context7)
- **Next.js**: `/vercel/next.js` (v16.x)
- **Supabase**: `/supabase/supabase`
- **Supabase SSR**: `/supabase/ssr`
- **Supabase Auth**: `/supabase/auth`
- **React**: Para patrones de componentes

### Ejemplo de Flujo
```
Usuario: "El login no funciona después del registro"
→ Consultar Context7: Supabase Auth + handle_new_user trigger
→ Documentación: usar NEW.raw_user_meta_data->>'field' para guardar campos custom
→ Implementar fix
→ Guardar en Engram
```

### Regla de Oro
**NUNCA** implementar un fix sin antes consultar Context7. La documentación actualizada siempre es mejor que el conocimiento de entrenamiento.

---

## Skill: Gestión SQL con Tres Archivos

### Configuración de Archivos
- `supabase/sql/esquema.sql` — Estado actual de la BD (se actualiza después de ejecutar)
- `supabase/sql/migraciones.sql` — Historial de migraciones ejecutadas
- `supabase/sql/ejecucion.sql` — Cambios pendientes de ejecutar

### Flujo de Trabajo

#### 1. Al abrir el proyecto
- Leer `ejecucion.sql`
- Buscar línea `-- ESTADO:`
- Si no existe → escribir `-- ESTADO: PENDIENTE` al inicio
- Si dice "PENDIENTE" → mostrar notificación "⚠️ Hay cambios pendientes en ejecucion.sql"
- Si dice "EJECUTADO" → mostrar "✅ No hay cambios pendientes"

#### 2. Al guardar cambios en ejecucion.sql
- Si estado == "EJECUTADO" y el contenido SQL ha cambiado:
  - Cambiar estado a "PENDIENTE"
  - Guardar archivo con nuevo estado
  - Mostrar "🔄 Nuevo SQL detectado. Estado cambiado a PENDIENTE."

#### 3. Ejecutar SQL pendiente (comando manual)
- Leer `ejecucion.sql`
- Si estado != "PENDIENTE" → mostrar "❌ No hay cambios pendientes"
- Si estado == "PENDIENTE":
  - Conectar a la BD (usar configuración del proyecto)
  - Ejecutar el contenido SQL (excluyendo la línea de estado)
  - Si éxito:
    - Cambiar estado a "EJECUTADO"
    - Mostrar "✅ SQL ejecutado correctamente"
    - Actualizar `esquema.sql` y `migraciones.sql`
  - Si error:
    - Mostrar error y mantener estado como PENDIENTE

#### 4. Prevenir escritura si hay pendiente
- Si estado == "PENDIENTE" y el contenido nuevo es diferente:
  - Mostrar advertencia "🚫 No puedes escribir nuevos cambios hasta ejecutar el pendiente"
  - Cancelar guardado (opcional: forzar con confirmación)

### Comandos Útiles
```sql
-- Ver estado actual
SELECT * FROM _migration_tracking ORDER BY id;

-- Ver migraciones pendientes
SELECT * FROM _migration_tracking WHERE estado = 'pendiente';

-- Marcar migración como ejecutada
UPDATE _migration_tracking SET estado = 'ejecutado', fecha_ejecucion = NOW() WHERE migration_name = 'nombre_migracion';

-- Agregar nueva migración
INSERT INTO _migration_tracking (migration_name, descripcion, estado) VALUES ('00003_nombre', 'Descripción', 'pendiente');
```
