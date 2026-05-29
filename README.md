# DOCUMENTACIÓN OFICIAL – TIENDA VIRTUAL CON AFILIADOS

---

## 1. Resumen ejecutivo

Proyecto monolítico en PHP para tienda online con sistema de afiliados:
un administrador gestiona productos, categorías, banners y códigos de
afiliado; los afiliados se registran con un código único, configuran su
número de WhatsApp en un panel y comparten un enlace personal; el
cliente final compra abriendo un chat de WhatsApp directo al afiliado
(o mediante un sistema alternativo cuando no hay afiliado).

---

## 2. Tecnologías identificadas en el código

| Componente | Tecnología |
|---|---|
| **Backend** | PHP 8.x (sin framework, código estructurado en archivos sueltos + sesiones nativas) |
| **Frontend** | HTML5 + CSS3 + JavaScript vanilla + Bootstrap 5.3.3 + Bootstrap Icons 1.11 |
| **Base de datos** | MySQL / MariaDB (host: `sql211.infinityfree.com`, charset: `utf8mb4`) |
| **Motor de plantillas** | Ninguno (PHP embebido en HTML — `<?php ?>` directo) |
| **Autenticación admin** | Sesiones PHP nativas con CSRF tokens |
| **Autenticación afiliado** | Sesiones PHP nativas, login por email + password (bcrypt) |
| **Almacenamiento de archivos** | Sistema de archivos local (`uploads/`) |
| **Tipografía** | Google Fonts: Roboto 400, 500, 700, 900 |

---

## 3. Arquitectura general

No se sigue MVC ni ningún patrón formal. La aplicación es un conjunto
de archivos PHP "todo en uno" que mezclan lógica de negocio, consultas
SQL, HTML y JavaScript en un mismo archivo. No hay controladores,
modelos ni rutas independientes.

```
e-mstore V1.5.8/
├── index.php              → Tienda pública (listado + modal de compra + buscador)
├── config.php             → Conexión BD + session_start() (archivo legacy)
├── login2.php             → Login de afiliados (email + password)
├── register2.php          → Registro de afiliados (nombre, email, teléfono, password, código)
├── logout2.php            → Cierre de sesión de afiliado
├── get_telefono.php       → API JSON para obtener teléfono del afiliado por ID
├── error_log.php          → Activa display_errors (debug)
├── css/style.css          → Estilos de tienda pública
├── js/script.js           → Lógica de frontend (modal de compra + WhatsApp)
├── uploads/               → Imágenes de productos y banners
│   └── .htaccess          → Bloquea ejecución de PHP en uploads
├── afiliado/
│   └── panel.php          → Panel de afiliado (login, registro, dashboard unificado)
├── e$pro154/              → Panel de administración
│   ├── config.php         → Config admin (sesión + CSRF + helpers)
│   ├── login.php          → Login del administrador
│   ├── dashboard.php      → Dashboard admin (CRUD productos, categorías, códigos, banners)
│   ├── logout.php         → Cierre de sesión admin
│   ├── css/dashboard.css  → Estilos del dashboard
│   └── js/dashboard.js    → Sidebar toggle (responsive)
```

No hay separación entre capas. No hay API REST. No hay un enrutador
centralizado.

---

## 4. Descripción corregida del funcionamiento

### 4.1 Gestión del administrador

El administrador inicia sesión en `/e$pro154/login.php` con usuario
y contraseña almacenados en la tabla `admins`. Una vez autenticado,
accede al dashboard en `dashboard.php` donde puede:

- **Productos**: agregar, editar y eliminar productos (nombre,
  descripción, precio, precio original, stock, costo de envío,
  opciones de entrega, imagen, categoría).
- **Categorías**: agregar, editar y eliminar categorías (solo si
  no tienen productos asociados).
- **Códigos de afiliado**: generar códigos alfanuméricos de 8
  caracteres aleatorios (no editables); ver la lista de códigos
  con su estado (DISPONIBLE / USADO) y el email del afiliado que
  lo usó.
