<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

try {
    $sql = "SELECT id_salon, edificio, piso, numero FROM salon ORDER BY edificio ASC, numero ASC";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>