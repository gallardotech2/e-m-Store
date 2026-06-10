import { AffiliateSidebar } from '@/components/affiliate/sidebar'
import { AffiliateBottomNav } from '@/components/affiliate/affiliate-bottom-nav'

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block">
        <AffiliateSidebar />
      </div>
      <main className="flex-1 bg-gray-50 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        {children}
      </main>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <AffiliateBottomNav />
      </div>
    </div>
  )
}