- **Banners**: subir banners para el carrusel de la página principal,
  con enlace opcional a un producto.

El administrador **no** gestiona directamente a los afiliados (no
puede ver su lista, no puede habilitarlos/deshabilitarlos, no puede
editar sus números). Solo genera códigos de invitación.

No existe una configuración de "número de WhatsApp del administrador"
en ninguna parte del código.

### 4.2 Registro y autenticación del afiliado

1. El administrador genera un código (ej: `AB7F92KD`) desde su panel.
2. El afiliado accede a `afiliado/panel.php?action=register`.
3. Completa un formulario con: nombre, email, teléfono, contraseña
   y el código de afiliado de 8 caracteres.
4. El sistema valida que el código exista en `afiliados_codigos`
   y que no haya sido usado aún.
5. Si es válido, se crea un registro en `usuarios_afiliados` con
   la contraseña hasheada (bcrypt) y se marca el código como usado.
6. Se genera automáticamente un enlace personal:
   `https://e-mstorebo.ct.ws/?a=[ID_NUMERICO_DEL_AFILIADO]`
7. El afiliado inicia sesión con **email + contraseña**
   (NO con el código) en `login2.php` o en `panel.php?action=login`.

### 4.3 Panel del afiliado

Una vez autenticado, el afiliado ve en `panel.php`:

- Su **enlace de afiliado personal** (con el formato `?a=ID`), que
  puede copiar al portapapeles o probar.
- Un formulario para **configurar su número de WhatsApp** con
  prefijo `+591` fijo (el código de área de Bolivia). El número
  debe contener solo dígitos, mínimo 7 caracteres.
- Indicador visual de si el número está configurado o no.

El afiliado **no ve** una lista de productos ni enlaces individuales
por producto. Su enlace es único y genérico (apunta al homepage de
la tienda con el parámetro `?a=ID`).

### 4.4 Experiencia del cliente final

1. El cliente recibe un enlace como:
   `https://e-mstorebo.ct.ws/?a=123`
2. Al cargar la página, el sistema detecta el parámetro `?a=ID`
   en la URL y lo guarda en una **cookie** con duración de **90 días**.
3. El cliente navega por la tienda normalmente. Todos los enlaces
   generados dentro de la sesión incluyen automáticamente el
   parámetro `?a=ID` gracias a la función `a()`.
4. Al hacer clic en "VER AHORA" en cualquier producto, se abre un
   modal donde el cliente ingresa su nombre y método de pago (QR,
   Transferencia, Efectivo).
5. Al hacer clic en "Pagar", el JavaScript (`script.js`):
   - Lee el `afiliado_id` desde la URL o desde la cookie.
   - Hace una petición `fetch` a `get_telefono.php?id=ID`.
   - Si el afiliado tiene un número configurado, abre:
     `https://wa.me/591[telefono]?text=[mensaje]`
   - Si **no hay ID** en URL ni cookie, muestra un **mensaje de
     error** bloqueante: "Este enlace de afiliado no está autorizado."
   - Si el ID existe pero **no tiene teléfono configurado**, muestra
     un **mensaje de error**: "El afiliado no tiene número configurado."
6. **No existe un número de respaldo del administrador.** Si no hay
   afiliado o el afiliado no tiene número, la compra se bloquea.

### 4.5 El parámetro `?a=` vs `?ref=`

El sistema utiliza `?a=` (de "afiliado") seguido del **ID numérico**
del afiliado en la tabla `usuarios_afiliados`. NO utiliza `?ref=`
y NO utiliza el código alfanumérico en la URL.

---

## 5. Roles y flujos detallados (validados contra el código)

### 5.1 Administrador

1. Accede a `e$pro154/login.php` — login con username + password.
2. Dashboard con resumen de categorías y productos.
3. CRUD de productos: nombre, descripción, precio, precio original,
   stock, costo de envío, opciones de entrega, imagen, categoría.
   - Validación: precio original debe ser mayor al precio actual.
   - Imagen: solo JPG, JPEG, PNG, WEBP, máximo 3 MB.
