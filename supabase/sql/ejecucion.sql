-- ESTADO: EJECUTADO 
-- ============================================================
-- E-M STORE V2.0 — Archivo de Ejecución SQL
-- ============================================================
-- SOLO cambios pendientes de ejecutar en el SQL Editor del Dashboard.
-- Los ya ejecutados están documentados en migraciones.sql
-- ============================================================

-- ============================================================
-- Fix 00017: Consumir invite_codes automáticamente al registrar
-- Fecha: 2026-06-09
-- Descripción: El código de invitación se consume automáticamente
-- mediante el trigger handle_new_user() al crear el usuario.
-- Elimina la necesidad del POST /api/invite-codes (race condition,
-- fallo de red, falta de auditoría).
-- ============================================================

-- 1. Recrear handle_new_user() con UPDATE invite_codes incluido
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

  -- Consumir código de invitación si existe
  UPDATE invite_codes
  SET usado = true,
      usado_por = NEW.id,
      usado_en = NOW()
  WHERE codigo = NEW.raw_user_meta_data->>'codigo_afiliado'
    AND usado = false;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
