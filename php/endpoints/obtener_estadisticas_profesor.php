<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no válida"]);
    exit();
}

try {
    // 1. Identificar al profesor
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);
    $id_profesor = $profesor['id_profesor'];

    // 2. Contar Aprobados (>= 6) y Reprobados (< 6) en los exámenes de este profesor
    $sql = "SELECT 
                SUM(CASE WHEN ie.calificacion >= 6.0 THEN 1 ELSE 0 END) as aprobados,
                SUM(CASE WHEN ie.calificacion < 6.0 THEN 1 ELSE 0 END) as reprobados
            FROM inscripcion_examen ie
            INNER JOIN examen e ON ie.id_examen = e.id_examen
            WHERE e.id_profesor = ? AND ie.calificacion IS NOT NULL";
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$id_profesor]);
    $stats = $stmt->fetch(PDO::FETCH_ASSOC);

    // Evitamos valores nulos si el profesor es nuevo y no ha calificado a nadie
    $aprobados = $stats['aprobados'] ?? 0;
    $reprobados = $stats['reprobados'] ?? 0;

    echo json_encode([
        "status" => "success",
        "data" => [
            "aprobados" => (int)$aprobados,
            "reprobados" => (int)$reprobados
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>
