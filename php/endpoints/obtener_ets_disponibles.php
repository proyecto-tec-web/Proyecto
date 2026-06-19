<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no válida. Inicia sesión como alumno.']);
    exit;
}

try {
    // 1. Obtener el ID del alumno que tiene la sesión activa
    $stmtAlumno = $conexion->prepare("SELECT id_alumno FROM alumno WHERE id_usuario = :id_usuario");
    $stmtAlumno->execute([':id_usuario' => $_SESSION['id_usuario']]);
    $alumno = $stmtAlumno->fetch(PDO::FETCH_ASSOC);
    $id_alumno = $alumno ? intval($alumno['id_alumno']) : 0;

    // 2. LA NUEVA CONSULTA INTELIGENTE
    $sql = "SELECT
                e.id_examen,
                DATE_FORMAT(e.fecha, '%d/%m/%Y') AS fecha,
                TIME_FORMAT(e.hora_inicio, '%h:%i %p') AS hora,
                e.cupo,
                m.nombre AS materia,
                a.nombre AS academia,
                CONCAT(p.nombre, ' ', p.apellido_paterno, ' ', p.apellido_materno) AS profesor,
                s.numero AS salon,
                s.edificio,
                (SELECT COUNT(*)
                   FROM inscripcion_examen i
                  WHERE i.id_examen = e.id_examen
                    AND i.id_alumno = :id_alumno) AS ya_inscrito
            FROM examen e
            INNER JOIN materia  m ON e.id_materia  = m.id_materia
            INNER JOIN area     a ON m.id_area     = a.id_area
            INNER JOIN profesor p ON e.id_profesor = p.id_profesor
            INNER JOIN salon    s ON e.id_salon    = s.id_salon
            WHERE e.estado = 'Abierto'
            
            /* ---- LA MAGIA SUCEDE AQUÍ ---- */
            /* Filtramos para que SOLO aparezcan las materias donde el alumno sacó menos de 6 */
            AND EXISTS (
                SELECT 1 
                FROM kardex k 
                WHERE k.id_materia = e.id_materia 
                  AND k.id_alumno = :id_alumno 
                  AND k.calificacion < 6
            )
            
            ORDER BY e.fecha ASC, e.hora_inicio ASC";

    $stmt = $conexion->prepare($sql);
    
    // Le pasamos el id_alumno a TODAS las variables :id_alumno de la consulta
    $stmt->execute([':id_alumno' => $id_alumno]);
    $datos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['status' => 'success', 'data' => $datos]);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Fallo en la BD: ' . $e->getMessage()]);
}
$conexion = null;
?>