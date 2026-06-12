<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

try {
    // Buscar el ID del profesor
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);

    if (!$profesor) {
        echo json_encode(["status" => "error", "message" => "No eres un profesor."]);
        exit();
    }
    $id_profesor = $profesor['id_profesor'];

    // KPI 1: Exámenes Asignados
    $stmtExamenes = $conexion->prepare("SELECT COUNT(*) as total FROM examen WHERE id_profesor = ?");
    $stmtExamenes->execute([$id_profesor]);
    $totalExamenes = $stmtExamenes->fetch(PDO::FETCH_ASSOC)['total'];

    // KPI 2: Alumnos a Evaluar (CAMBIADO: Solo cuenta los que NO tienen calificación asignada aún)
    // Esto hace que el número decrezca conforme vas calificando alumnos
    $stmtAlumnos = $conexion->prepare("
        SELECT COUNT(ie.id_inscripcion) as total 
        FROM inscripcion_examen ie 
        INNER JOIN examen e ON ie.id_examen = e.id_examen 
        WHERE e.id_profesor = ? AND ie.calificacion IS NULL
    ");
    $stmtAlumnos->execute([$id_profesor]);
    $totalAlumnos = $stmtAlumnos->fetch(PDO::FETCH_ASSOC)['total'];

    // KPI 3: Exámenes Calificados (CAMBIADO: Cuenta los exámenes que ya pasaron a estado 'Calificado')
    $stmtCalificados = $conexion->prepare("
        SELECT COUNT(*) as total 
        FROM examen 
        WHERE id_profesor = ? AND estado = 'Calificado'
    ");
    $stmtCalificados->execute([$id_profesor]);
    $examenesCalificados = $stmtCalificados->fetch(PDO::FETCH_ASSOC)['total'];

    // Enviamos los datos ordenados al JavaScript
    echo json_encode([
        "status" => "success",
        "data" => [
            "total_examenes" => $totalExamenes,
            "total_alumnos" => $totalAlumnos,
            "examenes_calificados" => $examenesCalificados
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>