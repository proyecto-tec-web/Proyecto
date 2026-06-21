<?php
// Validamos si no hay una sesión activa antes de iniciarla
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin')) {
    
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        "status" => "error", 
        "message" => "Acceso Denegado: No tienes los privilegios necesarios."
    ]);
    exit(); 
}
?>