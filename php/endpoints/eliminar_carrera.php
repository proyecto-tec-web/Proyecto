<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';
$id = isset($_POST['id_carrera']) ? trim($_POST['id_carrera']) : '';

try {
    $stmt = $conexion->prepare("DELETE FROM carrera WHERE id_carrera = ?");
    $stmt->execute([$id]);
    echo json_encode(['status' => 'success', 'message' => 'Carrera eliminada con éxito.']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'No puedes eliminar esta carrera porque tiene alumnos o materias vinculadas.']);
    } else { echo json_encode(['status' => 'error', 'message' => 'Error BD: ' . $e->getMessage()]); }
}
?>