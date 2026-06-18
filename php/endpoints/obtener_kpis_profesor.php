<?php
session_start();
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

try {
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);

    if (!$profesor) {
        echo json_encode(["status" => "error", "message" => "No eres un profesor."]);
        exit();
    }
    $id_profesor = $profesor['id_profesor'];

    // KPI 1: MIS EXÁMENES ETS (Total de sesiones tipo ETS asignadas al profesor)
    $stmtExamenes = $conexion->prepare("
        SELECT COUNT(*) as total 
        FROM examen 
        WHERE id_profesor = ? AND tipo_examen = 'ETS' AND estado != 'Calificado'
    ");
    $stmtExamenes->execute([$id_profesor]);
    $totalExamenes = $stmtExamenes->fetch(PDO::FETCH_ASSOC)['total'];

    // KPI 2: ALUMNOS A EVALUAR 
    // Regla: Solo cuenta inscripciones a ETS donde NO hay calificación Y el alumno YA PAGÓ
    $stmtAlumnos = $conexion->prepare("
        SELECT COUNT(ie.id_inscripcion) as total 
        FROM inscripcion_examen ie 
        INNER JOIN examen e ON ie.id_examen = e.id_examen 
        WHERE e.id_profesor = ? 
        AND e.tipo_examen = 'ETS' 
        AND ie.calificacion IS NULL 
        AND ie.estado_pago = 'Pagado'
    ");
    $stmtAlumnos->execute([$id_profesor]);
    $totalAlumnos = $stmtAlumnos->fetch(PDO::FETCH_ASSOC)['total'];

    // KPI 3: EXÁMENES CALIFICADOS
    // Regla: Cuenta cuántas hojas de examen (alumnos individuales) ha calificado el profesor en total
    $stmtCalificados = $conexion->prepare("
        SELECT COUNT(ie.id_inscripcion) as total 
        FROM inscripcion_examen ie 
        INNER JOIN examen e ON ie.id_examen = e.id_examen 
        WHERE e.id_profesor = ? AND ie.calificacion IS NOT NULL
    ");
    $stmtCalificados->execute([$id_profesor]);
    $examenesCalificados = $stmtCalificados->fetch(PDO::FETCH_ASSOC)['total'];

    echo json_encode([
        "status" => "success",
        "data" => [
            "total_examenes" => $totalExamenes,
            "total_alumnos" => $totalAlumnos,
            "examenes_calificados" => $examenesCalificados
        ]
    ]);
} 
catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
$conexion = null;
?>
