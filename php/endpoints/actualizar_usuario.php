<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}
if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true);
if ($datos) {
    try {
        if (!empty($datos['password'])) {
            $password_hash = password_hash($datos['password'], PASSWORD_DEFAULT);
            $sql = "UPDATE usuario SET correo = ?, rol = ?, password = ? WHERE id_usuario = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([$datos['correo'], $datos['rol'], $password_hash, $datos['id']]);
        } else {
            $sql = "UPDATE usuario SET correo = ?, rol = ? WHERE id_usuario = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([$datos['correo'], $datos['rol'], $datos['id']]);
        }
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }

}
$conexion = null;
?>