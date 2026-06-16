<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$acronimo = isset($_POST['acronimo']) ? trim($_POST['acronimo']) : '';

if (empty($nombre) || empty($acronimo)) {
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']); exit();
}
try {
    $stmt = $conexion->prepare("INSERT INTO carrera (nombre, acronimo) VALUES (?, ?)");
    $stmt->execute([$nombre, $acronimo]);
    echo json_encode(['status' => 'success', 'message' => 'Carrera registrada con éxito.']);
} catch (PDOException $e) { echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]); }
?>