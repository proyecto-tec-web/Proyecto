<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $sql = "SELECT m.id_materia, m.nombre, m.semestre, c.acronimo AS carrera 
            FROM materia m 
            INNER JOIN carrera c ON m.id_carrera = c.id_carrera 
            ORDER BY m.semestre ASC, m.nombre ASC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conexion = null;
?>