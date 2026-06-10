'use client'

import { useState } from 'react'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

export function BannersAdminToggle() {
  const [showPanel, setShowPanel] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setShowPanel(true)}
        className="gap-2"
      >
        <Settings className="h-4 w-4" />
        Panel de Diseño
      </Button>

      {showPanel && (
        <AdminPanel onClose={() => setShowPanel(false)} />
      )}
    </>
  )
}
