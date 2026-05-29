<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config.php';
require_admin();

$section = $_GET['section'] ?? 'dashboard';
$msg = '';
$error = '';

// ========== PROCESAMIENTO DE ACCIONES ==========

// --- PRODUCTOS ---
if ($section === 'productos' && $_POST) {
    if (isset($_POST['agregar_producto'])) {
        $nombre = trim($conn->real_escape_string($_POST['nombre']));
        $descripcion = $conn->real_escape_string($_POST['descripcion']);
        $precio_original = !empty($_POST['precio_original']) ? floatval($_POST['precio_original']) : null;
        $precio = floatval($_POST['precio']);
        $stock = intval($_POST['stock']);
        $precio_envio = floatval($_POST['precio_envio']);
        $categoria_id = !empty($_POST['categoria_id']) ? intval($_POST['categoria_id']) : null;
        
        if ($precio_original !== null && $precio_original <= $precio) {
            $error = "El precio original debe ser mayor al precio.";
        } else {
            $envio_opciones = '';
            if (!empty($_POST['envio_gratis'])) $envio_opciones .= 'gratis,';
            if (!empty($_POST['envio_online'])) $envio_opciones .= 'online,';
            if (!empty($_POST['envio_recojo'])) $envio_opciones .= 'recojo,';
            $envio_opciones = rtrim($envio_opciones, ',');
            
            $upload_dir = dirname(__DIR__) . '/uploads';
            $imagen = '';
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
                $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                if (in_array($ext, $allowed) && $_FILES['imagen']['size'] <= 3*1024*1024) {
                    $imagen = time() . '_' . rand(1000,9999) . '.' . $ext;
                    $ruta = $upload_dir . '/' . $imagen;
                    if (!move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta)) {
                        $error = "Error al subir imagen.";
                        $imagen = '';
                    }
                }
            }
            
            if (!$error && $imagen) {
                $stmt = $conn->prepare("INSERT INTO productos (categoria_id, nombre, descripcion, precio, precio_original, stock, precio_envio, envio_opciones, imagen, activo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
                $stmt->bind_param("issdisdss", $categoria_id, $nombre, $descripcion, $precio, $precio_original, $stock, $precio_envio, $envio_opciones, $imagen);
                if ($stmt->execute()) {
                    $msg = "Producto agregado correctamente.";
                } else {
                    $error = "Error al guardar producto.";
                }
                $stmt->close();
            } elseif (!$imagen && !$error) {
                $error = "Sube una imagen.";
            }
        }
    }
    
    if (isset($_POST['actualizar_producto'])) {
        $id = intval($_POST['id']);
        $nombre = trim($conn->real_escape_string($_POST['nombre']));
        $descripcion = $conn->real_escape_string($_POST['descripcion']);
        $precio_original = !empty($_POST['precio_original']) ? floatval($_POST['precio_original']) : null;
        $precio = floatval($_POST['precio']);
        $stock = intval($_POST['stock']);
        $precio_envio = floatval($_POST['precio_envio']);
        $categoria_id = !empty($_POST['categoria_id']) ? intval($_POST['categoria_id']) : null;
        
        if ($precio_original !== null && $precio_original <= $precio) {
            $error = "El precio original debe ser mayor al precio.";
        } else {
            $envio_opciones = '';
            if (!empty($_POST['envio_gratis'])) $envio_opciones .= 'gratis,';
            if (!empty($_POST['envio_online'])) $envio_opciones .= 'online,';
            if (!empty($_POST['envio_recojo'])) $envio_opciones .= 'recojo,';
            $envio_opciones = rtrim($envio_opciones, ',');
            
            $producto_actual = $conn->query("SELECT imagen FROM productos WHERE id = $id")->fetch_assoc();
            $imagen = $producto_actual['imagen'];
            
            if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] == 0) {
                $ext = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
                $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                if (in_array($ext, $allowed) && $_FILES['imagen']['size'] <= 3*1024*1024) {
                    $imagen = time() . '_' . rand(1000,9999) . '.' . $ext;
                    $ruta = dirname(__DIR__) . '/uploads/' . $imagen;
                    if (move_uploaded_file($_FILES['imagen']['tmp_name'], $ruta)) {
                        @unlink(dirname(__DIR__) . '/uploads/' . $producto_actual['imagen']);
                    }
                }
            }
            
            $stmt = $conn->prepare("UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, precio_original=?, stock=?, precio_envio=?, envio_opciones=?, imagen=? WHERE id=?");
            $stmt->bind_param("issdisdssi", $categoria_id, $nombre, $descripcion, $precio, $precio_original, $stock, $precio_envio, $envio_opciones, $imagen, $id);
            if ($stmt->execute()) {
                $msg = "Producto actualizado.";
            } else {
                $error = "Error al actualizar.";
            }
            $stmt->close();
        }
    }
}

