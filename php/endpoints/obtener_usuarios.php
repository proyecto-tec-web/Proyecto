<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $stmt = $conexion->prepare("SELECT id_usuario, correo, rol FROM usuario WHERE estado = 'Activo' OR estado IS NULL");
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "data" => $usuarios]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conexion = null;
?>