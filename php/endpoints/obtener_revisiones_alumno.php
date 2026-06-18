<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $stmtAlum = $conexion->prepare("SELECT id_alumno FROM alumno WHERE id_usuario = ?");
    $stmtAlum->execute([$_SESSION['id_usuario']]);
    $alumno = $stmtAlum->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        echo json_encode(["status" => "error", "message" => "Registro de alumno no encontrado."]);
        exit();
    }

    // Usamos los nombres reales de la BD, pero con AS para que JS los entienda
    $sql = "SELECT 
                r.id_peticion,
                m.nombre AS materia,
                DATE_FORMAT(r.fecha_solicitud, '%d/%m/%Y %H:%i') AS fecha_solicitud,
                r.motivo_alumno,
                r.estado,
                DATE_FORMAT(r.fecha_revision_agendada, '%d/%m/%Y %H:%i') AS fecha_cita, 
                r.lugar_revision AS lugar_cita,
                r.notas_profesor
            FROM peticion_revision r
            INNER JOIN inscripcion_examen ie ON r.id_inscripcion = ie.id_inscripcion
            INNER JOIN examen e ON ie.id_examen = e.id_examen
            INNER JOIN materia m ON e.id_materia = m.id_materia
            WHERE ie.id_alumno = ?
            ORDER BY r.fecha_solicitud DESC";

    $stmt = $conexion->prepare($sql);
    $stmt->execute([$alumno['id_alumno']]);
    $revisiones = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $revisiones]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}
$conexion = null;
?>
