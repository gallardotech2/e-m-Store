import { AffiliateSidebar } from '@/components/affiliate/sidebar'

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AffiliateSidebar />
      <main className="flex-1 bg-gray-50 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