// --- CATEGORÍAS ---
if ($section === 'categorias' && $_POST) {
    if (isset($_POST['agregar_categoria'])) {
        $nombre = trim($conn->real_escape_string($_POST['nombre']));
        if (!empty($nombre)) {
            $check = $conn->query("SELECT id FROM categorias WHERE nombre = '$nombre' AND activo = 1");
            if ($check->num_rows == 0) {
                $conn->query("INSERT INTO categorias (nombre, activo) VALUES ('$nombre', 1)");
                $msg = "Categoría agregada.";
            } else {
                $error = "La categoría ya existe.";
            }
        }
    }
    
    if (isset($_POST['editar_categoria'])) {
        $id = intval($_POST['id']);
        $nombre = trim($conn->real_escape_string($_POST['nombre']));
        if (!empty($nombre) && $id > 0) {
            $conn->query("UPDATE categorias SET nombre = '$nombre' WHERE id = $id");
            $msg = "Categoría actualizada.";
        }
    }
    
    if (isset($_GET['eliminar_categoria'])) {
        $id = intval($_GET['eliminar_categoria']);
        $check = $conn->query("SELECT COUNT(*) as total FROM productos WHERE categoria_id = $id AND activo = 1")->fetch_assoc();
        if ($check['total'] == 0) {
            $conn->query("UPDATE categorias SET activo = 0 WHERE id = $id");
            $msg = "Categoría eliminada.";
        } else {
            $error = "No se puede eliminar: tiene productos.";
        }
        header("Location: ?section=categorias");
        exit;
    }
}

// --- AFILIADOS ---
if ($section === 'afiliados' && $_POST) {
    if (isset($_POST['generar_codigo'])) {
        do {
            $codigo = substr(str_shuffle("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"), 0, 8);
            $check = $conn->query("SELECT id FROM afiliados_codigos WHERE codigo='$codigo'")->num_rows;
        } while ($check > 0);
        $conn->query("INSERT INTO afiliados_codigos (codigo) VALUES ('$codigo')");
        $msg = "Código generado: $codigo";
    }
}

// --- BANNERS ---
if (isset($_POST['agregar_banner']) && verify_csrf($_POST['csrf_token'])) {
    $img = basename($_FILES['imagen']['name']);
    $target = dirname(__DIR__) . '/uploads/' . $img;
    if(move_uploaded_file($_FILES['imagen']['tmp_name'], $target)) {
        $pid = !empty($_POST['producto_id']) ? intval($_POST['producto_id']) : null;
        $stmt = $conn->prepare("INSERT INTO banner_simple (imagen, producto_id) VALUES (?, ?)");
        $stmt->bind_param("si", $img, $pid);
        $stmt->execute();
        $stmt->close();
        $msg = "Banner agregado.";
    }
}

