-- ============================================================
-- E-M STORE V2.0 — Historial de Migraciones
-- ============================================================
-- Este archivo registra todas las migraciones ejecutadas.
-- Se actualiza automáticamente después de ejecutar ejecucion.sql
-- ============================================================

-- ============================================================
-- Migración 00001_schema
-- Fecha ejecución: 2026-05-14
-- Estado: EJECUTADO
-- Descripción: Esquema completo + RLS + triggers + índices + storage
-- ============================================================
/*
-- Contenido de 00001_schema.sql ejecutado el 2026-05-14:
-- - 9 tablas: profiles, categories, products, banners, affiliate_links, affiliate_cookies, orders, system_config, invite_codes
-- - 9 índices para performance
-- - Trigger handle_new_user() para crear profile al registrarse
-- - 11 políticas RLS (usando user_metadata - obsoleto)
-- - 2 buckets de storage: products, banners
-- - Extensión pg_trgm para búsquedas
*/

-- ============================================================
-- Migración 00002_fix_rls_app_metadata
-- Fecha ejecución: 2026-05-30
-- Estado: EJECUTADO
-- Descripción: Migrar RLS de user_metadata a app_metadata (inmutable)
-- ============================================================
/*
-- Contenido de 00002_fix_rls_app_metadata.sql ejecutado el 2026-05-30:
-- - Trigger set_app_metadata_rol() BEFORE INSERT para nuevos usuarios
-- - UPDATE masivo para copiar rol existente a app_metadata
-- - 9 políticas RLS recreadas usando app_metadata en vez de user_metadata
-- - Seguridad: usuarios no pueden escalar privilegios editando user_metadata
*/

-- ============================================================
-- Migración 00003_status_afiliados
-- Fecha ejecución: 2026-06-02
-- Estado: EJECUTADO
-- Descripción: Campo status para validación manual de afiliados
-- ============================================================
/*
-- Contenido de 00003 ejecutado el 2026-06-02:
-- - Campo status en profiles (pendiente/aprobado/rechazado)
-- - Policies RLS para control de acceso por status
-- - Admin puede ver todos los profiles
-- - Afiliados pendientes/redirigidos a /auth/pending
*/

-- ============================================================
-- Migración 00004_fix_trigger_handle_new_user
-- Fecha: 2026-06-02
-- Estado: REEMPLAZADA por 00005
-- Descripción: Trigger guarda telefono, codigo_afiliado y status
-- ============================================================
/*
-- REEMPLAZADA: Esta migración no incluía ALTER TABLE para codigo_afiliado
-- Ver migración 00005 que incluye el fix completo
*/

-- ============================================================
-- Migración 00005_fix_codigo_afiliado_trigger
-- Fecha ejecución: 2026-06-02
-- Estado: EJECUTADO
-- Descripción: Agregar columna codigo_afiliado + recrear trigger completo
-- ============================================================
/*
-- Contenido de 00005 ejecutado el 2026-06-02:
-- - ALTER TABLE: Agregar columna codigo_afiliado TEXT (no existía en BD real)
-- - CREATE OR REPLACE FUNCTION handle_new_user() completo
-- - Soluciona: "Database error saving new user"
-- - Requiere: Desactivar "Confirm email" en Supabase Dashboard (YA DESACTIVADO)
*/

-- ============================================================
-- Migración 00006_rls_affiliate_links_insert
-- Fecha ejecución: 2026-06-02
-- Estado: EJECUTADO
-- Descripción: Policy INSERT para que afiliados puedan crear sus propios links
-- ============================================================
/*
-- Contenido de 00006 ejecutado el 2026-06-02:
-- - CREATE POLICY INSERT en affiliate_links para afiliados
-- - Soluciona: "new row violates row-level security policy for table affiliate_links"
-- - Afiliados ahora pueden generar y regenerar sus links
*/

-- ============================================================
-- Migración 00007_short_code_affiliates
-- Fecha: 2026-06-02
-- Estado: EJECUTADO
-- Descripción: Código corto único para afiliados + mensaje WhatsApp configurable
-- ============================================================
/*
-- Contenido de 00007:
-- - ALTER TABLE: Agregar columna codigo_corto TEXT UNIQUE a profiles
-- - Función generate_short_code(): Genera código alfanumérico de 6 caracteres
-- - Función handle_affiliate_code(): Auto-genera código al crear afiliado
-- - Trigger on_affiliate_code: BEFORE INSERT en profiles
-- - UPDATE: Generar códigos para afiliados existentes
-- - INSERT: mensaje_confirmacion en system_config (template WhatsApp configurable)
-- - Soluciona: Links con UUID largo (?a=550e8400...) → código corto (?a=jR7K2N)
-- - Soluciona: Mensaje WhatsApp hardcodeado → configurable por admin
*/

