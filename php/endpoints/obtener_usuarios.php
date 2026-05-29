<?php
session_start();
require_once '../config/db.php';

try {
    $stmt = $conexion->prepare("SELECT id_usuario, correo, rol FROM usuario WHERE estado = 'Activo' OR estado IS NULL");
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "data" => $usuarios]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>