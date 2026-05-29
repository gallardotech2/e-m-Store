// === js/script.js - EscudoVentas (100% FINAL - MENSAJE WHATSAPP ÉPICO) ===
document.addEventListener('DOMContentLoaded', function () {
    // === 1. CARRUSEL CON TOUCH (ANDROID) ===
    document.querySelectorAll('.carousel').forEach(function (carouselEl) {
        new bootstrap.Carousel(carouselEl, {
            interval: false,
            wrap: true,
            touch: true
        });
    });
    // === 2. LEER MÁS / LEER MENOS (EN TARJETAS) ===
    document.querySelectorAll('.leer-mas').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const cardText = this.closest('.card-text');
            const short = cardText.querySelector('.desc-short');
            const full = cardText.querySelector('.desc-full');
            if (full.style.display === 'none') {
                short.style.display = 'none';
                full.style.display = 'block';
                this.innerHTML = 'Leer menos <i class="bi bi-chevron-up"></i>';
            } else {
                short.style.display = 'block';
                full.style.display = 'none';
                this.innerHTML = 'Leer más <i class="bi bi-chevron-down"></i>';
            }
        });
    });
    // === 3. MODAL FACTURA - DESCRIPCIÓN LIMPIA ===
    const modal = document.getElementById('modalProducto');
    modal.addEventListener('show.bs.modal', e => {
        const b = e.relatedTarget;
        const n = b.dataset.nombre;
        const p = parseInt(b.dataset.precio);
        const po = parseInt(b.dataset.precioOriginal) || 0;
        const i = b.dataset.imagen;
        const d = b.dataset.descripcion || 'Producto de alta calidad';
        document.getElementById('modal-nombre').textContent = n;
        modal.querySelector('#modal-imagen').src = 'uploads/' + i;
        const precioText = 'Bs ' + p.toLocaleString();
        const precioOldText = po > p ? 'Bs ' + po.toLocaleString() : '';
        modal.querySelector('#modal-precio').textContent = precioText;
        const oldSpan = modal.querySelector('#modal-precio-old');
        oldSpan.textContent = precioOldText;
        oldSpan.style.display = precioOldText ? 'inline' : 'none';
        const descFormateada = d.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        modal.querySelector('#modal-descripcion').innerHTML = descFormateada;
    });

    // === ENVIAR POR WHATSAPP CON NÚMERO DEL AFILIADO (AHORA INDESTRUCTIBLE) ===
    document.getElementById('enviarWhatsApp').addEventListener('click', () => {
        const nombreProducto = document.getElementById('modal-nombre').textContent;
        const precio = document.getElementById('modal-precio').textContent;
        const precioOld = document.getElementById('modal-precio-old').textContent;
        const cliente = document.getElementById('nombre').value.trim();
        const pago = document.getElementById('pago').value;
        if (!cliente || !pago) return alert('Completa tu nombre y método de pago');

        // PRIMERO: BUSCA EN LA URL
        let afiliadoId = new URLSearchParams(window.location.search).get('a');

        // SEGUNDO: SI NO ESTÁ EN LA URL, BUSCA EN LA COOKIE
        if (!afiliadoId) {
            const cookies = document.cookie.split(';');
            for (let c of cookies) {
                const [key, value] = c.trim().split('=');
                if (key === 'afiliado_id') {
                    afiliadoId = value;
                    break;
                }
            }
        }

        // SI TODAVÍA NO HAY AFILIADO → ERROR
        if (!afiliadoId) {
            alert('⚠️ CUIDADO ⚠️\n\n' +
          'E-MStore\n\n' +
          'Este enlace de afiliado no está autorizado.\n' +
          'Reporta el número que te lo envió.\n\n' +
          'Solo confía en afiliados oficiales verificados.');
            return;
        }

        // BUSCAR EL TELÉFONO DEL AFILIADO
        fetch('get_telefono.php?id=' + afiliadoId)
            .then(response => response.json())
            .then(data => {
                if (!data.telefono || data.telefono === '') {
                    alert('El afiliado no tiene número configurado');
                    return;
                }
                let msg = `¡Hola E-MStore! 🚀\n\n`;
                    msg += `🔥 _PRODUCTO QUE QUIERO_ 🔥\n`;
                    msg += `*${nombreProducto}*\n\n`;
                    msg += `💰 *Precio final*: *${precio}*\n`;
if (precioOld)      msg += `🎯 Antes: ~~${precioOld}~~\n`;
                    msg += `\n👤 Cliente: ${cliente}\n`;
                    msg += `💳 Método: ${pago}\n\n`;
                     msg += `¡Listo para pagar ya mismo! ⚡\n`;
                     msg += `Gracias por confiar en nosotros 💙`;
                window.open('https://wa.me/591' + data.telefono + '?text=' + encodeURIComponent(msg), '_blank');
            })
            .catch(() => {
                alert('Error al obtener el número del afiliado');
            });
    });
});