---
name: e-mstore-v2-rules
description: Reglas, restricciones y convenciones del proyecto E-M Store V2.0
---

# E-M Store V2.0 — Project Rules & Constraints

## Stack obligatorio

- **Framework:** Next.js 16 App Router (AGENTS.md: tiene breaking changes, leer `node_modules/next/dist/docs/`)
- **Lenguaje:** TypeScript estricto
- **UI:** Tailwind CSS v4 + shadcn/ui v4 (base-nova style) + @base-ui/react
- **Iconos:** lucide-react
- **Backend/DB:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Estado cliente:** Zustand (solo para UI state, ej. buy modal)
- **Validaciones:** Zod v4
- **Notificaciones:** Sonner
- **Fuente:** Roboto via next/font

## Arquitectura

- **Server Components por defecto.** Solo usar `'use client'` cuando sea estrictamente necesario (interactividad, hooks, eventos)
- **Data fetching en Server Components** directamente con Supabase, no en client
- **API routes** (`app/api/`) solo para operaciones que necesitan ser POST desde client (ej. crear orden)
- **Alias `@/`** mapea a `src/`

## Convenciones de código

- Nombres de archivos: `kebab-case.ts` para páginas, `camel-case.ts` para componentes
- Interfaces de tipos en `@/types/index.ts`
- Esquemas Zod en `@/lib/validations/`
- Utilidades en `@/lib/utils.ts`
- Hooks en `@/hooks/`
- Componentes shadcn en `@/components/ui/`
- Componentes store en `@/components/store/`
- Componentes admin en `@/components/admin/`
- Componentes afiliado en `@/components/affiliate/`

## Variables de entorno requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon key pública)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key, NUNCA en cliente)
ADMIN_WHATSAPP_FALLBACK=591XXXXXXXXX
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Seguridad (NO ROMPER)

1. **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) SOLO se usa en `@/lib/supabase/admin.ts` — nunca en cliente ni en Server Components que renderizan para el usuario
2. **RLS obligatorio** en todas las tablas — la anon key no debería poder acceder a datos que no sean públicos
3. **Zod en todos los inputs** — login, registro, productos, categorías, banners, perfil, ordenes
4. **Middleware** protege `/admin` (solo rol admin) y `/affiliate` (rol afiliado o admin). Redirige a `/auth/login` si no hay sesión
5. **No hardcodear credenciales** — siempre variables de entorno
6. **Función `handle_new_user`** debe tener `SET search_path = ''` y `REVOKE EXECUTE FROM public, anon, authenticated` para evitar que roles no autorizados la ejecuten vía REST
7. **Extensiones** nunca en schema `public` — usar schema `extensions` (ej. `CREATE EXTENSION pg_trgm WITH SCHEMA extensions`)
8. **Leaked password protection** habilitar en Supabase Dashboard → Authentication → Providers → Security

## Auth

- Supabase Auth con SSR (`@supabase/ssr`)
- Cookies manejadas vía `next/headers` y middleware
- Trigger `on_auth_user_created` crea automáticamente el perfil en `profiles` al registrarse
- Roles: `admin` y `afiliado`
- **Solo existe 1 admin.** Se crea manualmente via Supabase Admin API o SQL
- **Registro de afiliados requiere código de invitación** (8 caracteres, ej: AB7F92KD). El admin genera códigos en `/admin/affiliates` → se guardan en `invite_codes`. Al registrarse, el código se valida contra la DB y se marca como `usado = true`
- La función del trigger (`handle_new_user`) usa `SECURITY DEFINER` con `SET search_path = ''` y tiene `REVOKE EXECUTE FROM public, anon, authenticated` para que solo el trigger internamente pueda ejecutarla

## Sistema de afiliados

- **Cookie:** 90 días de duración
- **Parámetro URL:** `?a=` con el UUID del afiliado
- **Hook `useAffiliate`:** lee `?a=` de URL o cookie, persiste por 90 días
- **Códigos únicos:** formato `AF-{userId}-{timestamp}`
- **Comisión:** no se calcula en el sistema (el pago al afiliado es offline)

