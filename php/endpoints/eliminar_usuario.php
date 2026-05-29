<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);

if (isset($datos['id_usuario'])) {
    try {
        if ($datos['id_usuario'] == $_SESSION['id_usuario']) {
            echo json_encode(["status" => "error", "message" => "No puedes dar de baja tu propia cuenta."]);
            exit();
        }

        $stmt = $conexion->prepare("UPDATE usuario SET estado = 'Inactivo' WHERE id_usuario = ?");
        $stmt->execute([$datos['id_usuario']]);
        
        echo json_encode(["status" => "success"]);
        
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Fallo en BD: " . $e->getMessage()]);
    }
}
?>