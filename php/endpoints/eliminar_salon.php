<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';
$id = isset($_POST['id_salon']) ? trim($_POST['id_salon']) : '';

try {
    $stmt = $conexion->prepare("DELETE FROM salon WHERE id_salon = ?");
    $stmt->execute([$id]);
    echo json_encode(['status' => 'success', 'message' => 'Salón eliminado con éxito.']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'No puedes eliminar este salón porque ya tiene exámenes programados.']);
    } else { echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]); }
}
?>