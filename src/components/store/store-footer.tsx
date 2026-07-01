import Link from 'next/link'
import {
  Mail,
  MessageCircle,
  Clock,
  Shield,
  Wallet,
  HelpCircle,
  FileText,
  Lock,
  Package,
  RefreshCw,
  Ban,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const contactItems = [
  { icon: Mail, label: 'Email', value: 'soporte@emstore.bo' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+591 77875323' },
  { icon: Clock, label: 'Horario', value: 'Lunes a viernes de 10 a 18h' },
]

const guarantees = [
  'Cuentas compradas legalmente con dinero real',
  'Perfil propio e independiente dentro de la cuenta',
  'Garantia de 30 dias: reemplazo sin coste',
  'Activacion gratis en servicios seleccionados',
]

const paymentMethods = [
  'QR',
  'Transferencia bancaria',
  'Pago movil (segun pais)',
]

const helpLinks = [
  { icon: Package, label: 'Consultar mi pedido', href: '#pedidos' },
  { icon: RefreshCw, label: 'Reclamar garantia', href: '#garantia' },
  { icon: Ban, label: 'Cancelar suscripcion', href: '#cancelar' },
]

const legalLinks = [
  { icon: FileText, label: 'Terminos y condiciones', href: '/terminos' },
  { icon: Lock, label: 'Politica de privacidad', href: '/privacidad' },
]

export function StoreFooter() {
  return (
    <footer className="bg-[#1a1a2e] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1: Marca + Contacto */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black">e-m Store</h2>
              <p className="text-white/60 text-sm mt-1">
                Un perfil, más ahorro, más control
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
                Contacto
              </h3>
              {contactItems.map((item) => (
                <div key={item.label} className="flex items-start gap-3 text-sm">
                  <item.icon className="h-4 w-4 mt-0.5 text-white/50 shrink-0" />
                  <div>
                    <span className="text-white/60">{item.label}:</span>{' '}
                    <span className="text-white">{item.value}</span>
                  </div>
                </div>
              ))}
              <p className="text-xs text-white/40 ml-7">
                Respuesta en menos de 24 horas
              </p>
            </div>
          </div>

          {/* Columna 2: Servicios + Ayuda */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Garantias
              </h3>
              <ul className="space-y-2">
                {guarantees.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="text-green-400 mt-1 shrink-0">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Metodos de pago
              </h3>
              <ul className="space-y-1">
                {paymentMethods.map((method) => (
                  <li key={method} className="text-sm text-white/70">
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Columna 3: Ayuda + Legal */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Ayuda
              </h3>
              <ul className="space-y-2">
                {helpLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Legal
              </h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
                    >
                      <link.icon className="h-4 w-4 shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Separator className="bg-white/10" />
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="text-center text-sm text-white/40 space-y-1">
          <p>&copy; 2024 - 2026 e-m Store v2. Todos los derechos reservados.</p>
          <p>Compra legal verificada</p>
        </div>
      </div>
    </footer>
  )
}
