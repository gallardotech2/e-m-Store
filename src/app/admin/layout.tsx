import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminBottomNav } from '@/components/admin/admin-bottom-nav'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminSupabase = createAdminClient()
  const [{ count: pendingOrders }, { count: pendingAffiliates }] = await Promise.all([
    adminSupabase.from('orders').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pendiente').eq('rol', 'afiliado'),
  ])

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        {children}
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <AdminBottomNav
          counts={{ orders: pendingOrders ?? 0, affiliates: pendingAffiliates ?? 0 }}
        />
      </div>
    </div>
  )
}
