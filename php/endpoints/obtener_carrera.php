<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';
$id = isset($_GET['id']) ? trim($_GET['id']) : '';

try {
    $stmt = $conexion->prepare("SELECT * FROM carrera WHERE id_carrera = ?");
    $stmt->execute([$id]);
    $carrera = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($carrera) { echo json_encode(['status' => 'success', 'data' => $carrera]); } 
    else { echo json_encode(['status' => 'error', 'message' => 'Carrera no encontrada.']); }
} catch (PDOException $e) { echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); }
?>