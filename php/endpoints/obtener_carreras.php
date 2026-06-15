<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

try {
    $sql = "SELECT id_carrera, nombre, acronimo FROM carrera ORDER BY nombre ASC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>