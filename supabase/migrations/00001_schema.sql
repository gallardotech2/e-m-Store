-- ============================================================
-- E-M STORE V2.0 — Esquema Completo + RLS
-- ============================================================

-- 1. PROFILES (vinculada a auth.users via trigger)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  codigo_pais TEXT DEFAULT '+591',
  rol TEXT NOT NULL DEFAULT 'afiliado' CHECK (rol IN ('admin', 'afiliado')),
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Insertar config por defecto
INSERT INTO system_config (clave, valor) VALUES
  ('admin_whatsapp_fallback', '591XXXXXXXXX'),
  ('sitio_nombre', 'E-M Store'),
  ('afiliado_cookie_dias', '90'),
  ('moneda_simbolo', 'Bs');

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
-- TRIGGER: crear profile al registrar usuario
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, email, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'rol', 'afiliado')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles: admins pueden todo"
  ON profiles FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

CREATE POLICY "Profiles: usuarios ven su propio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Profiles: usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PRODUCTS (público lectura, admin escritura)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products: lectura pública"
  ON products FOR SELECT
  TO public
  USING (activo = true);

CREATE POLICY "Products: admins pueden todo"
  ON products FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

-- CATEGORIES (público lectura, admin escritura)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories: lectura pública"
  ON categories FOR SELECT
  TO public
  USING (activo = true);

CREATE POLICY "Categories: admins pueden todo"
  ON categories FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

-- BANNERS (público lectura, admin escritura)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banners: lectura pública"
  ON banners FOR SELECT
  TO public
  USING (activo = true);

CREATE POLICY "Banners: admins pueden todo"
  ON banners FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

-- AFFILIATE_LINKS (afiliado ve sus propios links, admin ve todos)
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate links: admins pueden todo"
  ON affiliate_links FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

CREATE POLICY "Affiliate links: afiliados ven sus propios links"
  ON affiliate_links FOR SELECT
  TO authenticated
  USING (afiliado_id = auth.uid());

-- AFFILIATE_COOKIES
ALTER TABLE affiliate_cookies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliate cookies: admins pueden todo"
  ON affiliate_cookies FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

CREATE POLICY "Affiliate cookies: afiliados ven sus propias cookies"
  ON affiliate_cookies FOR SELECT
  TO authenticated
  USING (afiliado_id = auth.uid());

-- ORDERS (afiliado ve sus órdenes, admin ve todas)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Orders: admins pueden todo"
  ON orders FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

CREATE POLICY "Orders: afiliados ven sus propias órdenes"
  ON orders FOR SELECT
  TO authenticated
  USING (afiliado_id = auth.uid());

-- SYSTEM_CONFIG (solo admin)
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System config: solo admin"
  ON system_config FOR ALL
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'))
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE rol = 'admin'));

-- ============================================================
-- HABILITAR pg_trgm PARA BÚSQUEDA
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
