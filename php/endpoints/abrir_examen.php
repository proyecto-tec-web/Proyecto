<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);

if (isset($datos['id_examen'])) {
    try {
        $stmt = $conexion->prepare("UPDATE examen SET estado = 'Abierto' WHERE id_examen = ? AND estado = 'Programado'");
        $stmt->execute([$datos['id_examen']]);
        
        echo json_encode(["status" => "success"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>