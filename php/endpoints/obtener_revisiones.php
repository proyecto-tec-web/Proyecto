<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no válida"]);
    exit();
}

try {
    // 1. Obtener el id_profesor asociado a esta sesión
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);
    $id_profesor = $profesor['id_profesor'];

    // 2. Traer las peticiones de revisión uniendo alumno, examen y materia
    $sql = "SELECT 
                r.id_peticion,
                r.id_inscripcion,
                a.boleta,
                CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) AS nombre,
                m.nombre AS materia,
                r.salon,
                r.horario,
                r.estado,
                ie.calificacion AS calificacion_actual
            FROM revision_examen r
            INNER JOIN inscripcion_examen ie ON r.id_inscripcion = ie.id_inscripcion
            INNER JOIN alumno a ON ie.id_alumno = a.id_alumno
            INNER JOIN examen e ON ie.id_examen = e.id_examen
            INNER JOIN materia m ON e.id_materia = m.id_materia
            WHERE e.id_profesor = ?
            ORDER BY r.estado DESC, r.fecha_solicitud ASC";
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$id_profesor]);
    $revisiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $revisiones]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>