## Flujo de compra (WhatsApp)

1. Usuario ve producto y hace clic en "VER AHORA"
2. Modal de compra (`BuyModal`) — ingresa nombre, selecciona método de pago
3. POST a `/api/orders` crea la orden con estado `pendiente`
4. GET a `/api/affiliates/phone` obtiene el teléfono del afiliado
5. Abre `wa.me/591{telefono}?text={mensaje}` en nueva pestaña
6. No hay persistencia de pago real — todo se cierra por WhatsApp
7. El afiliado debe tener teléfono configurado en su perfil

## Base de datos (8 tablas)

| Tabla | Propósito | RLS |
|-------|-----------|-----|
| `profiles` | Perfiles de usuario (admin/afiliado) | Admin: todo, Usuario: propio |
| `categories` | Categorías de productos | Público: lectura, Admin: todo |
| `products` | Productos con precio, stock, envío | Público: lectura (activos), Admin: todo |
| `banners` | Banners del carrusel | Público: lectura, Admin: todo |
| `affiliate_links` | Códigos de afiliado (links de referido) | Admin: todo, Afiliado: propios |
| `affiliate_cookies` | Tokens de sesión para afiliados | Admin: todo, Afiliado: propios |
| `orders` | Órdenes de compra | Admin: todo, Afiliado: propias |
| `system_config` | Configuración del sistema | Solo admin |
| `invite_codes` | Códigos de invitación (pre-registro) | Admin: todo, Afiliado: lectura de no usados |

## Reglas de negocio

- **Moneda:** Bs (Bolivianos)
- **Prefijo WhatsApp:** `+591` (Bolivia, hardcodeado por ahora)
- **Búsqueda:** trigramas (`pg_trgm`) en nombre y descripción de productos — extensión instalada en schema `extensions` (no en `public`)
- **Estado de órdenes:** `pendiente` → `enviado` → `completado` | `cancelado`
- **Métodos de pago:** QR, Transferencia, Efectivo contra entrega
- **Stock:** los productos tienen campo `stock`, pero no se decrementa automáticamente (control manual por ahora)
- **Envío:** campos `precio_envio` y `envio_opciones` (texto libre: "gratis", "recojo", "online")

## Estructura de archivos clave

```
src/
  app/
    page.tsx                    # Homepage (storefront)
    layout.tsx                  # Root layout
    globals.css                 # Tailwind + shadcn variables
    middleware.ts               # Auth guard
    auth/login/page.tsx         # Login
    auth/register/page.tsx      # Registro
    auth/callback/route.ts      # Auth callback
    admin/                      # Panel admin
    affiliate/                  # Panel afiliado
    api/orders/route.ts         # POST crear orden
    api/affiliates/phone/route.ts # GET teléfono afiliado
    products/[id]/              # (VACÍO — falta implementar)
  components/
    store/                      # Componentes storefront
    admin/                      # Sidebar admin
    affiliate/                  # Sidebar afiliado
    ui/                         # shadcn components
  hooks/
    use-affiliate.ts            # Tracking afiliados
    use-buy-modal.ts            # Zustand store modal
    use-whatsapp.ts             # URLs WhatsApp
  lib/
    supabase/client.ts          # Browser client
    supabase/server.ts          # Server client
    supabase/admin.ts           # Admin client (service_role)
    supabase/middleware.ts      # Session update
    validations/auth.ts         # Zod schemas auth
    validations/product.ts      # Zod schemas products
    utils.ts                    # cn()
  types/index.ts                # Interfaces TS
```

## Despliegue (Vercel)

- Conectar repo a Vercel
- Configurar todas las env vars en Vercel Dashboard
- Aplicar migración SQL a Supabase (`supabase/migrations/00001_schema.sql`)
- El proyecto ya tiene `next.config.ts`, la build no necesita configuración extra
