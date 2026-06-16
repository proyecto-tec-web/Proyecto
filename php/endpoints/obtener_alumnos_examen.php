<?php
session_start();
require_once '../config/db.php';

$id_examen = $_GET['id_examen'] ?? null;

if (!$id_examen) {
    echo json_encode(["status" => "error", "message" => "Falta el ID del examen."]);
    exit();
}

try {
    // Obtenemos a los alumnos cuya inscripción está Aprobada para este examen específico
    $sql = "SELECT ie.id_inscripcion, a.boleta, a.nombre, a.apellido_paterno, a.apellido_materno, ie.calificacion 
            FROM inscripcion_examen ie 
            JOIN alumno a ON ie.id_alumno = a.id_alumno 
            WHERE ie.id_examen = ? AND ie.estado_pago = 'Pagado'
            ORDER BY a.apellido_paterno ASC";
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$id_examen]);
    $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $alumnos]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