4. CRUD de categorías: nombre único. No se puede eliminar una
   categoría que tenga productos activos.
5. Generación de códigos de afiliado: 8 caracteres alfanuméricos
   aleatorios. No permite editar códigos ni gestionar afiliados.
6. Gestión de banners: subir imagen, enlazar opcionalmente a producto.
7. Cierre de sesión en `logout.php`.

### 5.2 Afiliado

1. **Registro**: requiere código de invitación válido y no usado.
   Datos: nombre, email, teléfono, password, código de 8 caracteres.
2. **Login**: email + password. Sesión PHP basada en ID de sesión.
3. **Dashboard**:
   - Visualiza su enlace personal: `https://.../?a=[su ID numérico]`
   - Copia el enlace al portapapeles (función JavaScript `copiar()`).
   - Configura su número de WhatsApp (solo dígitos, mínimo 7,
     prefijo `+591` fijo en el formulario).
   - Guarda el número (no hay doble verificación ni validación de
     formato internacional real).
4. **No tiene acceso** a:
   - Lista de productos de la tienda.
   - Enlaces individuales por producto.
   - Estadísticas de clics o ventas.
   - Múltiples números de WhatsApp.
5. Cierre de sesión en `logout2.php`.

### 5.3 Cliente final

1. Llega a la tienda desde un enlace directo o de afiliado (`?a=ID`).
2. Navega por categorías, busca productos, ve detalles en modal.
3. Decide comprar → llena nombre y método de pago en modal.
4. Hace clic en "Pagar" → se ejecuta JavaScript que:
   - Obtiene ID del afiliado (`?a=` de URL → cookie por 90 días).
   - Consulta `get_telefono.php` para obtener el número.
   - Si todo ok: abre WhatsApp Web con mensaje predefinido.
   - Si no hay afiliado o no tiene número: **error bloqueante**.
5. **No existe experiencia de compra sin afiliado.** Si alguien entra
   directamente sin `?a=`, el botón de WhatsApp falla con un alert de
   "enlace no autorizado".

---

## 6. Reglas de negocio implementadas

| # | Regla | Estado | Evidencia |
|---|-------|--------|-----------|
| 1 | Código de afiliado único (8 caracteres alfanuméricos aleatorios) | ✅ | `dashboard.php:152-154` — shuffle + check |
| 2 | Código no editable por el afiliado | ✅ | No hay interfaz para cambiar código |
| 3 | Cada código solo puede usarse una vez | ✅ | `register2.php:16-22` — validación `usado=0`; se marca como usado al registrar |
| 4 | El afiliado puede cambiar su número de WhatsApp | ✅ | `panel.php:41-51` — formulario de actualización |
| 5 | El número se guarda sin validación de formato internacional real | ✅ | Solo validación JS: mínimo 7 dígitos |
| 6 | No hay registro de ventas concretadas | ✅ | No existe tabla de ventas ni pedidos |
| 7 | El enlace de afiliado usa ID numérico, no el código alfanumérico | ✅ | `panel.php:52` — `link_personal = ?a=$afiliado_id` |
| 8 | Cookie de afiliado con duración de 90 días | ✅ | `index.php:9` — `time() + (86400 * 90)` |
| 9 | Precio original debe ser mayor al precio de venta | ✅ | `dashboard.php:25-26` |
| 10 | No se puede eliminar categoría con productos activos | ✅ | `dashboard.php:136-138` |

---

## 7. Limitaciones actuales de esta versión (V1.5.8)

- **No hay número de administrador de respaldo (fallback).** Si no hay
  afiliado o su número no está configurado, la compra se bloquea con
  un mensaje de error. No hay forma de que el admin reciba el pedido.
- **No hay gestión de afiliados desde el admin.** El admin solo genera
  códigos. No puede ver la lista de afiliados registrados, no puede
  habilitarlos/deshabilitarlos, no puede ver sus números de WhatsApp.
- **No hay enlaces individuales por producto en el panel de afiliado.**
  El afiliado solo tiene un enlace genérico a la página principal.
