'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Clock } from 'lucide-react'

export default function PendingPage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Cuenta Pendiente</CardTitle>
          <CardDescription>
            Tu cuenta está pendiente de aprobación por el administrador.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>¿Qué sigue?</strong>
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              El administrador revisará tu cuenta y la aprobará pronto. 
              Una vez aprobada, podrás acceder a tu panel de afiliado.
            </p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
