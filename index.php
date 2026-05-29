<?php
error_reporting(E_ALL); ini_set('display_errors',1);
$conn = new mysqli('sql211.infinityfree.com','if0_40484505','UkDbh26YEo','if0_40484505_em_store');
if($conn->connect_error) die("<div style='text-align:center;padding:100px;background:#f8f9fa'><h1 style='color:#d60000'>Mantenimiento</h1><p>Volvemos en unos minutos...</p></div>");
$categorias = $conn->query("SELECT * FROM categorias WHERE activo=1 ORDER BY nombre") or die("Error categorías");
// ============= AFILIADO INDESTRUCTIBLE - 90 DÍAS =============
$afiliado_id = $_GET['a'] ?? $_COOKIE['afiliado_id'] ?? null;
if ($afiliado_id && !isset($_COOKIE['afiliado_id'])) {
    setcookie('afiliado_id', $afiliado_id, time() + (86400 * 90), "/");
    $_COOKIE['afiliado_id'] = $afiliado_id;
}

// Función para mantener ?a= en TODOS los enlaces
function a($url = '') {
    $afiliado = $_COOKIE['afiliado_id'] ?? null;
    if ($afiliado) {
        $sep = strpos($url, '?') === false ? '?' : '&';
        return $url . $sep . 'a=' . $afiliado;
    }
    return $url;
}
// === BUSCADOR FUNCIONAL ===
$buscar = trim($_GET['buscar'] ?? '');
$resultados_busqueda = [];
if ($buscar !== '' && strlen($buscar) >= 2) {
    $like = "%" . $conn->real_escape_string($buscar) . "%";
    $resultados_busqueda = [];
    $ids_encontrados = [];
    
    // Buscar por nombre del producto
    $stmt1 = $conn->prepare("SELECT id FROM productos WHERE activo=1 AND nombre LIKE ?");
    $stmt1->bind_param("s", $like);
    $stmt1->execute();
    $res1 = $stmt1->get_result();
    while($row = $res1->fetch_assoc()) {
        if (!in_array($row['id'], $ids_encontrados)) {
            $ids_encontrados[] = $row['id'];
        }
    }
    
    // Buscar por descripción (solo IDs nuevos)
    $stmt2 = $conn->prepare("SELECT id FROM productos WHERE activo=1 AND descripcion LIKE ?");
    $stmt2->bind_param("s", $like);
    $stmt2->execute();
    $res2 = $stmt2->get_result();
    while($row = $res2->fetch_assoc()) {
        if (!in_array($row['id'], $ids_encontrados)) {
            $ids_encontrados[] = $row['id'];
        }
    }
    
    // Buscar por nombre de categoría
    $stmt3 = $conn->prepare("SELECT c.id FROM categorias c WHERE c.activo=1 AND c.nombre LIKE ?");
    $stmt3->bind_param("s", $like);
    $stmt3->execute();
    $res3 = $stmt3->get_result();
    $cats_encontradas = [];
    while($row = $res3->fetch_assoc()) {
        $cats_encontradas[] = $row['id'];
    }
    
    // Si hay categorías, buscar productos en esas categorías
    if (!empty($cats_encontradas)) {
        $cats_ids = implode(',', array_map('intval', $cats_encontradas));
        $res4 = $conn->query("SELECT id FROM productos WHERE activo=1 AND categoria_id IN ($cats_ids)");
        while($row = $res4->fetch_assoc()) {
            if (!in_array($row['id'], $ids_encontrados)) {
                $ids_encontrados[] = $row['id'];
            }
        }
    }
    
    // Obtener productos únicos
    if (!empty($ids_encontrados)) {
        $ids = implode(',', array_map('intval', $ids_encontrados));
        $resultados_busqueda = $conn->query("SELECT * FROM productos WHERE id IN ($ids) ORDER BY nombre")->fetch_all(MYSQLI_ASSOC);
    }
} elseif ($buscar !== '' && strlen($buscar) < 2) {
    $buscar = '';
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-M Store - Tu Tienda Online en Bolivia</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css?v=<?php echo time(); ?>">
</head>
<body>
<header class="header">
    <div class="container py-2">
        <nav class="navbar">
            <a class="navbar-brand" href="/">E-M Store</a>
            <!-- Menú de categorías (solo PC) -->
            <div class="nav-category d-none d-lg-flex">
                <div class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="bi bi-grid me-1"></i> Categorías
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark shadow-lg">
                        <?php $categorias->data_seek(0); while($c=$categorias->fetch_assoc()): ?>
                        <li><a class="dropdown-item py-2" href="?cat=<?php echo $c['id']; ?>">
                            <i class="bi bi-tag me-2"></i><?php echo htmlspecialchars($c['nombre']); ?>
                        </a></li>
                        <?php endwhile; ?>
                    </ul>
                </div>
            </div>
            <div class="search-box d-none d-lg-block">
                <form class="d-flex" method="GET" onsubmit="return this.buscar.value.length >= 2 || this.buscar.value === '';">
                    <?php if(isset($_GET['cat'])): ?>
                    <input type="hidden" name="cat" value="<?php echo intval($_GET['cat']); ?>">
                    <?php endif; ?>
                    <?php if(isset($_GET['a'])): ?>
                    <input type="hidden" name="a" value="<?php echo htmlspecialchars($_GET['a']); ?>">
                    <?php endif; ?>
                    <input class="form-control" type="search" name="buscar" placeholder="Buscar producto..." value="<?php echo htmlspecialchars($buscar); ?>">
                    <button class="btn btn-outline-light" type="submit"><i class="bi bi-search"></i></button>
                </form>
            </div>
            <div class="header-actions d-none d-lg-flex align-items-center">
                <a href="#" class="text-white position-relative me-3">
                    <i class="bi bi-cart fs-5"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style="font-size: 0.6rem;">0</span>
                </a>
                <a href="afiliado/panel.php" class="btn btn-outline-light btn-sm">
                    <i class="bi bi-person-plus me-1"></i>Afiliados
                </a>
                <?php if(isset($_SESSION['admin_logged_in'])): ?>
                <a href="e$pro154/dashboard.php" class="ms-2 btn btn-warning btn-sm">Admin</a>
                <?php endif; ?>
            </div>
        </nav>
    </div>
</header>
<!-- BANNER LENTO Y LUJOSO - 12 SEGUNDOS + FLECHAS MODERNAS -->
<section class="banner position-relative">
    <?php
    $banners = $conn->query("SELECT bs.*, p.id as prod_id FROM banner_simple bs LEFT JOIN productos p ON bs.producto_id = p.id WHERE bs.activo=1 ORDER BY bs.orden, bs.id DESC");
    ?>
    <?php if($banners->num_rows > 0): ?>
    <div id="bannerCarousel"
         class="carousel slide carousel-fade"
         data-bs-ride="carousel"
         data-bs-interval="15000"> <!-- ← 12 segundos por imagen -->
        <div class="carousel-inner">
            <?php $active = 'active'; while($b = $banners->fetch_assoc()): ?>
                <div class="carousel-item <?php echo $active; $active=''; ?>">
                    <?php if($b['producto_id'] && $b['prod_id']): ?>
                        <a href="?producto=<?php echo $b['producto_id']; ?>#modalProducto" class="d-block">
                            <img src="uploads/<?php echo htmlspecialchars($b['imagen']); ?>" class="d-block w-100" alt="Oferta">
                        </a>
                    <?php else: ?>
                        <img src="uploads/<?php echo htmlspecialchars($b['imagen']); ?>" class="d-block w-100" alt="E&MStore">
                    <?php endif; ?>
                </div>
            <?php endwhile; ?>
        </div>
        <!-- FLECHAS MODERNAS (aparecen solo al pasar el mouse) -->
        <button class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Siguiente</span>
        </button>
    </div>
    <?php else: ?>
    <div class="container text-center text-white py-5">
        <h1 class="display-3 fw-bold">E-M Store</h1>
        <p class="lead fw-bold">Lo quieres, lo tienes · Envíos a todo Bolivia</p>
    </div>
    <?php endif; ?>
</section>
<!-- TODO LO DEMÁS QUEDA 100% IGUAL -->
<section class="categorias py-5" id="ofertas">
    <div class="container">
        <?php if ($buscar !== ''): ?>
            <h2 class="text-center mb-4 text-danger fw-bold">
                Resultados para "<?php echo htmlspecialchars($buscar); ?>"
                (<?php echo count($resultados_busqueda); ?> encontrados)
            </h2>
            <?php if (empty($resultados_busqueda)): ?>
                <div class="text-center py-5">
                    <p class="fs-3 text-muted">No se encontraron productos</p>
                    <a href="/" class="btn btn-danger btn-lg">Volver al inicio</a>
                </div>
            <?php else: ?>
                <div class="search-results">
                    <?php foreach($resultados_busqueda as $p): ?>
                    <div class="search-result-item">
                        <div class="search-result-image">
                            <img src="uploads/<?php echo htmlspecialchars($p['imagen']); ?>" alt="<?php echo htmlspecialchars($p['nombre']); ?>">
                        </div>
                        <div class="search-result-info">
                            <h5 class="search-result-title"><?php echo htmlspecialchars($p['nombre']); ?></h5>
                            <p class="search-result-desc"><?php echo substr(strip_tags($p['descripcion']?:'Producto de calidad'),0,100); ?>...</p>
                            <div class="search-result-meta">
                                <span class="search-result-price">Bs <?php echo number_format($p['precio'],0); ?></span>
                                <?php if($p['stock'] > 0): ?>
                                    <span class="search-result-stock text-success">✓ Disponible</span>
                                <?php else: ?>
                                    <span class="search-result-stock text-muted">Agotado</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="search-result-action">
                            <button type="button" class="btn btn-danger btn-sm"
                                data-bs-toggle="modal" data-bs-target="#modalProducto"
                                data-nombre="<?php echo htmlspecialchars($p['nombre'],ENT_QUOTES); ?>"
                                data-precio="<?php echo $p['precio']; ?>"
                                data-precio-original="<?php echo $p['precio_original']; ?>"
                                data-imagen="<?php echo htmlspecialchars($p['imagen']); ?>"
                                data-descripcion="<?php echo htmlspecialchars($p['descripcion']?:'Producto de alta calidad',ENT_QUOTES); ?>">
                                Ver ahora
                            </button>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        <?php else: ?>
            <?php
            $cat_id = $_GET['cat'] ?? null;
            $ver_todo = isset($_GET['todo']) && $_GET['todo'] == '1';
            $sql = $cat_id ? "SELECT * FROM categorias WHERE id=? AND activo=1" : "SELECT * FROM categorias WHERE activo=1 ORDER BY nombre";
            $stmt = $conn->prepare($sql);
            if($cat_id) $stmt->bind_param("i",$cat_id);
            $stmt->execute(); $cats = $stmt->get_result();
            while($cat = $cats->fetch_assoc()):
                $pstmt = $conn->prepare("SELECT p.* FROM productos p WHERE categoria_id=? AND activo=1 ORDER BY fecha_creado DESC");
                $pstmt->bind_param("i",$cat['id']); $pstmt->execute(); $res = $pstmt->get_result();
                if($res->num_rows==0) continue;
                $prods = $res->fetch_all(MYSQLI_ASSOC);
            ?>
            <div class="categoria mb-5">
                <h3 class="categoria-title"><?php echo htmlspecialchars($cat['nombre']); ?></h3>
                <?php if(!$ver_todo): ?>
                <div class="desliza-texto">
                    Desliza para ver más <i class="bi bi-arrow-right flecha-deslizar"></i>
                </div>
                <div class="carousel-horizontal">
                    <?php foreach($prods as $p): ?>
                    <div class="producto-card-horizontal">
                        <div class="card h-100">
                            <?php if($p['precio_original'] > $p['precio']): ?>
                            <div class="position-absolute bg-danger text-white">
                                <?php echo round((1 - $p['precio']/$p['precio_original'])*100); ?>% OFF
                            </div>
                            <?php endif; ?>
                            <img src="uploads/<?php echo htmlspecialchars($p['imagen']); ?>" class="card-img-top" alt="<?php echo htmlspecialchars($p['nombre']); ?>">
                            <div class="card-body d-flex flex-column">
                                <h6 class="card-title"><?php echo htmlspecialchars($p['nombre']); ?></h6>
                                <p class="card-text text-muted small flex-grow-1">
                                    <?php echo substr(strip_tags($p['descripcion']?:'Producto premium'),0,90); ?>...
                                </p>
                                <div class="precio-container mt-auto">
                                    <span class="precio-actual">Bs <?php echo number_format($p['precio'],0); ?></span>
                                    <?php if($p['precio_original'] > $p['precio']): ?>
                                    <span class="precio-original">Bs <?php echo number_format($p['precio_original'],0); ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php if($p['stock'] > 0): ?>
                                    <div class="stock-text">Disponible: <?php echo $p['stock']; ?> unid.</div>
                                <?php else: ?>
                                    <div class="agotado-text">Agotado</div>
                                <?php endif; ?>
                                <?php if($p['precio_envio'] > 0): ?>
                                    <small class="text-muted d-block">+ Bs. <?php echo number_format($p['precio_envio'],0); ?> envío</small>
                                <?php else: ?>
                                    <small class="text-success fw-bold d-block">Envío Gratis</small>
                                <?php endif; ?>
                                <?php if($p['envio_opciones']): ?>
                                    <div class="opciones-envio mt-2">
                                        <?php
                                        $ops = explode(',', trim($p['envio_opciones']));
                                        $iconos = [
                                            'gratis' => '<i class="bi bi-truck text-success"></i> Envío Gratis',
                                            'online' => '<i class="bi bi-credit-card text-primary"></i> Pago Online',
                                            'recojo' => '<i class="bi bi-shop text-warning"></i> Recojo en Tienda'
                                        ];
                                        foreach($ops as $op):
                                            $op = trim($op);
                                            if(isset($iconos[$op])): ?>
                                                <small class="d-block mb-1"><?php echo $iconos[$op]; ?></small>
                                            <?php endif;
                                        endforeach; ?>
                                    </div>
                                <?php endif; ?>
                                <?php if($p['stock']>0): ?>
                                <button type="button" class="btn-comprar"
                                    data-bs-toggle="modal" data-bs-target="#modalProducto"
                                    data-nombre="<?php echo htmlspecialchars($p['nombre'],ENT_QUOTES); ?>"
                                    data-precio="<?php echo $p['precio']; ?>"
                                    data-precio-original="<?php echo $p['precio_original']; ?>"
                                    data-imagen="<?php echo htmlspecialchars($p['imagen']); ?>"
                                    data-descripcion="<?php echo htmlspecialchars($p['descripcion']?:'Producto de alta calidad',ENT_QUOTES); ?>">
                                    VER AHORA
                                </button>
                                <?php else: ?>
                                <div class="btn-agotado">AGOTADO</div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <div class="ver-todo-container">
                    <a href="?cat=<?php echo $cat['id']; ?>&todo=1" class="ver-todo">Ver todo</a>
                </div>
                <?php else: ?>
                <div class="row g-4">
                    <?php foreach($prods as $p): ?>
                    <div class="col-6 col-md-4 col-lg-3">
                        <div class="card h-100">
                            <?php if($p['precio_original'] > $p['precio']): ?>
                            <div class="position-absolute bg-danger text-white">
                                <?php echo round((1 - $p['precio']/$p['precio_original'])*100); ?>% OFF
                            </div>
                            <?php endif; ?>
                            <img src="uploads/<?php echo htmlspecialchars($p['imagen']); ?>" class="card-img-top" alt="<?php echo htmlspecialchars($p['nombre']); ?>">
                            <div class="card-body d-flex flex-column">
                                <h6 class="card-title"><?php echo htmlspecialchars($p['nombre']); ?></h6>
                                <p class="card-text text-muted small flex-grow-1">
                                    <?php echo substr(strip_tags($p['descripcion']?:'Producto premium'),0,90); ?>...
                                </p>
                                <div class="precio-container mt-auto">
                                    <span class="precio-actual">Bs <?php echo number_format($p['precio'],0); ?></span>
                                    <?php if($p['precio_original'] > $p['precio']): ?>
                                    <span class="precio-original">Bs <?php echo number_format($p['precio_original'],0); ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php if($p['stock'] > 0): ?>
                                    <div class="stock-text">Disponible: <?php echo $p['stock']; ?> unid.</div>
                                <?php else: ?>
                                    <div class="agotado-text">Agotado</div>
                                <?php endif; ?>
                                <?php if($p['precio_envio'] > 0): ?>
                                    <small class="text-muted d-block">+ Bs. <?php echo number_format($p['precio_envio'],0); ?> envío</small>
                                <?php else: ?>
                                    <small class="text-success fw-bold d-block">Envío Gratis</small>
                                <?php endif; ?>
                                <?php if($p['envio_opciones']): ?>
                                    <div class="opciones-envio mt-2">
                                        <?php
                                        $ops = explode(',', trim($p['envio_opciones']));
                                        $iconos = [
                                            'gratis' => '<i class="bi bi-truck text-success"></i> Envío Gratis',
                                            'online' => '<i class="bi bi-credit-card text-primary"></i> Pago Online',
                                            'recojo' => '<i class="bi bi-shop text-warning"></i> Recojo en Tienda'
                                        ];
                                        foreach($ops as $op):
                                            $op = trim($op);
                                            if(isset($iconos[$op])): ?>
                                                <small class="d-block mb-1"><?php echo $iconos[$op]; ?></small>
                                            <?php endif;
                                        endforeach; ?>
                                    </div>
                                <?php endif; ?>
                                <?php if($p['stock']>0): ?>
                                <button type="button" class="btn-comprar"
                                    data-bs-toggle="modal" data-bs-target="#modalProducto"
                                    data-nombre="<?php echo htmlspecialchars($p['nombre'],ENT_QUOTES); ?>"
                                    data-precio="<?php echo $p['precio']; ?>"
                                    data-precio-original="<?php echo $p['precio_original']; ?>"
                                    data-imagen="<?php echo htmlspecialchars($p['imagen']); ?>"
                                    data-descripcion="<?php echo htmlspecialchars($p['descripcion']?:'Producto de alta calidad',ENT_QUOTES); ?>">
                                    VER
                                </button>
                                <?php else: ?>
                                <div class="btn-agotado">AGOTADO</div>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
            <?php endwhile; ?>
        <?php endif; ?>
    </div>
</section>
<!-- MODAL FACTURA (100% IGUAL) -->
<div class="modal fade modal-factura" id="modalProducto" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-body p-4">
                <h3 class="text-center fw-bold text-danger mb-4" style="font-size:1.8rem" id="modal-nombre">Cargando...</h3>
                <div class="text-center mb-4">
                    <img id="modal-imagen" src="" class="img-fluid rounded shadow-sm" style="max-height:220px;" alt="">
                </div>
                <div class="line mb-4"></div>
                <div class="precio-box text-center mb-4">
                    <span class="price fs-1 fw-bold text-danger" id="modal-precio">Bs 0</span>
                    <span class="old-price fs-4 text-muted text-decoration-line-through ms-2" id="modal-precio-old"></span>
                </div>
                <small class="d-block text-center mb-4 text-success fw-bold">¡Descuento aplicado!</small>
                <div class="line mb-4"></div>
                <div class="mb-4 text-start">
                    <strong class="fs-5">Descripción:</strong>
                    <div class="mt-2" id="modal-descripcion" style="font-size:1rem"></div>
                </div>
                <div class="line mb-4"></div>
                <div class="text-start">
                    <label class="form-label fw-bold">Nombre Completo</label>
                    <input type="text" class="form-control mb-3" id="nombre" placeholder="Ej: Juan Pérez" required>
                    <label class="form-label fw-bold">Método de Pago</label>
                    <select class="form-select mb-4" id="pago" required>
                        <option value="">Elige una opción...</option>
                        <option value="QR">QR</option>
                        <option value="Transferencia">Transferencia</option>
                        <option value="Efectivo contra entrega">Efectivo</option>
                    </select>
                </div>
                <div class="d-flex gap-3 justify-content-center">
                    <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">
                        Volver
                    </button>
                    <button type="button" class="btn btn-success btn-lg px-5 fw-bold" id="enviarWhatsApp">
                        <i class="bi bi-whatsapp"></i> Pagar
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
<footer>
    <div class="container text-center">
        <p class="mb-0">© 2026 E-M Store · Todos los derechos reservados</p>
    </div>
</footer>

<!-- Modal de Categorías para menú inferior -->
<div class="modal fade" id="modalCategorias" tabindex="-1" aria-labelledby="modalCategoriasLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title" id="modalCategoriasLabel"><i class="bi bi-tags me-2"></i>Categorías</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <div class="list-group list-group-flush">
                    <?php 
                    $categorias->data_seek(0);
                    while($c = $categorias->fetch_assoc()): 
                    ?>
                    <a href="?cat=<?php echo $c['id']; ?>" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                        <span><i class="bi bi-tag me-2"></i><?php echo htmlspecialchars($c['nombre']); ?></span>
                        <i class="bi bi-chevron-right text-muted"></i>
                    </a>
                    <?php endwhile; ?>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>

<!-- Modal de Búsqueda para menú inferior -->
<div class="modal fade" id="modalBuscar" tabindex="-1" aria-labelledby="modalBuscarLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title" id="modalBuscarLabel"><i class="bi bi-search me-2"></i>Buscar Producto</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form method="GET" onsubmit="return this.buscar.value.length >= 2;">
                    <?php if(isset($_GET['cat'])): ?>
                    <input type="hidden" name="cat" value="<?php echo intval($_GET['cat']); ?>">
                    <?php endif; ?>
                    <?php if(isset($_GET['a'])): ?>
                    <input type="hidden" name="a" value="<?php echo htmlspecialchars($_GET['a']); ?>">
                    <?php endif; ?>
                    <div class="input-group">
                        <input class="form-control" type="search" name="buscar" placeholder="Escribe al menos 2 caracteres..." value="<?php echo htmlspecialchars($buscar); ?>" required>
                        <button class="btn btn-danger" type="submit"><i class="bi bi-search"></i> Buscar</button>
                    </div>
                    <small class="text-muted d-block mt-2">Mínimo 2 caracteres para buscar</small>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary w-100" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>

<!-- Menú inferior fijo estilo App Móvil -->
<nav class="bottom-nav">
    <ul class="bottom-nav-items">
        <li>
            <a href="/" class="bottom-nav-item <?php echo !isset($_GET['cat']) && !isset($_GET['buscar']) ? 'active' : ''; ?>">
                <i class="bi bi-house-fill"></i>
                <span>Inicio</span>
            </a>
        </li>
        <li>
            <a href="/?#ofertas" class="bottom-nav-item">
                <i class="bi bi-fire"></i>
                <span>Ofertas</span>
            </a>
        </li>
        <li>
            <a href="#" class="bottom-nav-item" data-bs-toggle="modal" data-bs-target="#modalBuscar">
                <i class="bi bi-search"></i>
                <span>Buscar</span>
            </a>
        </li>
        <li>
            <a href="#" class="bottom-nav-item" data-bs-toggle="modal" data-bs-target="#modalCategorias">
                <i class="bi bi-grid"></i>
                <span>Categorías</span>
            </a>
        </li>
        <li>
            <a href="afiliado/panel.php" class="bottom-nav-item">
                <i class="bi bi-people"></i>
                <span>Afiliados</span>
            </a>
        </li>
    </ul>
</nav>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="js/script.js?v=<?php echo time(); ?>"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Enfocar input del modal de búsqueda
    var modalBuscar = document.getElementById('modalBuscar');
    if (modalBuscar) {
        modalBuscar.addEventListener('shown.bs.modal', function() {
            var input = modalBuscar.querySelector('input[name="buscar"]');
            if (input) {
                input.focus();
            }
        });
    }
    
    // Scroll a ofertas si hay hash en URL
    if (window.location.hash === '#ofertas') {
        var ofertas = document.getElementById('ofertas');
        if (ofertas) {
            setTimeout(function() {
                ofertas.scrollIntoView({behavior: 'smooth'});
            }, 100);
        }
    }
});
</script>
</body>
</html> 