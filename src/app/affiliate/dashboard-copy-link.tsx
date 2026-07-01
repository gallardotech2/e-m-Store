'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export function DashboardCopyLink({ linkUrl }: { linkUrl: string }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(linkUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copiado')
  }

  return (
    <Card className="border border-dashed border-blue-200 bg-blue-50/50 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">Tu link de afiliado</p>
          <code className="block text-sm bg-white px-3 py-1.5 rounded border truncate">
            {linkUrl}
          </code>
        </div>
        <Button
          onClick={copyLink}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copiado' : 'Copiar'}
        </Button>
      </CardContent>
    </Card>
  )
}
