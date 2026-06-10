'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function AffiliateErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold">Error del panel</h1>
        <p className="text-muted-foreground text-sm">
          Ocurrió un error al cargar tu panel de afiliado. Por favor intentá de nuevo.
        </p>
        <Button onClick={() => unstable_retry()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Reintentar
        </Button>
      </div>
    </div>
  )
}
