<?php
require '../config.php';

$action = $_GET['action'] ?? '';

// Handle logout action
if ($action === 'logout') {
    session_destroy();
    header("Location: panel.php");
    exit;
}

// Handle gettelefono API action
if ($action === 'gettelefono') {
    header('Content-Type: application/json');
    $id = $_GET['id'] ?? 0;
    if ($id == 0) {
        echo json_encode(['telefono' => '']);
        exit;
    }
    $stmt = $conn->prepare("SELECT telefono FROM usuarios_afiliados WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    echo json_encode(['telefono' => $user['telefono'] ?? '']);
    exit;
}

// Check if user is logged in
$isLoggedIn = isset($_SESSION['afiliado_id']);
$user = null;
$msg = '';
$error = '';

if ($isLoggedIn) {
    $id = $_SESSION['afiliado_id'];
    $user = $conn->query("SELECT * FROM usuarios_afiliados WHERE id=$id")->fetch_assoc();
    
    // Handle phone update
    if ($_POST && isset($_POST['update_telefono'])) {
        $telefono = trim($_POST['telefono'] ?? '');
        if ($telefono !== '' && strlen($telefono) >= 7 && is_numeric($telefono)) {
            $telefono = $conn->real_escape_string($telefono);
            $conn->query("UPDATE usuarios_afiliados SET telefono='$telefono' WHERE id=$id");
            $user['telefono'] = $telefono;
            $msg = "¡Número actualizado con éxito!";
        } else {
            $msg = "Ingresa un número válido (mínimo 7 dígitos)";
        }
    }
    $link = $user['link_personal'] ?: "https://e-mstorebo.ct.ws/?a=$id";
}

// Handle login
if ($action === 'login' || (!$isLoggedIn && $action !== 'register')) {
    if ($_POST && isset($_POST['login_email'])) {
        $email = $_POST['login_email'];
        $password = $_POST['login_password'];
        $stmt = $conn->prepare("SELECT * FROM usuarios_afiliados WHERE email=?");
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows == 0) {
            $error = "Email o contraseña incorrecta";
        } else {
            $userData = $res->fetch_assoc();
            if (password_verify($password, $userData['password'])) {
                $_SESSION['afiliado_id'] = $userData['id'];
                header("Location: panel.php");
                exit;
            } else {
                $error = "Email o contraseña incorrecta";
            }
        }
    }
}

