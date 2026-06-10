'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import './AdminPanel.css'

interface Banner {
  id: number
  imagen_url: string
  titulo: string | null
  link: string | null
  producto_id: number | null
  orden: number
}

interface AdminPanelProps {
  onClose: () => void
}

export function AdminPanel({ onClose }: AdminPanelProps) {
  const router = useRouter()
  const supabase = createClient()
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data } = await supabase
        .from('banners')
        .select('id, imagen_url, titulo, link, producto_id, orden')
        .eq('activo', true)
        .order('orden')
      if (!cancelled) setBanners(data ?? [])
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  async function refreshBanners() {
    const { data } = await supabase
      .from('banners')
      .select('id, imagen_url, titulo, link, producto_id, orden')
      .eq('activo', true)
      .order('orden')
    setBanners(data ?? [])
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setUploading(true)

    const form = new FormData(e.currentTarget)
    const titulo = form.get('titulo') as string
    const imagen = form.get('imagen') as File

    if (imagen.size === 0) {
      toast.error('Selecciona una imagen')
      setUploading(false)
      return
    }

    const uploadForm = new FormData()
    uploadForm.append('file', imagen)
    uploadForm.append('bucket', 'banners')
    const res = await fetch('/api/upload', { method: 'POST', body: uploadForm })
    const uploadJson = await res.json()
    if (!res.ok) {
      toast.error(uploadJson.error || 'Error al subir imagen')
      setUploading(false)
      return
    }

    const maxOrden = banners.length > 0 ? Math.max(...banners.map((b) => b.orden)) + 1 : 0

    const { error } = await supabase.from('banners').insert({
      titulo: titulo || null,
      imagen_url: uploadJson.url,
      orden: maxOrden,
      activo: true,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Banner agregado')
      refreshBanners()
      ;(e.target as HTMLFormElement).reset()
    }
    setUploading(false)
  }

  async function handleRemove(id: number) {
    setLoading(true)
    const { error } = await supabase.from('banners').update({ activo: false }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Banner eliminado')
      refreshBanners()
      router.refresh()
    }
    setLoading(false)
  }

  async function handleMoveUp(index: number) {
    if (index === 0 || banners.length < 2) return
    setLoading(true)
    const current = banners[index]
    const prev = banners[index - 1]

    await Promise.all([
      supabase.from('banners').update({ orden: prev.orden }).eq('id', current.id),
      supabase.from('banners').update({ orden: current.orden }).eq('id', prev.id),
    ])

    refreshBanners()
    setLoading(false)
  }

  async function handleMoveDown(index: number) {
    if (index >= banners.length - 1) return
    setLoading(true)
    const current = banners[index]
    const next = banners[index + 1]

    await Promise.all([
      supabase.from('banners').update({ orden: next.orden }).eq('id', current.id),
      supabase.from('banners').update({ orden: current.orden }).eq('id', next.id),
    ])

    refreshBanners()
    setLoading(false)
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel" onClick={(e) => e.stopPropagation()}>
        <div className="admin-panel__header">
          <h2>Administrar Banners</h2>
          <button className="admin-panel__close" onClick={onClose} aria-label="Cerrar">
            &times;
          </button>
        </div>

        <form className="admin-panel__form" onSubmit={handleAdd}>
          <h3>Agregar nuevo banner</h3>
          <div className="admin-panel__field">
            <label htmlFor="banner-titulo">Titulo (opcional)</label>
            <input
              id="banner-titulo"
              type="text"
              name="titulo"
              placeholder="Ej: Oferta de verano"
            />
          </div>
          <div className="admin-panel__field">
            <label htmlFor="banner-imagen">Imagen del banner</label>
            <input
              id="banner-imagen"
              type="file"
              name="imagen"
              accept="image/*"
              required
            />
          </div>
          <button type="submit" className="admin-panel__btn admin-panel__btn--add" disabled={uploading}>
            {uploading ? 'Subiendo...' : '+ Agregar banner'}
          </button>
        </form>

        <div className="admin-panel__list">
          <h3>Banners actuales ({banners.length})</h3>
          {banners.length === 0 && (
            <p className="admin-panel__empty">No hay banners. Agrega uno arriba.</p>
          )}
          {banners.map((banner, index) => (
            <div key={banner.id} className="admin-panel__item">
              <img src={banner.imagen_url} alt={banner.titulo ?? 'Banner'} className="admin-panel__thumb" />
              <div className="admin-panel__info">
                <span className="admin-panel__alt">{banner.titulo ?? 'Sin titulo'}</span>
                <span className="admin-panel__src">Orden: {banner.orden}</span>
              </div>
              <div className="admin-panel__actions">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || loading}
                  title="Mover arriba"
                >
                  &#9650;
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === banners.length - 1 || loading}
                  title="Mover abajo"
                >
                  &#9660;
                </button>
                <button
                  className="admin-panel__btn--remove"
                  onClick={() => handleRemove(banner.id)}
                  disabled={loading}
                  title="Eliminar"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
