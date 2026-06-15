<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}
if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$edificio = isset($_POST['edificio']) ? trim($_POST['edificio']) : '';
$piso = isset($_POST['piso']) ? trim($_POST['piso']) : '';
$numero = isset($_POST['numero']) ? trim($_POST['numero']) : '';

if (empty($edificio) || empty($piso) || empty($numero)) {
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']); exit();
}

try {
    $stmt = $conexion->prepare("INSERT INTO salon (edificio, piso, numero) VALUES (?, ?, ?)");
    $stmt->execute([$edificio, $piso, $numero]);
    echo json_encode(['status' => 'success', 'message' => 'Salón registrado con éxito.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]);
}
$conexion = null;
?>