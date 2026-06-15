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

$id = isset($_POST['id_carrera']) ? trim($_POST['id_carrera']) : '';

try {
    $stmt = $conexion->prepare("DELETE FROM carrera WHERE id_carrera = ?");
    $stmt->execute([$id]);
    echo json_encode(['status' => 'success', 'message' => 'Carrera eliminada con éxito.']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'No puedes eliminar esta carrera porque tiene alumnos o materias vinculadas.']);
    } else { echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]); }
}
$conexion = null;
?>