<?php
require 'config.php';

$msg = $error = ''; 

if ($_POST) {
    $nombre = trim($_POST['nombre'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $telefono = trim($_POST['telefono'] ?? '');
    $password = $_POST['password'] ?? '';
    $codigo = strtoupper(trim($_POST['codigo'] ?? ''));

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
            $msg = "¡Registro exitoso! Tu enlace: <strong>$link</strong><br><small>Ahora puedes <a href='login2.php' class='alert-link'>ingresar a tu panel</a></small>";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro Afiliado - E-M Store</title>
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
                    <h4 class="mb-0"><i class="bi bi-person-badge"></i> Registro de Afiliado</h4>
                </div>
                <div class="card-body p-4">
                    <?php if($msg): ?>
                        <div class="alert alert-success text-center"><?php echo $msg; ?></div>
                    <?php endif; ?>
                    <?php if($error): ?>
                        <div class="alert alert-danger"><?php echo $error; ?></div>
                    <?php endif; ?>
                    <form method="POST">
                        <div class="mb-3">
                            <label class="form-label">Nombre completo</label>
                            <input type="text" name="nombre" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Teléfono</label>
                            <input type="text" name="telefono" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Contraseña</label>
                            <input type="password" name="password" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Código de Afiliado</label>
                            <input type="text" name="codigo" class="form-control" maxlength="8" required placeholder="Ej: AB7F92KD">
                        </div>
                        <button type="submit" class="btn btn-afiliado w-100">Registrarme</button>
                    </form>
                    <div class="text-center mt-3">
                        <a href="login2.php">¿Ya tienes cuenta? <strong>Ingresar</strong></a>
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