-- ============================================================
-- E-M STORE V2.0 — Esquema Final (después de migraciones 00001 + 00002 + 00003 + 00005 + 00007 + 00010 + 00011 + Fix 00011 + Fix 00012 + Fix 00013 + Fix 00014 + Fix 00015 + Fix 00016)
-- ============================================================
-- Este archivo refleja el estado ACTUAL de la base de datos.
-- NO editar directamente — se actualiza automáticamente después de ejecutar ejecucion.sql
-- ============================================================

-- 1. PROFILES (vinculada a auth.users via trigger)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  codigo_pais TEXT DEFAULT '+591',
  codigo_afiliado TEXT,
  codigo_corto TEXT UNIQUE,
  rol TEXT NOT NULL DEFAULT 'afiliado' CHECK (rol IN ('admin', 'afiliado')),
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  ultimo_acceso TIMESTAMPTZ
);

-- 2. CATEGORIES
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  precio_original DECIMAL(10,2),
  categoria_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  imagen_url TEXT,
  stock INT DEFAULT 0,
  precio_envio DECIMAL(10,2) DEFAULT 0,
  envio_opciones TEXT DEFAULT '',
  activo BOOLEAN DEFAULT true,
  duracion INT DEFAULT 28,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3b. FEATURED_PRODUCTS
