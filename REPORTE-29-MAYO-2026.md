# REPORTE 29-MAYO-2026 — e-mstore V2.0

## Ubicación del proyecto
```
/home/elvirio16/Proyectos-Desarrollo-app-web/e-mstore/e-mstore V2.0/
```

## Stack
Next.js 16.2.6 · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui v4  
Supabase (PostgreSQL + Auth + RLS) · Zustand · Zod · lucide-react · Sonner

## Supabase
- Proyecto: `dcfoecfeujhoknuganhc`
- Admin: `admin@emstore.bo` / `Admin123456`
- Dashboard: https://supabase.com/dashboard/project/dcfoecfeujhoknuganhc

---

## ✅ Resuelto

| # | Problema | Solución |
|---|----------|----------|
| 1 | Imágenes no se subían (falta buckets Storage) | Creados buckets `products` + `banners` públicos |
| 2 | Upload directo desde cliente requería RLS Storage | Creado `/api/upload` con service_role key |
| 3 | `next/image` crasheaba con URLs de Supabase | Agregado `images.remotePatterns` en `next.config.ts` |
| 4 | Código invitación inválido al registrarse (RLS bloqueaba) | Creado `/api/invite-codes` con service_role key |
| 5 | No se podía ver la contraseña al escribir | Agregado botón ojo (Eye/EyeOff) en login + register |
| 6 | Bottom nav "Buscar" daba 404 | Cambiado de `/buscar` a `/` |
| 7 | 9 warnings de Supabase linter (user_metadata en RLS) | Migration `00002` preparado para migrar a app_metadata |

## 🔴 Pendiente CRÍTICO (ejecutar en SQL Editor)

Ejecutar `supabase/migrations/00002_fix_rls_app_metadata.sql` en Supabase Dashboard → SQL Editor.

Esto:
- Copia `rol` de `user_metadata` a `app_metadata` (inmutable) para todos los usuarios existentes
- Agrega trigger BEFORE INSERT para nuevos registros
- Actualiza las 9 políticas RLS para usar `app_metadata`

## 🔴 Pendiente después del SQL

- Cerrar sesión admin → volver a entrar (para obtener JWT fresco con `app_metadata.rol`)
- Probar agregar producto + verlo en otro navegador
- Probar registro de afiliado con código
- Verificar que warnings del linter desaparezcan

## 🟡 Por mejorar

| # | Problema | Prioridad |
|---|----------|-----------|
| 1 | Imágenes en modal de compra se ven cuadradas/recortadas | Media |
| 2 | Banner del carrusel muy grande | Media |
| 3 | Página /admin/affiliates no carga/interactúa | Baja |
| 4 | Página detalle de producto /products/[id] vacía | Baja |
| 5 | Deploy a Vercel | Baja |
| 6 | README.md aún boilerplate | Baja |

---

*Generado: 29 de mayo de 2026*