-- ============================================================
-- Migración 00010: Agregar columna duracion a products
-- Fecha ejecución: 2026-06-02
-- Estado: EJECUTADO
-- Descripción: Campo duracion (días) configurable por producto, informativo
-- ============================================================
/*
-- Contenido de 00010:
-- - ALTER TABLE products ADD COLUMN duracion INT DEFAULT 28
-- - No afecta pedidos ni pagos — solo propósito informativo
*/

-- ============================================================
-- Migración 00011: Tabla featured_products (productos destacados)
-- Fecha ejecución: 2026-06-02
-- Estado: EJECUTADO
-- Descripción: Almacena productos destacados para el carrusel lento del frontend
-- ============================================================
/*
-- Contenido de 00011:
-- - CREATE TABLE featured_products (id SERIAL PK, producto_id FK→products, orden INT, activo BOOL, created_at)
-- - RLS: admin full access (auth.jwt ->> rol = admin)
-- - RLS: público solo SELECT donde activo = true
*/

-- ============================================================
-- Fix 00011: Corregir RLS policies de featured_products
-- Fecha ejecución: 2026-06-02
-- Estado: EJECUTADO
-- Descripción: Las policies originales de 00011 tenían errores. Se recrearon
-- con DROP/CREATE para usar app_metadata y permitir SELECT público.
-- ============================================================
/*
-- DROP POLICY "admin_all_featured" ON featured_products;
-- DROP POLICY "public_select_featured" ON featured_products;
-- CREATE POLICY "admin_all_featured" ON featured_products
--   FOR ALL TO authenticated
--   USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
--   WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');
-- CREATE POLICY "public_select_featured" ON featured_products
--   FOR SELECT TO anon, authenticated
--   USING (activo = true);
*/

-- ============================================================
-- Fix 00012: Cambiar TO public → TO anon, authenticated en RLS
-- Fecha ejecución: 2026-06-09
-- Estado: EJECUTADO
-- Descripción: TO public es anti-pattern de seguridad porque permite acceso
-- a usuarios anónimos sin autenticar. Se reemplaza por TO anon, authenticated
-- en todas las policies existentes.
-- ============================================================
/*
-- DROP POLICY "Categories: lectura pública" ON categories;
-- CREATE POLICY "Categories: lectura pública" ON categories
--   FOR SELECT TO anon, authenticated
--   USING (activo = true);
-- DROP POLICY "Banners: lectura pública" ON banners;
-- CREATE POLICY "Banners: lectura pública" ON banners
--   FOR SELECT TO anon, authenticated
--   USING (activo = true);
-- DROP POLICY "Public SELECT products" ON storage.objects;
-- CREATE POLICY "Public SELECT products" ON storage.objects
--   FOR SELECT TO anon, authenticated
--   USING (bucket_id = 'products');
-- DROP POLICY "Public SELECT banners" ON storage.objects;
-- CREATE POLICY "Public SELECT banners" ON storage.objects
--   FOR SELECT TO anon, authenticated
--   USING (bucket_id = 'banners');
*/

-- ============================================================
-- Fix 00013: Reemplazar random() por gen_random_uuid() en generate_short_code()
-- Fecha ejecución: 2026-06-09
-- Estado: EJECUTADO
-- Descripción: random() no es criptográficamente seguro. Se reemplaza por
-- pgcrypto (gen_random_uuid) para generar códigos cortos de afiliados.
-- ============================================================
/*
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- CREATE OR REPLACE FUNCTION public.generate_short_code()
-- RETURNS TEXT AS $$
-- DECLARE
--   result TEXT;
-- BEGIN
--   result := upper(substr(md5(gen_random_uuid()::text), 1, 6));
--   RETURN result;
-- END;
-- $$ LANGUAGE plpgsql;
*/