if (isset($_GET['eliminar_banner']) && isset($_GET['token']) && verify_csrf($_GET['token'])) {
    $id = intval($_GET['eliminar_banner']);
    $stmt = $conn->prepare("DELETE FROM banner_simple WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->close();
    header("Location: ?section=banners");
    exit;
}

// --- ELIMINAR PRODUCTO ---
if (isset($_GET['eliminar_producto']) && isset($_GET['token']) && verify_csrf($_GET['token'])) {
    $id = intval($_GET['eliminar_producto']);
    $producto = $conn->query("SELECT imagen FROM productos WHERE id = $id")->fetch_assoc();
    if ($producto) {
        @unlink(dirname(__DIR__) . '/uploads/' . $producto['imagen']);
        $conn->query("DELETE FROM productos WHERE id = $id");
        $msg = "Producto eliminado.";
    }
    header("Location: ?section=productos");
    exit;
}

// --- OBTENER DATOS ---
$cat_count = $conn->query("SELECT COUNT(*) as total FROM categorias WHERE activo = 1")->fetch_assoc()['total'];
$prod_count = $conn->query("SELECT COUNT(*) as total FROM productos WHERE activo = 1")->fetch_assoc()['total'];
$delete_token = csrf_token();

$edit_producto = null;
if ($section === 'productos' && isset($_GET['editar'])) {
    $id = intval($_GET['editar']);
    $edit_producto = $conn->query("SELECT * FROM productos WHERE id = $id")->fetch_assoc();
}

$edit_categoria = null;
if ($section === 'categorias' && isset($_GET['editar'])) {
    $id = intval($_GET['editar']);
    $edit_categoria = $conn->query("SELECT * FROM categorias WHERE id = $id AND activo = 1")->fetch_assoc();
}

// --- ACTIVIDAD RECIENTE ---
$actividades = [];
$recent_products = $conn->query("SELECT id, nombre, fecha_creado FROM productos WHERE activo = 1 ORDER BY fecha_creado DESC LIMIT 5");
while ($p = $recent_products->fetch_assoc()) {
    $actividades[] = [
        'tipo' => 'producto',
        'nombre' => $p['nombre'],
        'fecha' => $p['fecha_creado'],
        'icono' => 'bi-box-seam',
        'color' => 'bg-success'
    ];
}
$recent_categorias = $conn->query("SELECT id, nombre, fecha_creado FROM categorias WHERE activo = 1 ORDER BY fecha_creado DESC LIMIT 5");
while ($c = $recent_categorias->fetch_assoc()) {
    $actividades[] = [
        'tipo' => 'categoria',
        'nombre' => $c['nombre'],
        'fecha' => $c['fecha_creado'],
        'icono' => 'bi-tag',
        'color' => 'bg-primary'
    ];
}
usort($actividades, function($a, $b) {
    return strtotime($b['fecha']) - strtotime($a['fecha']);
});
$actividades = array_slice($actividades, 0, 8);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - E-M Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link rel="stylesheet" href="css/dashboard.css">
</head>
<body>

<div class="container-fluid">
    <div class="row">
        <!-- SIDEBAR (solo visible en PC) -->
        <nav class="col-md-3 col-lg-2 d-md-block sidebar">
            <div class="position-sticky pt-3">
                <div class="text-center mb-4">
                    <h4 class="text-white fw-bold"><i class="bi bi-shop"></i> E-M Store</h4>
                    <small class="text-white-50">Panel Admin</small>
                </div>
                <ul class="nav flex-column">
                    <li class="nav-item">
                        <a class="nav-link <?php echo $section === 'dashboard' ? 'active' : ''; ?>" href="?section=dashboard">
                            <i class="bi bi-speedometer2"></i> Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $section === 'productos' ? 'active' : ''; ?>" href="?section=productos">
                            <i class="bi bi-box-seam"></i> Productos
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $section === 'categorias' ? 'active' : ''; ?>" href="?section=categorias">
                            <i class="bi bi-tags"></i> Categorías
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $section === 'afiliados' ? 'active' : ''; ?>" href="?section=afiliados">
                            <i class="bi bi-people"></i> Afiliados
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link <?php echo $section === 'banners' ? 'active' : ''; ?>" href="?section=banners">
                            <i class="bi bi-images"></i> Banners
                        </a>
                    </li>
                    <li class="nav-item mt-4">
                        <a class="nav-link" href="../index.php" target="_blank">
                            <i class="bi bi-box-arrow-up-right"></i> Ver Tienda
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="logout.php">
                            <i class="bi bi-box-arrow-left"></i> Cerrar Sesión
                        </a>
                    </li>
                </ul>
            </div>
        </nav>

        <!-- CONTENIDO PRINCIPAL -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4 py-4">
            
            <!-- MENSAJES -->
            <?php if($msg): ?>
                <div class="alert alert-success alert-dismissible fade show">
                    <i class="bi bi-check-circle"></i> <?php echo $msg; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>
            <?php if($error): ?>
                <div class="alert alert-danger alert-dismissible fade show">
                    <i class="bi bi-exclamation-triangle"></i> <?php echo $error; ?>
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            <?php endif; ?>

            <!-- ========== DASHBOARD ========== -->
            <?php if($section === 'dashboard'): ?>
                <h4 class="mb-4 fw-bold"><i class="bi bi-speedometer2"></i> Dashboard</h4>
                
                <div class="row g-3 mb-4">
                    <div class="col-6 col-md-3">
                        <div class="card stat-card bg-danger text-white h-100">
                            <div class="card-body text-center">
                                <i class="bi bi-tags fs-1 opacity-75"></i>
                                <h4 class="mt-2 fw-bold"><?php echo $cat_count; ?></h4>
                                <small>Categorías</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="card stat-card bg-success text-white h-100">
                            <div class="card-body text-center">
                                <i class="bi bi-box-seam fs-1 opacity-75"></i>
                                <h4 class="mt-2 fw-bold"><?php echo $prod_count; ?></h4>
                                <small>Productos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="card stat-card bg-primary text-white h-100">
                            <div class="card-body text-center">
                                <i class="bi bi-cart-check fs-1 opacity-75"></i>
                                <h4 class="mt-2 fw-bold">0</h4>
                                <small>Pedidos</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-6 col-md-3">
                        <div class="card stat-card bg-warning text-dark h-100">
                            <div class="card-body text-center">
                                <i class="bi bi-currency-dollar fs-1 opacity-75"></i>
                                <h4 class="mt-2 fw-bold">Bs. 0</h4>
                                <small>Ventas</small>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-white">
                        <h5 class="mb-0 fw-bold"><i class="bi bi-lightning text-danger"></i> Acciones Rápidas</h5>
                    </div>
                    <div class="card-body">
                        <div class="d-flex flex-wrap gap-2 quick-actions">
                            <a href="?section=productos" class="btn btn-danger"><i class="bi bi-plus-circle"></i> Nuevo Producto</a>
                            <a href="?section=categorias" class="btn btn-outline-danger"><i class="bi bi-tag"></i> Nueva Categoría</a>
                            <a href="?section=afiliados" class="btn btn-outline-primary"><i class="bi bi-person-plus"></i> Código Afiliado</a>
                            <a href="../index.php" class="btn btn-outline-success" target="_blank"><i class="bi bi-shop"></i> Ver Tienda</a>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mt-4">
                    <div class="card-header bg-white">
                        <h5 class="mb-0 fw-bold"><i class="bi bi-clock-history text-danger"></i> Actividad Reciente</h5>
                    </div>
                    <div class="card-body">
                        <?php if(empty($actividades)): ?>
                            <p class="text-muted mb-0">Sin actividad reciente</p>
                        <?php else: ?>
                            <div class="activity-list">
                                <?php foreach($actividades as $act): ?>
                                    <div class="activity-item d-flex align-items-center">
                                        <span class="activity-icon <?php echo $act['color']; ?> text-white">
                                            <i class="bi <?php echo $act['icono']; ?>"></i>
                                        </span>
                                        <div class="flex-grow-1">
                                            <div class="fw-medium"><?php echo htmlspecialchars($act['nombre']); ?></div>
                                            <div class="activity-time">
                                                <?php echo $act['tipo'] === 'producto' ? 'Producto agregado' : 'Categoría creada'; ?> · 
                                                <?php echo date('d/m H:i', strtotime($act['fecha'])); ?>
                                            </div>
                                        </div>
                                    </div>
                                <?php endforeach; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endif; ?>

            <!-- ========== PRODUCTOS ========== -->
            <?php if($section === 'productos'): ?>
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="mb-0 fw-bold"><i class="bi bi-box-seam"></i> <?php echo $edit_producto ? 'Editar' : 'Nuevo'; ?> Producto</h4>
                    <a href="?section=productos" class="btn btn-outline-secondary btn-sm"><?php echo $edit_producto ? 'Cancelar' : '+ Nuevo'; ?></a>
                </div>

                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-<?php echo $edit_producto ? 'warning' : 'danger'; ?> text-<?php echo $edit_producto ? 'dark' : 'white'; ?>">
                        <h5 class="mb-0"><i class="bi bi-<?php echo $edit_producto ? 'pencil' : 'plus-circle'; ?>"></i> 
                        <?php echo $edit_producto ? 'Editar Producto' : 'Agregar Producto'; ?></h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="id" value="<?php echo $edit_producto['id'] ?? ''; ?>">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Nombre</label>
                                    <input type="text" name="nombre" class="form-control" value="<?php echo $edit_producto['nombre'] ?? ''; ?>" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Categoría</label>
                                    <select name="categoria_id" class="form-select">
                                        <option value="">Sin categoría</option>
                                        <?php
                                        $cats = $conn->query("SELECT * FROM categorias WHERE activo = 1 ORDER BY nombre");
                                        while($c = $cats->fetch_assoc()): ?>
                                            <option value="<?php echo $c['id']; ?>" <?php echo ($edit_producto['categoria_id'] ?? '') == $c['id'] ? 'selected' : ''; ?>>
                                                <?php echo htmlspecialchars($c['nombre']); ?>
                                            </option>
                                        <?php endwhile; ?>
                                    </select>
                                </div>
                            </div>
                            <div class="mt-3">
                                <label class="form-label">Descripción</label>
                                <textarea name="descripcion" class="form-control" rows="3"><?php echo $edit_producto['descripcion'] ?? ''; ?></textarea>
                            </div>
                            <div class="row mt-3 g-3">
                                <div class="col-md-4">
                                    <label class="form-label text-success fw-bold">Precio Original</label>
                                    <input type="number" step="0.01" name="precio_original" class="form-control border-success" value="<?php echo $edit_producto['precio_original'] ?? ''; ?>">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label text-danger fw-bold">Precio (Bs.)</label>
                                    <input type="number" step="0.01" name="precio" class="form-control border-danger" value="<?php echo $edit_producto['precio'] ?? ''; ?>" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Stock</label>
                                    <input type="number" name="stock" class="form-control" value="<?php echo $edit_producto['stock'] ?? 10; ?>" required>
                                </div>
                            </div>
                            <div class="row mt-3 g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Envío (Bs.)</label>
                                    <input type="number" step="0.01" name="precio_envio" class="form-control" value="<?php echo $edit_producto['precio_envio'] ?? 0; ?>">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Opciones de Entrega</label>
                                    <?php $ops = explode(',', $edit_producto['envio_opciones'] ?? ''); ?>
                                    <div class="form-check"><input class="form-check-input" type="checkbox" name="envio_gratis" <?php echo in_array('gratis', $ops) ? 'checked' : ''; ?>><label class="form-check-label">Envío Gratis</label></div>
                                    <div class="form-check"><input class="form-check-input" type="checkbox" name="envio_online" <?php echo in_array('online', $ops) ? 'checked' : ''; ?>><label class="form-check-label">Pago Online</label></div>
                                    <div class="form-check"><input class="form-check-input" type="checkbox" name="envio_recojo" <?php echo in_array('recojo', $ops) ? 'checked' : ''; ?>><label class="form-check-label">Recojo en Tienda</label></div>
                                </div>
                            </div>
                            <div class="mt-3">
                                <label class="form-label">Imagen</label>
                                <?php if($edit_producto): ?>
                                    <img src="../uploads/<?php echo $edit_producto['imagen']; ?>" width="80" class="rounded mb-2">
                                <?php endif; ?>
                                <input type="file" name="imagen" class="form-control" accept="image/*" <?php echo $edit_producto ? '' : 'required'; ?>>
                            </div>
                            <div class="mt-4">
                                <button type="submit" name="<?php echo $edit_producto ? 'actualizar_producto' : 'agregar_producto'; ?>" class="btn btn-<?php echo $edit_producto ? 'warning' : 'danger'; ?> btn-lg">
                                    <i class="bi bi-check-circle"></i> <?php echo $edit_producto ? 'Actualizar' : 'Guardar'; ?> Producto
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- LISTA DE PRODUCTOS -->
                <?php 
                $show_all_products = isset($_GET['mostrar_todos']);
                $total_products = $conn->query("SELECT COUNT(*) as total FROM productos WHERE activo = 1")->fetch_assoc()['total'];
                $sql = $show_all_products 
                    ? "SELECT * FROM productos WHERE activo = 1 ORDER BY fecha_creado DESC" 
                    : "SELECT * FROM productos WHERE activo = 1 ORDER BY fecha_creado DESC LIMIT 10";
                $productos = $conn->query($sql);
                ?>
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 class="mb-0"><i class="bi bi-list"></i> Productos Existentes (<?php echo $total_products; ?>)</h5>
                        <?php if($total_products > 10 && !$show_all_products): ?>
                            <a href="?section=productos&mostrar_todos=1" class="btn btn-sm btn-outline-light">
                                <i class="bi bi-eye"></i> Ver todos los productos
                            </a>
                        <?php elseif($show_all_products): ?>
                            <a href="?section=productos" class="btn btn-sm btn-outline-light">
                                <i class="bi bi-eye-slash"></i> Ver menos
                            </a>
                        <?php endif; ?>
                    </div>
                    <div class="card-body p-0">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr><th>Imagen</th><th>Producto</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr>
                                </thead>
                                <tbody>
                                    <?php
                                    if($productos->num_rows == 0): ?>
                                        <tr><td colspan="5" class="text-center text-muted py-4">Sin productos</td></tr>
                                    <?php else: while($p = $productos->fetch_assoc()): ?>
                                        <tr>
                                            <td><img src="../uploads/<?php echo $p['imagen']; ?>" width="45" height="45" class="rounded"></td>
                                            <td><?php echo htmlspecialchars($p['nombre']); ?></td>
                                            <td><strong class="text-danger">Bs. <?php echo number_format($p['precio'],0); ?></strong></td>
                                            <td><span class="badge bg-<?php echo $p['stock'] > 0 ? 'success' : 'secondary'; ?>"><?php echo $p['stock']; ?></span></td>
                                            <td>
                                                <a href="?section=productos&editar=<?php echo $p['id']; ?>" class="btn btn-sm btn-warning"><i class="bi bi-pencil"></i></a>
                                                <a href="?section=productos&eliminar_producto=<?php echo $p['id']; ?>&token=<?php echo $delete_token; ?>" class="btn btn-sm btn-danger" onclick="return confirm('¿Eliminar?')"><i class="bi bi-trash"></i></a>
                                            </td>
                                        </tr>
                                    <?php endwhile; endif; ?>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- ========== CATEGORÍAS ========== -->
            <?php if($section === 'categorias'): ?>
                <h4 class="mb-4 fw-bold"><i class="bi bi-tags"></i> Categorías</h4>
                
                <div class="row">
                    <div class="col-md-5">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-danger text-white">
                                <h5 class="mb-0"><i class="bi bi-<?php echo $edit_categoria ? 'pencil' : 'plus-circle'; ?>"></i> 
                                <?php echo $edit_categoria ? 'Editar' : 'Nueva'; ?> Categoría</h5>
                            </div>
                            <div class="card-body">
                                <form method="POST">
                                    <input type="hidden" name="id" value="<?php echo $edit_categoria['id'] ?? ''; ?>">
                                    <div class="mb-3">
                                        <label class="form-label">Nombre</label>
                                        <input type="text" name="nombre" class="form-control" value="<?php echo $edit_categoria['nombre'] ?? ''; ?>" required>
                                    </div>
                                    <button type="submit" name="<?php echo $edit_categoria ? 'editar_categoria' : 'agregar_categoria'; ?>" class="btn btn-<?php echo $edit_categoria ? 'warning' : 'danger'; ?>">
                                        <i class="bi bi-check-circle"></i> <?php echo $edit_categoria ? 'Actualizar' : 'Agregar'; ?>
                                    </button>
                                    <?php if($edit_categoria): ?>
                                        <a href="?section=categorias" class="btn btn-secondary">Cancelar</a>
                                    <?php endif; ?>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-7">
                        <div class="card border-0 shadow-sm">
                            <div class="card-header bg-dark text-white">
                                <h5 class="mb-0"><i class="bi bi-list-ul"></i> Categorías Existentes</h5>
                            </div>
                            <div class="card-body p-0">
                                <ul class="list-group list-group-flush">
                                    <?php
                                    $cats = $conn->query("SELECT c.*, COUNT(p.id) as productos FROM categorias c LEFT JOIN productos p ON c.id = p.categoria_id AND p.activo = 1 WHERE c.activo = 1 GROUP BY c.id ORDER BY c.nombre");
                                    if($cats->num_rows == 0): ?>
                                        <li class="list-group-item text-center text-muted">Sin categorías</li>
                                    <?php else: while($c = $cats->fetch_assoc()): ?>
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong><?php echo htmlspecialchars($c['nombre']); ?></strong>
                                                <?php if($c['productos'] > 0): ?>
                                                    <span class="badge bg-primary rounded-pill"><?php echo $c['productos']; ?></span>
                                                <?php endif; ?>
                                            </div>
                                            <div>
                                                <a href="?section=categorias&editar=<?php echo $c['id']; ?>" class="btn btn-sm btn-warning"><i class="bi bi-pencil"></i></a>
                                                <a href="?section=categorias&eliminar_categoria=<?php echo $c['id']; ?>" class="btn btn-sm btn-danger" onclick="return confirm('¿Eliminar?')"><i class="bi bi-trash"></i></a>
                                            </div>
                                        </li>
                                    <?php endwhile; endif; ?>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>

            <!-- ========== AFILIADOS ========== -->
            <?php if($section === 'afiliados'): ?>
                <h4 class="mb-4 fw-bold"><i class="bi bi-people"></i> Códigos de Afiliados</h4>
                
                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-danger text-white">
                        <h5 class="mb-0"><i class="bi bi-plus-circle"></i> Generar Código</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST">
                            <button type="submit" name="generar_codigo" class="btn btn-danger btn-lg">
                                <i class="bi bi-plus-circle"></i> Generar Nuevo Código
                            </button>
                        </form>
                    </div>
                </div>

                <div class="card border-0 shadow-sm mt-4">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0"><i class="bi bi-list"></i> Códigos Generados</h5>
                    </div>
                    <div class="card-body p-0">
                        <table class="table table-striped mb-0">
                            <thead><tr><th>Código</th><th>Fecha</th><th>Estado</th><th>Usado por</th></tr></thead>
                            <tbody>
                                <?php
                                $codigos = $conn->query("SELECT * FROM afiliados_codigos ORDER BY fecha_creacion DESC");
                                if($codigos->num_rows == 0): ?>
                                    <tr><td colspan="4" class="text-center text-muted">Sin códigos</td></tr>
                                <?php else: while($c = $codigos->fetch_assoc()): ?>
                                    <tr class="<?php echo $c['usado'] ? 'table-success' : ''; ?>">
                                        <td><strong><?php echo $c['codigo']; ?></strong></td>
                                        <td><?php echo date('d/m/Y', strtotime($c['fecha_creacion'])); ?></td>
                                        <td><?php echo $c['usado'] ? 'USADO' : 'DISPONIBLE'; ?></td>
                                        <td><?php echo $c['usado_por'] ?: '-'; ?></td>
                                    </tr>
                                <?php endwhile; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

            <!-- ========== BANNERS ========== -->
            <?php if($section === 'banners'): ?>
                <h4 class="mb-4 fw-bold"><i class="bi bi-images"></i> Banners Principal</h4>
                
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0"><i class="bi bi-upload"></i> Subir Banner</h5>
                    </div>
                    <div class="card-body">
                        <form method="POST" enctype="multipart/form-data">
                            <input type="hidden" name="csrf_token" value="<?php echo csrf_token(); ?>">
                            <div class="row g-3 align-items-end">
                                <div class="col-md-4">
                                    <label class="form-label">Imagen</label>
                                    <input type="file" name="imagen" class="form-control" accept="image/*" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Enlazar a producto</label>
                                    <select name="producto_id" class="form-select">
                                        <option value="">Sin enlace</option>
                                        <?php
                                        $prods = $conn->query("SELECT id, nombre FROM productos WHERE activo=1 ORDER BY nombre");
                                        while($p = $prods->fetch_assoc()): ?>
                                            <option value="<?php echo $p['id']; ?>"><?php echo htmlspecialchars($p['nombre']); ?></option>
                                        <?php endwhile; ?>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <button type="submit" name="agregar_banner" class="btn btn-success w-100"><i class="bi bi-upload"></i> Subir</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="card-header bg-dark text-white">
                        <h5 class="mb-0"><i class="bi bi-images"></i> Banners Existentes</h5>
                    </div>
                    <div class="card-body p-0">
                        <table class="table mb-0">
                            <thead><tr><th>Imagen</th><th>Enlace</th><th>Acción</th></tr></thead>
                            <tbody>
                                <?php
                                $banners = $conn->query("SELECT bs.*, p.nombre as prod_nombre FROM banner_simple bs LEFT JOIN productos p ON bs.producto_id=p.id WHERE bs.activo=1 ORDER BY bs.id DESC");
                                if($banners->num_rows == 0): ?>
                                    <tr><td colspan="3" class="text-center text-muted">Sin banners</td></tr>
                                <?php else: while($b = $banners->fetch_assoc()): ?>
                                    <tr>
                                        <td><img src="../uploads/<?php echo $b['imagen']; ?>" class="banner-preview rounded"></td>
                                        <td><?php echo $b['prod_nombre'] ? htmlspecialchars($b['prod_nombre']) : '<em class="text-muted">Sin enlace</em>'; ?></td>
                                        <td><a href="?section=banners&eliminar_banner=<?php echo $b['id']; ?>&token=<?php echo $delete_token; ?>" class="btn btn-sm btn-danger" onclick="return confirm('¿Eliminar?')"><i class="bi bi-trash"></i></a></td>
                                    </tr>
                                <?php endwhile; endif; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            <?php endif; ?>

            <footer class="text-center mt-5 text-muted d-none d-md-block">
                <small>&copy; 2026 <strong>E-M Store</strong> · Panel Admin</small>
            </footer>
        </main>
    </div>
</div>

<!-- Menú inferior estilo App Móvil (solo móvil) -->
<nav class="bottom-nav">
    <ul class="bottom-nav-items">
        <li>
            <a href="?section=dashboard" class="bottom-nav-item <?php echo $section === 'dashboard' ? 'active' : ''; ?>">
                <i class="bi bi-house-fill"></i>
                <span>Dashboard</span>
            </a>
        </li>
        <li>
            <a href="?section=productos" class="bottom-nav-item <?php echo $section === 'productos' ? 'active' : ''; ?>">
                <i class="bi bi-box-seam-fill"></i>
                <span>Productos</span>
            </a>
        </li>
        <li>
            <a href="?section=categorias" class="bottom-nav-item <?php echo $section === 'categorias' ? 'active' : ''; ?>">
                <i class="bi bi-tags-fill"></i>
                <span>Categorías</span>
            </a>
        </li>
        <li>
            <div class="bottom-nav-item" onclick="toggleDropdown(this)">
                <i class="bi bi-lightning-fill"></i>
                <span>Acciones</span>
            </div>
            <ul class="bottom-nav-dropdown">
                <li><a href="?section=afiliados"><i class="bi bi-people-fill"></i> Afiliados</a></li>
                <li><a href="?section=banners"><i class="bi bi-images"></i> Banners</a></li>
            </ul>
        </li>
        <li>
            <div class="bottom-nav-item" onclick="toggleDropdown(this)">
                <i class="bi bi-gear-fill"></i>
                <span>Ajustes</span>
            </div>
            <ul class="bottom-nav-dropdown">
                <li><a href="../index.php" target="_blank"><i class="bi bi-shop"></i> Ver Tienda</a></li>
                <li><a href="logout.php"><i class="bi bi-box-arrow-left"></i> Cerrar Sesión</a></li>
            </ul>
        </li>
    </ul>
</nav>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
function toggleDropdown(el) {
    var dropdown = el.nextElementSibling;
    var allDropdowns = document.querySelectorAll('.bottom-nav-dropdown');
    allDropdowns.forEach(function(d) {
        if (d !== dropdown) d.classList.remove('show');
    });
    dropdown.classList.toggle('show');
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.bottom-nav-item') && !e.target.closest('.bottom-nav-dropdown')) {
        document.querySelectorAll('.bottom-nav-dropdown').forEach(function(d) {
            d.classList.remove('show');
        });
    }
});
</script>
</body>
</html>
