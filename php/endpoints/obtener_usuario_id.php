<?php
session_start();
require_once '../config/db.php';

if (isset($_GET['id'])) {
    try {
        $stmt = $conexion->prepare("SELECT id_usuario, correo, rol FROM usuario WHERE id_usuario = ?");
        $stmt->execute([$_GET['id']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "usuario" => $usuario]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>