CREATE TABLE featured_products (
  id SERIAL PRIMARY KEY,
  producto_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  orden INT NOT NULL DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE featured_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_featured" ON featured_products
  FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

CREATE POLICY "public_select_featured" ON featured_products
  FOR SELECT TO anon, authenticated
  USING (activo = true);

-- 4. BANNERS
CREATE TABLE banners (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT,
  imagen_url TEXT NOT NULL,
  link TEXT,
  producto_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  orden INT DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AFFILIATE_LINKS
CREATE TABLE affiliate_links (
  id BIGSERIAL PRIMARY KEY,
  afiliado_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  producto_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  codigo_unico TEXT NOT NULL UNIQUE,
  clicks INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. AFFILIATE_COOKIES
CREATE TABLE affiliate_cookies (
  id BIGSERIAL PRIMARY KEY,
  afiliado_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expira TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDERS
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  afiliado_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  producto_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  cantidad INT DEFAULT 1,
  total DECIMAL(10,2),
  telefono_cliente TEXT,
  cliente_nombre TEXT,
  metodo_pago TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente','enviado','completado','cancelado')),
  whatsapp_message_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SYSTEM_CONFIG
CREATE TABLE system_config (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Config por defecto
INSERT INTO system_config (clave, valor) VALUES
  ('admin_whatsapp_fallback', '591XXXXXXXXX'),
  ('sitio_nombre', 'E-M Store'),
  ('afiliado_cookie_dias', '90'),
  ('moneda_simbolo', 'Bs'),
  ('mensaje_confirmacion', '¡Hola! 🚀 Tu compra del producto *{producto}* por Bs {precio} ha sido recibida. El administrador se comunicará contigo pronto para coordinar la entrega. ¡Gracias por confiar en nosotros! 💙')
ON CONFLICT (clave) DO NOTHING;

-- 9. INVITE_CODES
CREATE TABLE invite_codes (
  codigo TEXT PRIMARY KEY,
  usado BOOLEAN DEFAULT false,
  usado_por UUID REFERENCES profiles(id) ON DELETE SET NULL,
  usado_en TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ADMIN_AUDIT_LOG
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id BIGSERIAL PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) NOT NULL,
  accion TEXT NOT NULL,
  tabla TEXT NOT NULL,
  registro_id TEXT,
  datos_previos JSONB,
  datos_nuevos JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_log: admins pueden todo"
  ON admin_audit_log FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_products_categoria ON products(categoria_id);
CREATE INDEX idx_products_activo ON products(activo);
CREATE INDEX idx_products_nombre ON products USING gin(nombre gin_trgm_ops);
CREATE INDEX idx_categories_activo ON categories(activo);
CREATE INDEX idx_orders_afiliado ON orders(afiliado_id);
CREATE INDEX idx_orders_estado ON orders(estado);
CREATE INDEX idx_affiliate_links_afiliado ON affiliate_links(afiliado_id);
CREATE INDEX idx_affiliate_cookies_token ON affiliate_cookies(token);
CREATE INDEX idx_affiliate_cookies_expiracion ON affiliate_cookies(expira);

-- ============================================================
-- TRIGGER: crear profile al registrar usuario (AFTER INSERT)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email, telefono, codigo_afiliado, rol, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'codigo_afiliado',
    COALESCE(NEW.raw_user_meta_data->>'rol', 'afiliado'),
    'pendiente'
  );

  UPDATE invite_codes
  SET usado = true,
      usado_por = NEW.id,
      usado_en = NOW()
  WHERE codigo = NEW.raw_user_meta_data->>'codigo_afiliado'
    AND usado = false;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- ============================================================
-- TRIGGER: establecer rol en app_metadata (BEFORE INSERT)
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_app_metadata_rol()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  NEW.raw_app_meta_data = jsonb_set(
    COALESCE(NEW.raw_app_meta_data, '{}'::jsonb),
    '{rol}',
    to_jsonb(COALESCE(NEW.raw_user_meta_data->>'rol', 'afiliado'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_app_meta ON auth.users;
CREATE TRIGGER on_auth_user_created_app_meta
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_app_metadata_rol();

REVOKE EXECUTE ON FUNCTION public.set_app_metadata_rol() FROM public, anon, authenticated;

-- ============================================================
-- TRIGGER: generar código corto para afiliados
-- ============================================================
CREATE OR REPLACE FUNCTION public.generate_short_code()
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := upper(substr(md5(gen_random_uuid()::text), 1, 6));
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_affiliate_code()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  IF NEW.rol = 'afiliado' AND NEW.codigo_corto IS NULL THEN
    NEW.codigo_corto := public.generate_short_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_affiliate_code ON profiles;
CREATE TRIGGER on_affiliate_code
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_affiliate_code();

REVOKE EXECUTE ON FUNCTION public.handle_affiliate_code() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_short_code() FROM public, anon, authenticated;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Usa app_metadata (inmutable)
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: admins pueden todo"
  ON profiles FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

CREATE POLICY "Profiles: usuarios ven su propio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles: usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles: lectura pública de codigo_corto"
  ON profiles FOR SELECT
  TO anon
  USING (codigo_corto IS NOT NULL);

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products: lectura pública"
  ON products FOR SELECT
  TO anon
  USING (activo = true);

CREATE POLICY "Products: admins pueden todo"
  ON products FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

-- CATEGORIES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories: lectura pública"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (activo = true);

CREATE POLICY "Categories: admins pueden todo"
  ON categories FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

-- BANNERS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners: lectura pública"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (activo = true);

CREATE POLICY "Banners: admins pueden todo"
  ON banners FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

-- AFFILIATE_LINKS
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate links: admins pueden todo"
  ON affiliate_links FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

CREATE POLICY "Affiliate links: afiliados ven sus propios links"
  ON affiliate_links FOR SELECT
  TO authenticated
  USING (afiliado_id = auth.uid());

CREATE POLICY "Affiliate links: afiliados insertan sus propios links"
  ON affiliate_links FOR INSERT
  TO authenticated
  WITH CHECK (
    afiliado_id = auth.uid()
    AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'afiliado'
  );

-- AFFILIATE_COOKIES
ALTER TABLE affiliate_cookies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate cookies: admins pueden todo"
  ON affiliate_cookies FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

CREATE POLICY "Affiliate cookies: afiliados ven sus propias cookies"
  ON affiliate_cookies FOR SELECT
  TO authenticated
  USING (afiliado_id = auth.uid());

-- ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders: admins pueden todo"
  ON orders FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

CREATE POLICY "Orders: afiliados ven sus propias órdenes"
  ON orders FOR SELECT
  TO authenticated
  USING (afiliado_id = auth.uid());

CREATE POLICY "Orders: cualquiera puede crear órdenes"
  ON orders FOR INSERT
  TO anon
  WITH CHECK (true);

-- SYSTEM_CONFIG
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System config: solo admin"
  ON system_config FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

-- INVITE_CODES
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invite codes: admins pueden todo"
  ON invite_codes FOR ALL
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin');

CREATE POLICY "Invite codes: afiliados verifican su código"
  ON invite_codes FOR SELECT
  TO authenticated
  USING (usado = false);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('products', 'products', true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES ('banners', 'banners', true, false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public SELECT products"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'products');

CREATE POLICY "Public SELECT banners"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'banners');

CREATE POLICY "Admin INSERT products" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'products'
    AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
  );

CREATE POLICY "Admin INSERT banners" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'banners'
    AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
  );

CREATE POLICY "Admin DELETE products" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'products'
    AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
  );

CREATE POLICY "Admin DELETE banners" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'banners'
    AND (auth.jwt() -> 'app_metadata' ->> 'rol') = 'admin'
  );

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
