<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);
if ($datos) {
    try {
        $stmt_check = $conexion->prepare("SELECT id_usuario FROM usuario WHERE correo = ?");
        $stmt_check->execute([$datos['correo']]);
        if ($stmt_check->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Este correo ya está registrado."]);
            exit();
        }

        $password_hash = password_hash($datos['password'], PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO usuario (correo, password, rol) VALUES (?, ?, ?)";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([$datos['correo'], $password_hash, $datos['rol']]);
        
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>