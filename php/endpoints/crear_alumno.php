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
        $conexion->beginTransaction();

        $pass_hash = password_hash('ipn123', PASSWORD_DEFAULT);
        $stmtUser = $conexion->prepare("INSERT INTO usuario (correo, contrasena_hash, rol, estado) VALUES (?, ?, 'Alumno', 'Activo')");
        $stmtUser->execute([$datos['correo'], $pass_hash]);
        
        $id_usuario_nuevo = $conexion->lastInsertId();

        $stmtAlum = $conexion->prepare("INSERT INTO alumno (nombre, apellido_paterno, apellido_materno, boleta, situacion_academica, id_carrera, id_usuario) VALUES (?, ?, ?, ?, 'Regular', ?, ?)");
        $stmtAlum->execute([$datos['nombre'], $datos['paterno'], $datos['materno'], $datos['boleta'], $datos['carrera'], $id_usuario_nuevo]);

        $conexion->commit();

        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        $conexion->rollBack();
        if ($e->errorInfo[1] == 1062) {
            echo json_encode(["status" => "error", "message" => "El correo ingresado ya está registrado."]);
        } else {
            // Ocultar detalles técnicos al cliente
            echo json_encode(["status" => "error", "message" => "Ocurrió un error en la base de datos."]);
        }
    }
}
$conexion = null;
?>