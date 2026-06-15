<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

$id = isset($_POST['id_materia']) ? trim($_POST['id_materia']) : '';

if (empty($id)) {
    echo json_encode(['status' => 'error', 'message' => 'ID no recibido.']);
    exit();
}

try {
    $stmt = $conexion->prepare("DELETE FROM materia WHERE id_materia = ?");
    $stmt->execute([$id]);
    echo json_encode(['status' => 'success', 'message' => 'Materia eliminada con éxito.']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'No puedes eliminar esta materia porque ya tiene exámenes o calificaciones registradas.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
    }
}
$conexion = null;
?>