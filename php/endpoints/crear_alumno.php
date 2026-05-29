<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);
if ($datos) {
    try {
        // Iniciamos la transacción (Todo o nada)
        $conexion->beginTransaction();

        // 1. Crear la cuenta de Usuario
        $pass_hash = password_hash('ipn123', PASSWORD_DEFAULT);
        $stmtUser = $conexion->prepare("INSERT INTO usuario (correo, contrasena_hash, rol, estado) VALUES (?, ?, 'Alumno', 'Activo')");
        $stmtUser->execute([$datos['correo'], $pass_hash]);
        
        // Obtenemos el ID del usuario que acaba de nacer
        $id_usuario_nuevo = $conexion->lastInsertId();

        // 2. Crear al Alumno vinculándolo a su nuevo usuario
        $stmtAlum = $conexion->prepare("INSERT INTO alumno (nombre, apellido_paterno, apellido_materno, boleta, situacion_academica, id_carrera, id_usuario) VALUES (?, ?, ?, ?, 'Regular', ?, ?)");
        $stmtAlum->execute([$datos['nombre'], $datos['paterno'], $datos['materno'], $datos['boleta'], $datos['carrera'], $id_usuario_nuevo]);

        // Guardamos todo de forma permanente
        $conexion->commit();

        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        // Si ALGO falla, cancelamos todo y no se guarda ninguna tabla
        $conexion->rollBack();
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>