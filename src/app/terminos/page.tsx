import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | e-m Store',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-red-600">Términos y Condiciones de Servicio</h1>
      <p className="text-muted-foreground">
        <strong>E-M Store – Tienda Virtual de Suscripciones Digitales</strong>
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">1. Objeto del Servicio</h2>
        <p>
          La Tienda <strong>E-M Store</strong> ofrece la venta de perfiles individuales y accesos
          compartidos para una amplia gama de <strong>servicios de suscripción digital</strong>,
          incluyendo, pero no limitado a: <strong>plataformas de streaming (video/música),
          herramientas de inteligencia artificial (IA), software educativo, juegos en línea y
          otras aplicaciones de pago</strong>.
        </p>
        <p>
          Todos los pagos se realizan en <strong>moneda real (Bolivianos Bs.)</strong> a través
          de los medios de pago habilitados por la Tienda.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">2. Precios, Duración y Cálculo Diario</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>El costo de cada perfil o acceso se calcula en base a un <strong>valor diario</strong> establecido según el plan contratado.</li>
          <li><strong>Ejemplo referencial:</strong> Si un perfil tiene un valor de <strong>30 Bs.</strong> por <strong>30 días</strong>, el costo por día de uso efectivo es de <strong>1 Bs.</strong></li>
          <li>La vigencia del servicio dependerá del plan específico que el cliente elija al momento de la compra.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">3. Política de Reembolsos por Caída del Servicio</h2>
        <p>En caso de que la cuenta o plataforma contratada llegue a <strong>caer</strong> (dejar de funcionar por causas ajenas al usuario) antes de finalizar el período contratado:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Se realizará un <strong>descuento proporcional</strong> únicamente por los días efectivamente disfrutados.</li>
          <li><strong>Ejemplo:</strong> Si el servicio cae en el <strong>día 18</strong>, se descontarán <strong>18 Bs.</strong> (equivalentes a los 18 días de uso) y el <strong>saldo restante</strong> (12 Bs.) será <strong>reembolsado íntegramente</strong> a la cuenta bancaria del cliente.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">4. Uso Exclusivo en un Solo Dispositivo</h2>
        <p>El perfil o acceso adquirido está autorizado para ser utilizado únicamente en <strong>UN (1) dispositivo</strong> a la vez, salvo que el plan adquirido especifique lo contrario.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Prohibición:</strong> Queda estrictamente prohibido el uso simultáneo o alternado en más de dos (2) dispositivos sin previa autorización de E-M Store.</li>
          <li><strong>Detección:</strong> Si el sistema o la propia plataforma detectan actividad en más de 2 dispositivos, el perfil será <strong>bloqueado y cerrado automáticamente</strong> para preservar la estabilidad del servicio y la seguridad de todos los usuarios.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">5. Reactivación por Bloqueo</h2>
        <p>En caso de que el perfil sea bloqueado por incumplimiento del punto anterior:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>El cliente deberá contactar al <strong>Soporte Oficial de E-M Store</strong> vía mensaje.</li>
          <li>Se le otorgará un <strong>nuevo código de habilitación</strong> (o credenciales actualizadas) para desbloquear el perfil.</li>
          <li>Como condición para la reactivación, el cliente deberá <strong>confirmar por escrito</strong> que utilizará el perfil en un único dispositivo a partir de ese momento.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">6. Cambio de Dispositivo</h2>
        <p>Si el cliente desea cambiar de dispositivo (celular, TV, computadora, tableta, etc.) durante el período contratado:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Es <strong>OBLIGATORIO</strong> informar con antelación al departamento de Soporte de E-M Store.</li>
          <li>La Tienda validará la identidad del cliente y autorizará el cambio para:
            <ul className="list-disc pl-6 mt-2">
              <li>Garantizar la <strong>seguridad</strong> de la cuenta.</li>
              <li>Evitar saturaciones en el sistema.</li>
              <li>Proteger al cliente de posibles accesos no autorizados por terceros.</li>
            </ul>
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">7. Soporte y Atención al Cliente</h2>
        <p>
          Cualquier consulta, solicitud de cambio, reactivación o reembolso deberá ser gestionada
          directamente a través de los canales oficiales de Soporte de <strong>E-M Store</strong>.
          La Tienda se reserva el derecho de solicitar datos de verificación (como correo o nombre
          de usuario) para proceder con cualquier petición.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">8. Aceptación de los Términos</h2>
        <p>
          Al realizar la compra y el pago del perfil o acceso, el cliente declara haber leído,
          comprendido y aceptado en su totalidad los presentes Términos y Condiciones,
          comprometiéndose a respetar cada una de las cláusulas aquí establecidas para
          <strong>cualquier servicio</strong> adquirido dentro de E-M Store.
        </p>
      </section>

      <div className="border-t pt-6 text-sm text-muted-foreground space-y-1">
        <p><strong>Última actualización:</strong> 16/06/2026</p>
        <p><strong>E-M Store – Soporte:</strong> 77875323 / escudopago@mail.com</p>
      </div>
    </div>
  )
}