- **No hay tracking de clics ni de ventas.** No se registra cuántas
  veces se usó un enlace de afiliado.
- **No hay pasarela de pagos integrada** (solo redirección a WhatsApp).
- **No hay cálculo de comisiones.**
- **No hay registro de pedidos o ventas concretadas.**
- **No hay cupones, descuentos por afiliado, ni sistema de inventario
  en tiempo real.**
- **No hay validación de formato internacional del número WhatsApp.**
  Solo se verifica que sean dígitos y mínimo 7 caracteres.
- **No hay integración con CRM ni email marketing.**
- **No hay notificaciones al administrador.**
- **El prefijo `+591` (Bolivia) está hardcodeado** en el formulario
  del afiliado y en el enlace de WhatsApp. No es configurable.
- **Hardcodeo de credenciales BD.** La conexión a base de datos
  contiene usuario y contraseña directamente en el código fuente
  (`config.php`, `index.php`).

---

## 8. Coincidencias y diferencias encontradas entre la descripción original y el código

### ✅ Lo que sí coincide

- El admin puede crear, editar y eliminar productos.
- El admin genera códigos únicos para afiliados.
- El afiliado puede configurar su número de WhatsApp.
- El cliente final no necesita registrarse.
- El botón de WhatsApp abre un chat directo.
- No hay registro de ventas ni pasarela de pagos.
- El tracking de clics NO existe (coincide con lo esperado).
- No hay chat interno, cupones, comisiones automáticas ni CRM.

### ⚠️ Lo que es diferente

| Aspecto | Descripción original | Código real |
|---------|---------------------|-------------|
| Parámetro en URL | `?ref=CODIGO` (código alfanumérico) | `?a=ID` (ID numérico del afiliado en BD) |
| Formato de código | `AF-8X3K9L` (con prefijo `AF-`) | 8 caracteres aleatorios sin prefijo (ej: `AB7F92KD`) |
| Cómo inicia sesión el afiliado | Solo con su código único | Con **email + contraseña** (el código solo se usa para registrarse) |
| Panel del afiliado | Lista de productos con enlaces individuales | Solo muestra el enlace genérico, sin lista de productos |
| Fallback sin afiliado | Usa número del admin por defecto | **Bloquea la compra** con mensaje de error (no hay número admin configurado) |
| Número WhatsApp admin | Debe existir un número por defecto | **No existe** en ninguna parte del código ni configuración |
| Flujo de obtención del número | Backend (PHP) selecciona según `?ref=` | **Frontend** (JavaScript) con `fetch()` a `get_telefono.php` |
| Admin puede deshabilitar afiliados | Sí, puede activar/desactivar | **No implementado.** El admin solo genera códigos |
| Configuración de entorno | Variables de entorno | **No existe.** Credenciales hardcodeadas en archivos PHP |
| Enlace de afiliado por producto | `tienda.com/producto/zapatos?ref=CODIGO` | Enlace único genérico a homepage: `tienda.com/?a=ID` |

### ❌ Lo que no está implementado (y estaba en la descripción)

- **Deshabilitar afiliados** por parte del admin.
- **Número de WhatsApp de respaldo del administrador.**
- **Per-product affiliate links** (el afiliado debería poder compartir
  enlaces a productos específicos).
- **Lista de afiliados** visible para el admin con sus números.

### ➕ Lo que el código tiene y no estaba en la descripción

- Sistema de **banners** con carrusel en la página principal.
- **Buscador de productos** con búsqueda por nombre, descripción
  y categoría.
- **Categorías** de productos con navegación.
- **Opciones de envío** por producto (gratis, pago online, recojo).
- **Stock manual** por producto.
- **Cookie de afiliado con 90 días de persistencia.**
- **Función `a()`** que mantiene el parámetro de afiliado en todos
  los enlaces de la tienda.
- **Modal de compra** con formulario (nombre + método de pago) antes
  de redirigir a WhatsApp.
- **Panel admin con secciones**: Dashboard, Productos, Categorías,
  Afiliados, Banners.
