<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no válida"]);
    exit();
}

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);
    
    if (!$profesor) {
        echo json_encode(["status" => "error", "message" => "Profesor no encontrado."]);
        exit();
    }
    
    $id_profesor = $profesor['id_profesor'];

    $sql = "SELECT 
            r.id_peticion,
            r.id_inscripcion,
            a.boleta,
            CONCAT(a.nombre, ' ', a.apellido_paterno, ' ', a.apellido_materno) AS nombre,
            m.nombre AS materia,
            COALESCE(r.lugar_revision, CONCAT(s.edificio, ' (', s.numero, ')')) AS salon,
            COALESCE(DATE_FORMAT(r.fecha_revision_agendada, '%Y-%m-%d | %H:%i'), CONCAT(e.fecha, ' | ', e.hora_inicio)) AS horario,
            r.estado,
            ie.calificacion AS calificacion_actual,
            r.motivo_alumno
        FROM peticion_revision r
        LEFT JOIN inscripcion_examen ie ON r.id_inscripcion = ie.id_inscripcion
        LEFT JOIN examen e ON ie.id_examen = e.id_examen
        LEFT JOIN materia m ON e.id_materia = m.id_materia
        LEFT JOIN salon s ON e.id_salon = s.id_salon
        LEFT JOIN alumno a ON ie.id_alumno = a.id_alumno
        WHERE e.id_profesor = ?
        ORDER BY 
            CASE r.estado 
                WHEN 'Pendiente' THEN 1 
                WHEN 'Agendada' THEN 2 
                WHEN 'Completada' THEN 3 
                ELSE 4 
            END, 
            r.fecha_solicitud ASC";
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$id_profesor]);
    $revisiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $revisiones]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
$conexion = null;
?>
