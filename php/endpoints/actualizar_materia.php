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

$id = isset($_POST['id_materia']) ? trim($_POST['id_materia']) : '';
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$semestre = isset($_POST['semestre']) ? trim($_POST['semestre']) : '';
$id_carrera = isset($_POST['id_carrera']) ? trim($_POST['id_carrera']) : '';
$id_area = isset($_POST['id_area']) ? trim($_POST['id_area']) : '';

if (empty($id) || empty($nombre) || empty($semestre) || empty($id_carrera) || empty($id_area)) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos para actualizar.']);
    exit();
}

try {
    $sql = "UPDATE materia SET nombre = ?, semestre = ?, id_carrera = ?, id_area = ? WHERE id_materia = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$nombre, $semestre, $id_carrera, $id_area, $id]);
    
    echo json_encode(['status' => 'success', 'message' => 'Materia actualizada correctamente.']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]);
}

$conexion = null;
?>