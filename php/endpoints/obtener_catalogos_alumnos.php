<?php
session_start();
require_once 'seguridad_admin.php';
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $stmt = $conexion->query("SELECT id_carrera, acronimo, nombre FROM carrera");
    $carreras = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "carreras" => $carreras]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
$conexion = null;
?>