- **Protección CSRF** en el panel de administración.
- **Marca de agua "E-M Store"** en el mensaje de WhatsApp.

---

## 9. Validación final

> Este proyecto versión 1.5 funciona de la manera descrita en la
> sección 4 de este documento. El código real ha sido analizado y
> coincide sustancialmente con la lógica esperada, aunque existen
> diferencias importantes en los detalles de implementación (formato
> del parámetro URL, método de autenticación del afiliado, ausencia
> de número de respaldo del administrador y falta de per-product
> affiliate links). El proyecto tiene una base sólida y está listo
> para futuras actualizaciones. Se recomienda conservar la arquitectura
> actual para cualquier extensión futura.

---

## 10. Anexo: estructura de base de datos detectada

A continuación se lista la estructura de cada tabla inferida a partir
de las consultas SQL presentes en el código. No existe un archivo de
migración o schema.sql en el repositorio.

### Tabla: `categorias`

| Columna | Tipo inferido | Uso |
|---------|--------------|-----|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `nombre` | VARCHAR(255) | Nombre de la categoría |
| `activo` | TINYINT(1) | 1 = activa, 0 = eliminada |
| `fecha_creado` | DATETIME | Fecha de creación |

### Tabla: `productos`

| Columna | Tipo inferido | Uso |
|---------|--------------|-----|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `categoria_id` | INT (FK → categorias.id) | Categoría del producto |
| `nombre` | VARCHAR(255) | Nombre del producto |
| `descripcion` | TEXT | Descripción detallada |
| `precio` | DECIMAL(10,2) | Precio de venta |
| `precio_original` | DECIMAL(10,2) | Precio original (para mostrar descuento) |
| `stock` | INT | Cantidad disponible |
| `precio_envio` | DECIMAL(10,2) | Costo de envío |
| `envio_opciones` | VARCHAR(100) | Opciones separadas por coma: gratis, online, recojo |
| `imagen` | VARCHAR(255) | Nombre del archivo en `uploads/` |
| `activo` | TINYINT(1) | 1 = visible, 0 = oculto |
| `fecha_creado` | DATETIME | Fecha de creación |

### Tabla: `usuarios_afiliados`

| Columna | Tipo inferido | Uso |
|---------|--------------|-----|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `nombre` | VARCHAR(255) | Nombre del afiliado |
| `email` | VARCHAR(255) | Email (usado para login) |
| `telefono` | VARCHAR(20) | Número de WhatsApp (solo dígitos, sin prefijo) |
| `password` | VARCHAR(255) | Hash bcrypt de la contraseña |
| `codigo_uso` | VARCHAR(10) | Código de invitación usado al registrarse |
| `link_personal` | VARCHAR(500) | Enlace de afiliado generado automáticamente |

### Tabla: `afiliados_codigos`

| Columna | Tipo inferido | Uso |
|---------|--------------|-----|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `codigo` | VARCHAR(10) | Código alfanumérico de 8 caracteres |
| `usado` | TINYINT(1) | 0 = disponible, 1 = usado |
| `usado_por` | VARCHAR(255) | Email del afiliado que lo usó |
| `fecha_uso` | DATETIME | Cuándo se usó |
| `fecha_creacion` | DATETIME | Fecha de creación del código |

### Tabla: `admins`

| Columna | Tipo inferido | Uso |
|---------|--------------|-----|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `username` | VARCHAR(50) | Nombre de usuario admin |
| `password_hash` | VARCHAR(255) | Hash bcrypt de la contraseña |
| `last_login` | DATETIME | Último inicio de sesión |

### Tabla: `banner_simple`

| Columna | Tipo inferido | Uso |
|---------|--------------|-----|
| `id` | INT (PK, AUTO_INCREMENT) | Identificador único |
| `imagen` | VARCHAR(255) | Nombre del archivo en `uploads/` |
| `producto_id` | INT (FK → productos.id, nullable) | Producto al que enlaza |
| `activo` | TINYINT(1) | 1 = visible |
| `orden` | INT | Orden de aparición |

---

*Documentación generada a partir del análisis del código fuente(PC local)
