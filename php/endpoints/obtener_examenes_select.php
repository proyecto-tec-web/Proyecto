<?php
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';

$sql = "SELECT e.id_examen, e.fecha, m.nombre AS materia 
        FROM examen e 
        INNER JOIN materia m ON e.id_materia = m.id_materia 
        WHERE e.estado = 'Abierto'
        ORDER BY e.fecha ASC";

try {
    $stmt = $conexion->query($sql);
    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $datos]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
$conexion = null;
?>