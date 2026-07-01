import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad | e-m Store',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 space-y-8">
      <h1 className="text-3xl font-bold text-red-600">Política de Privacidad Revisada y Actualizada</h1>
      <p className="text-muted-foreground">
        <strong>E-M Store – Tienda Virtual de Suscripciones Digitales</strong>
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">1. Información que Recopilamos</h2>
        <p>Para brindar nuestros servicios, E-M Store recopila únicamente los datos estrictamente necesarios:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Identificación:</strong> Nombre completo y/o alias.</li>
          <li><strong>Contacto:</strong> Número de teléfono (WhatsApp/Telegram) y correo electrónico.</li>
          <li><strong>Pago:</strong> Número de cuenta bancaria, entidad financiera, monto y comprobante de transferencia. (No almacenamos claves de acceso bancario).</li>
          <li><strong>Servicio:</strong> Datos de los perfiles adquiridos (usuario y contraseña de las plataformas contratadas).</li>
          <li><strong>Dispositivo:</strong> Identificador único del equipo usado para validar el uso en un solo dispositivo.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">2. ¿Cómo y para qué usamos sus datos?</h2>
        <p>Todos los datos recopilados están estrictamente protegidos por las políticas internas de E-M Store y por todos los asesores que trabajan en esta tienda virtual.</p>
        <p>Su información se usa exclusivamente para:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Validación de pagos:</strong> Verificar que la transferencia provenga de una persona natural real y acreditar correctamente su compra.</li>
          <li><strong>Seguridad del cliente:</strong> Prevenir fraudes, suplantaciones de identidad y accesos no autorizados a su perfil.</li>
          <li><strong>Gestión del servicio:</strong> Activar suscripciones, gestionar cambios de dispositivo, reactivar cuentas bloqueadas y procesar reembolsos.</li>
          <li><strong>Seguimiento de marketing (solo con su consentimiento):</strong> No enviaremos ofertas ni promociones a menos que usted haya marcado expresamente una casilla de aceptación al momento de la compra. Si nos da su consentimiento, podremos enviarle información sobre nuevos servicios durante el tiempo que dure su suscripción. Usted puede revocar este permiso en cualquier momento enviando un mensaje a Soporte.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">3. Acceso y Compartición de Datos</h2>
        <p>Sus datos personales no se venden, ni se alquilan, ni se comparten con terceros ajenos a la operación de E-M Store.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Administrador:</strong> El administrador general de la tienda es el responsable directo y tiene acceso total a la información para gestionar el negocio.</li>
          <li><strong>Asesores / Colaboradores:</strong> Los asesores de soporte tienen acceso limitado únicamente a los datos necesarios para atender su consulta (ej: su nombre y el servicio contratado). Todos ellos están obligados por un acuerdo de confidencialidad a no divulgar, copiar o utilizar su información para fines distintos a la atención al cliente.</li>
          <li><strong>Proveedores externos:</strong> Solo compartimos datos con las propias plataformas (Netflix, OpenAI, etc.) para crear y mantener su perfil, y con el banco/entidad de pago para procesar la transacción o el reembolso.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">4. Plazo de Conservación (Tiempo Temporal)</h2>
        <p>Tratamos sus datos de forma temporal, cumpliendo con el principio de proporcionalidad:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Regla general:</strong> Conservamos su información durante 2 meses después de la finalización de su suscripción o cancelación del servicio.</li>
          <li><strong>Excepción legal:</strong> Si existe un reclamo pendiente, una devolución en proceso o un requerimiento legal, podremos conservar sus datos por el tiempo necesario para resolver ese asunto específico, notificándole oportunamente.</li>
          <li>Pasado ese plazo, sus datos serán eliminados de forma segura de nuestras bases de datos activas.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">5. Seguridad de la Información</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Acceso restringido:</strong> Solo el administrador y los asesores autorizados pueden visualizar los datos, utilizando claves de acceso personales e intransferibles.</li>
          <li><strong>Comunicación segura:</strong> Toda la interacción vía WhatsApp/Telegram se realiza bajo la responsabilidad del cliente, pero nosotros no almacenamos esas conversaciones de forma masiva.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">6. Derechos del Titular de los Datos (ARCO)</h2>
        <p>Usted tiene derecho a:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Acceder</strong> a sus datos.</li>
          <li><strong>Rectificarlos</strong> si son incorrectos.</li>
          <li><strong>Cancelarlos</strong> (eliminarlos) en cualquier momento, aunque esto implicará la baja inmediata del servicio activo sin derecho a reembolso (salvo lo pactado en nuestros Términos).</li>
          <li><strong>Oponerse</strong> al uso de sus datos para marketing.</li>
        </ul>
        <p>Para ejercer estos derechos, escríbanos a nuestro Soporte identificándose plenamente.</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">7. Consentimiento y Aceptación</h2>
        <p>Al realizar la compra en E-M Store, usted declara que ha leído y acepta expresamente esta Política de Privacidad. Si no está de acuerdo con alguna cláusula, le rogamos no adquirir nuestros servicios.</p>
      </section>

      <div className="border-t pt-6 text-sm text-muted-foreground space-y-1">
        <p><strong>Última actualización:</strong> 10/02/2026</p>
        <p><strong>E-M Store – Responsable de Datos / Soporte:</strong> 77875323 / ecodopago@gmail.com</p>
      </div>
    </div>
  )
}
