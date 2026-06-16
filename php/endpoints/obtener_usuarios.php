<?php
session_start();
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (!isset($_SESSION['id_usuario']) || $_SESSION['usuario_rol'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

try {
    $sql = "SELECT u.id_usuario, u.correo, u.rol, 
                   CASE 
                       WHEN u.rol = 'alumno' THEN a.boleta 
                       WHEN u.rol = 'profesor' THEN p.boleta 
                       ELSE NULL 
                   END AS boleta,
                   CASE 
                       WHEN u.rol = 'alumno' THEN CONCAT_WS(' ', a.nombre, a.apellido_paterno, a.apellido_materno)
                       WHEN u.rol = 'profesor' THEN CONCAT_WS(' ', p.nombre, p.apellido_paterno, p.apellido_materno)
                       ELSE NULL
                   END AS nombre_persona
            FROM usuario u
            LEFT JOIN alumno a ON u.id_usuario = a.id_usuario
            LEFT JOIN profesor p ON u.id_usuario = p.id_usuario
            WHERE u.estado = 'Activo' OR u.estado IS NULL
            ORDER BY u.id_usuario ASC";
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "data" => $usuarios]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conexion = null;
?>