-- ============================================================
-- Fix 00014: Políticas INSERT/DELETE en storage.objects para admin
-- Fecha ejecución: 2026-06-09
-- Estado: EJECUTADO
-- Descripción: Defense-in-depth — policies para que solo admin pueda
-- INSERT/DELETE en storage.objects (products y banners).
-- ============================================================
/*
-- CREATE POLICY "Admin INSERT products" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (
--     bucket_id = 'products'
--     AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
--   );
-- CREATE POLICY "Admin INSERT banners" ON storage.objects
--   FOR INSERT TO authenticated
--   WITH CHECK (
--     bucket_id = 'banners'
--     AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
--   );
-- CREATE POLICY "Admin DELETE products" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (
--     bucket_id = 'products'
--     AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
--   );
-- CREATE POLICY "Admin DELETE banners" ON storage.objects
--   FOR DELETE TO authenticated
--   USING (
--     bucket_id = 'banners'
--     AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
--   );
*/

-- ============================================================
-- Fix 00015: Tabla admin_audit_log para trazabilidad de acciones admin
-- Fecha ejecución: 2026-06-09
-- Estado: EJECUTADO
-- Descripción: Registra operaciones CRUD de administradores:
-- quién, qué, cuándo, valores anteriores/nuevos.
-- ============================================================
/*
-- CREATE TABLE IF NOT EXISTS admin_audit_log (
--   id BIGSERIAL PRIMARY KEY,
--   admin_id UUID REFERENCES profiles(id) NOT NULL,
--   accion TEXT NOT NULL,
--   tabla TEXT NOT NULL,
--   registro_id TEXT,
--   datos_previos JSONB,
--   datos_nuevos JSONB,
--   ip_address TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "admin_audit_log: admins pueden todo"
--   ON admin_audit_log FOR ALL
--   TO authenticated
--   USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
--   WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

-- ============================================================
-- Fix 00016: RLS pública para orders INSERT + profiles SELECT
-- Fecha ejecución: 2026-06-09
-- Estado: EJECUTADO
-- Descripción: Permite a compradores anónimos crear órdenes.
-- También permite resolver código corto de afiliado desde profiles
-- con anon key (necesario para createClient() en Vercel).
-- ============================================================
/*
-- Anónimos pueden INSERTAR órdenes (compradores no logueados)
CREATE POLICY "Orders: cualquiera puede crear órdenes"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- Anónimos pueden leer codigo_corto de profiles (para resolver ?a=XXX)
CREATE POLICY "Profiles: lectura pública de codigo_corto"
  ON profiles FOR SELECT
  TO anon
  USING (codigo_corto IS NOT NULL);
*/

-- ============================================================
-- Fix 00017: Consumir invite_codes via trigger (elimina POST API)
-- Fecha ejecución: 2026-06-09
-- Estado: EJECUTADO
-- Descripción: El consumo de código de invitación se mueve al
-- trigger handle_new_user() en vez del POST /api/invite-codes.
-- Elimina race condition, fallo de red, y falta de auditoría.
-- ============================================================
/*
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS TRIGGER
-- SET search_path = ''
-- AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, nombre, email, telefono, codigo_afiliado, rol, status)
--   VALUES (
--     NEW.id,
--     COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
--     NEW.email,
--     NEW.raw_user_meta_data->>'telefono',
--     NEW.raw_user_meta_data->>'codigo_afiliado',
--     COALESCE(NEW.raw_user_meta_data->>'rol', 'afiliado'),
--     'pendiente'
--   );
--
--   UPDATE invite_codes
--   SET usado = true,
--       usado_por = NEW.id,
--       usado_en = NOW()
--   WHERE codigo = NEW.raw_user_meta_data->>'codigo_afiliado'
--     AND usado = false;
--
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
*/

-- ============================================================
-- Fix 00018: RLS orders TO anon → TO public
-- Fecha ejecución: Pendiente
-- Descripción: Cambia la policy de orders INSERT de TO anon a
-- TO public para permitir tanto a anónimos como autenticados.
-- Motivo: El server client de la API route a veces está autenticado
-- (hereda cookie de sesión), y TO anon bloquea el INSERT.
-- ============================================================

/*
-- SQL a ejecutar:
DROP POLICY IF EXISTS "Orders: cualquiera puede crear órdenes" ON orders;

CREATE POLICY "Orders: cualquiera puede crear órdenes"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);
*/
