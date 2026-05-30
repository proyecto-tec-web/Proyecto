<?php
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';

$sql = "SELECT i.id_inscripcion, a.boleta, CONCAT(a.nombre, ' ', a.apellido_paterno) AS alumno, 
               m.nombre AS materia, i.estado_pago AS estado 
        FROM inscripcion_examen i
        JOIN alumno a ON i.id_alumno = a.id_alumno
        JOIN examen e ON i.id_examen = e.id_examen
        JOIN materia m ON e.id_materia = m.id_materia
        ORDER BY i.id_inscripcion DESC";

try {
    $stmt = $conexion->query($sql);
    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $datos]);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>