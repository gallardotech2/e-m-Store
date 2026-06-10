'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { registerSchema } from '@/lib/validations/auth'
import { translateAuthError } from '@/lib/supabase/errors'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const result = registerSchema.safeParse({ nombre, email, telefono, password, codigo })
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      setLoading(false)
      return
    }

    const res = await fetch(`/api/invite-codes?codigo=${encodeURIComponent(result.data.codigo)}`)
    const validateJson = await res.json()

    if (!validateJson.valid) {
      toast.error(validateJson.message || 'Código de invitación inválido o ya fue usado')
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        data: {
          nombre: result.data.nombre,
          telefono: result.data.telefono,
          codigo_afiliado: result.data.codigo,
          rol: 'afiliado',
        },
      },
    })

    if (signUpError) {
      toast.error(translateAuthError(signUpError.message))
      setLoading(false)
      return
    }

    toast.success('Registro exitoso. Ahora puedes iniciar sesión.')
    router.push('/auth/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="text-2xl font-black text-red-600 mb-2 block">
            e-m Store
          </Link>
          <CardTitle>Registro de Afiliado</CardTitle>
          <CardDescription>Ingresa el código de invitación que recibiste</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono (sin prefijo, ej: 71123456)</Label>
              <Input id="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5 pl-1">
                <li className={password.length >= 8 ? 'text-green-600' : ''}>Mínimo 8 caracteres</li>
                <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>Al menos una minúscula</li>
                <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>Al menos una mayúscula</li>
                <li className={/[0-9]/.test(password) ? 'text-green-600' : ''}>Al menos un número</li>
                <li className={/[^a-zA-Z0-9]/.test(password) ? 'text-green-600' : ''}>Al menos un carácter especial</li>
              </ul>
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código de Invitación</Label>
              <Input id="codigo" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} maxLength={8} required placeholder="AB7F92KD" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registrando...' : 'Registrarme'}
            </Button>
          </form>
          <div className="text-center mt-4 text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-red-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
