<?php
require 'config.php';
$error = '';
if ($_POST) {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT * FROM usuarios_afiliados WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows == 0) {
        $error = "Email o contraseña incorrecta";
    } else {
        $user = $res->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['afiliado_id'] = $user['id'];
            header("Location: afiliado/panel.php");
            exit;
        } else {
            $error = "Email o contraseña incorrecta";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Afiliado - E-M Store</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet">
    <style>
        :root { --rojo: #d60000; --rojo-hover: #b00000; }
        body { font-family: 'Roboto', sans-serif; background: #f8f9fa; }
        .card-header { background: linear-gradient(135deg, var(--rojo), #a00000) !important; }
        .btn-afiliado { background: var(--rojo); color: white; border: none; }
        .btn-afiliado:hover { background: var(--rojo-hover); color: white; }
    </style>
</head>
<body>
<div class="container mt-4 mt-md-5">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="card shadow-lg border-0">
                <div class="card-header bg-danger text-white text-center py-3">
                    <h4 class="mb-0"><i class="bi bi-person-badge"></i> Login Afiliado</h4>
                </div>
                <div class="card-body p-4">
                    <?php if($error): ?>
                        <div class="alert alert-danger"><?php echo $error; ?></div>
                    <?php endif; ?>
                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-afiliado w-100">Ingresar</button>
                    </form>
                    <div class="text-center mt-3">
                        <a href="register2.php">¿No tienes cuenta? <strong>Regístrate</strong></a>
                    </div>
                </div>
                <div class="card-footer text-center text-muted small">
                    <a href="./" class="text-decoration-none"><i class="bi bi-arrow-left"></i> Volver a la tienda</a>
                </div>
            </div>
        </div>
    </div>
</div>
</body>
</html>