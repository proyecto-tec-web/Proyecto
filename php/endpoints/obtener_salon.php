<?php
session_start();
require_once 'seguridad_admin.php';
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';
$id = isset($_GET['id']) ? trim($_GET['id']) : '';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $stmt = $conexion->prepare("SELECT * FROM salon WHERE id_salon = ?");
    $stmt->execute([$id]);
    $salon = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($salon) { echo json_encode(['status' => 'success', 'data' => $salon]); } 
    else { echo json_encode(['status' => 'error', 'message' => 'Salón no encontrado.']); }
} catch (PDOException $e) { echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); }
$conexion = null;
?>