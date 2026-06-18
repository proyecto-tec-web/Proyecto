<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

try {
    $stmtAlum = $conexion->prepare("SELECT id_alumno FROM alumno WHERE id_usuario = ?");
    $stmtAlum->execute([$_SESSION['id_usuario']]);
    $alumno = $stmtAlum->fetch(PDO::FETCH_ASSOC);

    // Buscamos exámenes en estado 'Calificado' que NO posean registros en 'peticion_revision'
    $sql = "SELECT 
                ie.id_inscripcion, 
                m.nombre AS materia, 
                ie.calificacion
            FROM inscripcion_examen ie
            INNER JOIN examen e ON ie.id_examen = e.id_examen
            INNER JOIN materia m ON e.id_materia = m.id_materia
            WHERE ie.id_alumno = ? 
              AND e.estado = 'Calificado'
              AND ie.id_inscripcion NOT IN (SELECT id_inscripcion FROM peticion_revision)";

    $stmt = $conexion->prepare($sql);
    $stmt->execute([$alumno['id_alumno']]);
    $examenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $examenes]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al consultar exámenes: " . $e->getMessage()]);
}
$conexion = null;
?>
