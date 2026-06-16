<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $sql = "SELECT p.id_profesor, p.boleta, p.nombre, p.apellido_paterno, p.apellido_materno, u.correo, u.estado 
            FROM profesor p
            JOIN usuario u ON p.id_usuario = u.id_usuario
            ORDER BY p.apellido_paterno ASC";
            
    $stmt = $conexion->query($sql);
    $profesores = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $profesores]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]);
}
$conexion = null;   
?>