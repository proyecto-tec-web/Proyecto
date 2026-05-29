<?php
session_start();
require_once '../config/db.php';

try {
    // Traemos las carreras disponibles
    $stmt = $conexion->query("SELECT id_carrera, acronimo, nombre FROM carrera");
    $carreras = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "carreras" => $carreras]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>