<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/config.php';

if (is_admin()) {
    header("Location: dashboard.php");
    exit;
}

$error = '';
$csrf_error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['csrf_token']) || !verify_csrf($_POST['csrf_token'])) {
        $csrf_error = "Token de seguridad inválido";
    } else {
        $user = trim($_POST['user'] ?? '');
        $pass = $_POST['pass'] ?? '';
        
        if (empty($user) || empty($pass)) {
            $error = "Usuario y contraseña son requeridos";
        } else {
            $stmt = $conn->prepare("SELECT id, username, password_hash FROM admins WHERE username = ?");
            $stmt->bind_param("s", $user);
            $stmt->execute();
            $result = $stmt->get_result();
            
            if ($result->num_rows === 1) {
                $admin = $result->fetch_assoc();
                
                if (password_verify($pass, $admin['password_hash'])) {
                    $_SESSION['admin_logged_in'] = true;
                    $_SESSION['admin_id'] = $admin['id'];
                    $_SESSION['admin_user'] = $admin['username'];
                    $_SESSION['login_time'] = time();
                    $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';
                    
                    $update_stmt = $conn->prepare("UPDATE admins SET last_login = NOW() WHERE id = ?");
                    $update_stmt->bind_param("i", $admin['id']);
                    $update_stmt->execute();
                    $update_stmt->close();
                    
                    header("Location: dashboard.php");
                    exit;
                } else {
                    $error = "Usuario o contraseña incorrecta";
                }
            } else {
                $error = "Usuario o contraseña incorrecta";
            }
            $stmt->close();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Admin - E-M Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <style>
        body { background: linear-gradient(135deg, #d60000 0%, #b00000 100%); min-height: 100vh; display: flex; align-items: center; }
        .card { border: none; border-radius: 16px; }
        .btn-danger { background: #d60000; border: none; }
        .btn-danger:hover { background: #b00000; }
    </style>
</head>
<body>
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-4">
            <div class="card shadow-lg">
                <div class="card-body p-4">
                    <h4 class="text-center text-danger mb-4 fw-bold">
                        <i class="bi bi-shield-lock"></i> Panel Admin
                    </h4>
                    <?php if($csrf_error): ?>
                        <div class="alert alert-warning"><?php echo htmlspecialchars($csrf_error); ?></div>
                    <?php endif; ?>
                    <?php if($error): ?>
                        <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
                    <?php endif; ?>
                    <form method="POST">
                        <input type="hidden" name="csrf_token" value="<?php echo csrf_token(); ?>">
                        <div class="mb-3">
                            <label class="form-label">Usuario</label>
                            <input type="text" name="user" class="form-control" placeholder="Usuario" required autocomplete="username">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" name="pass" class="form-control" placeholder="Contraseña" required autocomplete="current-password">
                        </div>
                        <button type="submit" class="btn btn-danger w-100 py-2 fw-bold">
                            <i class="bi bi-box-arrow-in-right"></i> Ingresar
                        </button>
                    </form>
                    <small class="text-muted d-block text-center mt-3">
                        &copy; 2026 E-M Store
                    </small>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>
