<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

try {
    // 1. Obtener el ID del profesor
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);

    if (!$profesor) {
        echo json_encode(["status" => "error", "message" => "Profesor no encontrado."]);
        exit();
    }
    $id_profesor = $profesor['id_profesor'];

    // 2. Obtener datos agrupados por materia para la gráfica de barras
    $stmtGrafica = $conexion->prepare("
        SELECT 
            m.nombre AS materia,
            COUNT(ie.id_inscripcion) AS total_evaluados,
            SUM(CASE WHEN ie.calificacion >= 6.0 THEN 1 ELSE 0 END) AS aprobados,
            SUM(CASE WHEN ie.calificacion < 6.0 THEN 1 ELSE 0 END) AS reprobados,
            ROUND(AVG(ie.calificacion), 2) AS promedio_materia
        FROM examen e 
        JOIN materia m ON e.id_materia = m.id_materia
        JOIN inscripcion_examen ie ON e.id_examen = ie.id_examen 
        WHERE e.id_profesor = ? AND ie.calificacion IS NOT NULL
        GROUP BY m.id_materia, m.nombre
    ");
    $stmtGrafica->execute([$id_profesor]);
    $datosGrafica = $stmtGrafica->fetchAll(PDO::FETCH_ASSOC);

    // 3. Obtener el Promedio Global de todas las materias evaluadas
    $stmtGlobal = $conexion->prepare("
        SELECT ROUND(AVG(ie.calificacion), 2) AS promedio_global 
        FROM examen e 
        JOIN inscripcion_examen ie ON e.id_examen = ie.id_examen 
        WHERE e.id_profesor = ? AND ie.calificacion IS NOT NULL
    ");
    $stmtGlobal->execute([$id_profesor]);
    $promedioGlobal = $stmtGlobal->fetchColumn(); 
    
    // Si es null (aún no califica a nadie), lo ponemos en 0.0
    $promedioGlobal = $promedioGlobal ? $promedioGlobal : "0.0";

    echo json_encode([
        "status" => "success",
        "data" => [
            "materias" => $datosGrafica,
            "promedio_global" => $promedioGlobal
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
