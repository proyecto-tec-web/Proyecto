<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

$id = isset($_POST['id_salon']) ? trim($_POST['id_salon']) : '';
$edificio = isset($_POST['edificio']) ? trim($_POST['edificio']) : '';
$piso = isset($_POST['piso']) ? trim($_POST['piso']) : '';
$numero = isset($_POST['numero']) ? trim($_POST['numero']) : '';

if (empty($id) || empty($edificio) || empty($piso) || empty($numero)) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos.']); exit();
}
try {
    $stmt = $conexion->prepare("UPDATE salon SET edificio = ?, piso = ?, numero = ? WHERE id_salon = ?");
    $stmt->execute([$edificio, $piso, $numero, $id]);
    echo json_encode(['status' => 'success', 'message' => 'Salón actualizado correctamente.']);
} catch (PDOException $e) { echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]); }
?>