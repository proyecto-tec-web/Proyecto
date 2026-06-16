<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

$id = isset($_POST['id_carrera']) ? trim($_POST['id_carrera']) : '';
$nombre = isset($_POST['nombre']) ? trim($_POST['nombre']) : '';
$acronimo = isset($_POST['acronimo']) ? trim($_POST['acronimo']) : '';

if (empty($id) || empty($nombre) || empty($acronimo)) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos.']); exit();
}
try {
    $stmt = $conexion->prepare("UPDATE carrera SET nombre = ?, acronimo = ? WHERE id_carrera = ?");
    $stmt->execute([$nombre, $acronimo, $id]);
    echo json_encode(['status' => 'success', 'message' => 'Carrera actualizada correctamente.']);
} catch (PDOException $e) { echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]); }
?>