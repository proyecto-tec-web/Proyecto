<?php
session_start();
require_once '../config/db.php';

if (isset($_GET['id'])) {
    try {
        $stmt = $conexion->prepare("SELECT * FROM alumno WHERE id_alumno = ?");
        $stmt->execute([$_GET['id']]);
        $alumno = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($alumno) echo json_encode(["status" => "success", "alumno" => $alumno]);
        else echo json_encode(["status" => "error", "message" => "Alumno no encontrado"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>