// Handle registration
if ($action === 'register') {
    if ($_POST && isset($_POST['reg_nombre'])) {
        $nombre = trim($_POST['reg_nombre'] ?? '');
        $email = trim($_POST['reg_email'] ?? '');
        $telefono = trim($_POST['reg_telefono'] ?? '');
        $password = $_POST['reg_password'] ?? '';
        $codigo = strtoupper(trim($_POST['reg_codigo'] ?? ''));

        if (empty($nombre) || empty($email) || empty($password) || empty($codigo)) {
            $error = "Completa todos los campos";
        } else {
            $stmt = $conn->prepare("SELECT * FROM afiliados_codigos WHERE codigo=? AND usado=0");
            $stmt->bind_param("s", $codigo);
            $stmt->execute();
            $res = $stmt->get_result();

            if ($res->num_rows == 0) {
                $error = "Código inválido o ya usado";
            } else {
                $hash = password_hash($password, PASSWORD_DEFAULT);
                $stmt2 = $conn->prepare("INSERT INTO usuarios_afiliados (nombre, email, telefono, password, codigo_uso) VALUES (?, ?, ?, ?, ?)");
                $stmt2->bind_param("sssss", $nombre, $email, $telefono, $hash, $codigo);
                $stmt2->execute();
                $afiliado_id = $conn->insert_id;
                $link = "https://e-mstorebo.ct.ws/?a=$afiliado_id";
                $conn->query("UPDATE usuarios_afiliados SET link_personal='$link' WHERE id=$afiliado_id");
                $conn->query("UPDATE afiliados_codigos SET usado=1, usado_por='$email', fecha_uso=NOW() WHERE codigo='$codigo'");
                $msg = "¡Registro exitoso! Tu enlace: <strong>$link</strong>";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panel Afiliado - E-M Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
    <meta name="telefono-afiliado" content="<?php echo $user ? htmlspecialchars($user['telefono']) : ''; ?>">
    <style>
        :root {
            --rojo: #d60000;
            --rojo-hover: #b00000;
        }
        body {
            font-family: 'Roboto', sans-serif;
            background: #f8f9fa;
        }
        .card-header { 
            background: linear-gradient(135deg, var(--rojo), #a00000) !important; 
        }
        .btn-copiar { background: #28a745; border: none; }
        .btn-copiar:hover { background: #218838; }
        .btn-recargar { background: #007bff; border: none; }
        .btn-recargar:hover { background: #0056b3; }
        .btn-afiliado { background: var(--rojo); color: white; border: none; }
        .btn-afiliado:hover { background: var(--rojo-hover); color: white; }
        .nav-pills .nav-link {
            color: #666;
            border-radius: 8px;
        }
        .nav-pills .nav-link.active {
            background: var(--rojo);
        }
        @media (max-width: 576px) {
            .card-body { padding: 1rem; }
            .input-group-lg > .form-control, 
            .input-group-lg > .input-group-text,
            .input-group-lg > .btn {
                font-size: 0.9rem;
                padding: 0.5rem;
            }
            .btn-lg { font-size: 1rem; }
        }
    </style>
</head>
<body>
<?php if($isLoggedIn && $user): ?>
<!-- DASHBOARD VIEW -->
<div class="container mt-4 mt-md-5">
    <div class="card shadow-lg border-0">
        <div class="card-header bg-danger text-white text-center py-3 py-md-4">
            <h4 class="mb-0">
                <i class="bi bi-person-badge"></i> Panel de Afiliado
            </h4>
            <p class="mb-0 mt-2">Bienvenido, <strong><?php echo htmlspecialchars($user['nombre']); ?></strong></p>
        </div>
        <div class="card-body p-3 p-md-4">
            <?php if($msg && isset($_POST['update_telefono'])): ?>
                <div class="alert alert-success text-center">
                    <i class="bi bi-check-circle"></i> <?php echo $msg; ?>
                </div>
            <?php endif; ?>

            <!-- ENLACE DE AFILIADO -->
            <div class="text-center mb-4">
                <h5 class="mb-3">
                    <i class="bi bi-link-45deg"></i> Tu enlace de afiliado
                </h5>
                <div class="input-group input-group-lg">
                    <input type="text" class="form-control text-center" value="<?php echo $link; ?>" readonly id="linkAfiliado">
                    <button class="btn btn-success btn-copiar" onclick="copiar()">
                        <i class="bi bi-clipboard-check"></i> <span class="d-none d-sm-inline">Copiar</span>
                    </button>
                    <a href="<?php echo $link; ?>" target="_blank" class="btn btn-primary btn-recargar">
                        <i class="bi bi-arrow-repeat"></i> <span class="d-none d-sm-inline">Probar</span>
                    </a>
                </div>
                <small class="text-muted d-block mt-2">Comparte este enlace y gana comisiones por cada venta</small>
            </div>

            <hr class="border-danger">

            <!-- NÚMERO DE WHATSAPP -->
            <div class="text-center">
                <h5 class="mb-3">
                    <i class="bi bi-whatsapp text-success"></i> Número donde recibes los pedidos
                </h5>
                <form method="POST" class="mt-3">
                    <input type="hidden" name="update_telefono" value="1">
                    <div class="input-group input-group-lg mb-3 mx-auto" style="max-width: 400px;">
                        <span class="input-group-text">+591</span>
                        <input type="text" name="telefono" class="form-control text-center" 
                               value="<?php echo htmlspecialchars($user['telefono']); ?>"
                               placeholder="71123456" maxlength="12" pattern="\d{7,12}" required>
                        <button type="submit" class="btn btn-afiliado">
                            <i class="bi bi-save"></i> <span class="d-none d-sm-inline">Guardar</span>
                        </button>
                    </div>
                    <?php if($user['telefono']): ?>
                        <p class="text-success fw-bold mb-1">
                            <i class="bi bi-check-circle-fill"></i> Tu número: +591 <?php echo htmlspecialchars($user['telefono']); ?>
                        </p>
                    <?php else: ?>
                        <p class="text-warning mb-1">
                            <i class="bi bi-exclamation-triangle"></i> Aún no has configurado tu número
                        </p>
                    <?php endif; ?>
                </form>
            </div>

            <div class="text-center mt-4">
                <a href="../logout2.php" class="btn btn-outline-secondary">
                    <i class="bi bi-box-arrow-right"></i> Cerrar sesión
                </a>
                <a href="../" class="btn btn-outline-primary ms-2">
                    <i class="bi bi-shop"></i> Ver tienda
                </a>
            </div>
        </div>
        <div class="card-footer text-center text-muted small">
            © 2026 E-M Store · Todos los derechos reservados
        </div>
    </div>
</div>

<script>
function copiar() {
    const link = document.getElementById('linkAfiliado');
    link.select();
    document.execCommand('copy');
    alert('¡Enlace copiado al portapapeles!');
}
</script>

<?php else: ?>
<!-- LOGIN / REGISTER VIEW -->
<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="card shadow-lg border-0">
                <div class="card-header bg-danger text-white text-center py-3">
                    <h4 class="mb-0">
                        <i class="bi bi-person-badge"></i> <?php echo $action === 'register' ? 'Registro de Afiliado' : 'Login Afiliado'; ?>
                    </h4>
                </div>
                <div class="card-body p-4">
                    <?php if($msg && $action === 'register'): ?>
                        <div class="alert alert-success text-center"><?php echo $msg; ?></div>
                    <?php endif; ?>
                    <?php if($error): ?>
                        <div class="alert alert-danger"><?php echo $error; ?></div>
                    <?php endif; ?>

                    <?php if($action === 'register'): ?>
                    <!-- REGISTRATION FORM -->
                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label">Nombre completo</label>
                            <input type="text" name="reg_nombre" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="reg_email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Teléfono</label>
                            <input type="text" name="reg_telefono" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" name="reg_password" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Código de Afiliado</label>
                            <input type="text" name="reg_codigo" class="form-control" maxlength="8" required placeholder="Ej: AB7F92KD">
                        </div>
                        <button type="submit" class="btn btn-danger w-100">Registrarme</button>
                    </form>
                    <div class="text-center mt-3">
                        <a href="panel.php?action=login">Ya tengo cuenta - Ingresar</a>
                    </div>
                    <?php else: ?>
                    <!-- LOGIN FORM -->
                    <form method="POST">
                        <input type="hidden" name="login_email" value="">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="login_email" class="form-control" required value="<?php echo htmlspecialchars($_POST['login_email'] ?? ''); ?>">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" name="login_password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-danger w-100">Ingresar</button>
                    </form>
                    <div class="text-center mt-3">
                        <a href="panel.php?action=register">Registrarme</a>
                    </div>
                    <?php endif; ?>
                </div>
                <div class="card-footer text-center text-muted small">
                    <a href="../" class="text-decoration-none"><i class="bi bi-arrow-left"></i> Volver a la tienda</a>
                </div>
            </div>
        </div>
    </div>
</div>
<?php endif; ?>
</body>
</html>
