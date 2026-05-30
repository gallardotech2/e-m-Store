'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  nombre: string
  email: string
  telefono: string | null
  codigo_pais: string | null
}

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const nombre = form.get('nombre') as string
    const telefono = form.get('telefono') as string

    const { error } = await supabase
      .from('profiles')
      .update({ nombre, telefono: telefono || null })
      .eq('id', profile?.id)

    if (error) toast.error(error.message)
    else {
      toast.success('Perfil actualizado')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

      <Card className="border-0 shadow-md max-w-xl">
        <CardHeader className="bg-blue-600 text-white rounded-t-lg">
          <CardTitle>Editar Perfil</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input name="nombre" defaultValue={profile?.nombre ?? ''} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile?.email ?? ''} disabled className="bg-gray-100" />
              <p className="text-xs text-muted-foreground">El email no se puede cambiar</p>
            </div>
            <div className="space-y-2">
              <Label>Teléfono (ej: 71123456)</Label>
              <Input name="telefono" defaultValue={profile?.telefono ?? ''} placeholder="71123456" />
              <p className="text-xs text-muted-foreground">Número sin prefijo. Se usará para recibir notificaciones de pedidos.</p>
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
