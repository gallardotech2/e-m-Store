<?php
header('Content-Type: application/json');
require 'config.php';

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
?>
