<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);
if ($datos) {
    try {
        $sql = "UPDATE alumno SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, boleta = ?, id_carrera = ?, situacion_academica = ? WHERE id_alumno = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([
            $datos['nombre'], $datos['paterno'], $datos['materno'], 
            $datos['boleta'], $datos['carrera'], $datos['situacion'], $datos['id']
        ]);
        
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>