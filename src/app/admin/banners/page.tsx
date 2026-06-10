import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } }
import { BannersTable } from './banners-table'
import { BannerForm } from './banner-form'
import { BannersAdminToggle } from './banners-admin-toggle'

export default async function AdminBannersPage() {
  const supabase = await createClient()

  const [{ data: banners }, { data: products }] = await Promise.all([
    supabase.from('banners').select('*, products(nombre)').eq('activo', true).order('orden'),
    supabase.from('products').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <BannersAdminToggle />
      </div>
      <BannerForm products={products ?? []} />
      <div className="mt-8">
        <BannersTable banners={banners ?? []} />
      </div>
    </div>
  )
}
