<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$id = isset($_GET['id']) ? trim($_GET['id']) : '';

try {
    $stmt = $conexion->prepare("SELECT * FROM materia WHERE id_materia = ?");
    $stmt->execute([$id]);
    $materia = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($materia) {
        echo json_encode(['status' => 'success', 'data' => $materia]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Materia no encontrada.']);
    }
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conexion = null;
?>