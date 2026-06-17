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
        echo json_encode(["status" => "error", "message" => "Profesor no encontrado."]);
        exit();
    }
    $id_profesor = $profesor['id_profesor'];

    // 1. OBTENEMOS LOS DATOS DE LA GRÁFICA POR MATERIA
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
        WHERE e.id_profesor = ? 
        AND ie.calificacion IS NOT NULL
        -- AND e.tipo_examen = 'ETS' /* DESCOMENTA ESTA LÍNEA PARA OCULTAR LOS ORDINARIOS */
        GROUP BY m.id_materia, m.nombre
    ");
    $stmtGrafica->execute([$id_profesor]);
    $datosGrafica = $stmtGrafica->fetchAll(PDO::FETCH_ASSOC);

    // 2. CALCULAMOS EL PROMEDIO GLOBAL SIMPLE DIRECTO EN PHP
    $promedioGlobal = 0.0;
    
    if (count($datosGrafica) > 0) {
        $sumaPromedios = 0;
        // Sumamos los promedios de cada materia (7.50 + 8.38)
        foreach ($datosGrafica as $fila) {
            $sumaPromedios += $fila['promedio_materia'];
        }
        // Dividimos entre la cantidad de materias (2)
        $promedioGlobal = round($sumaPromedios / count($datosGrafica), 2);
    }

    echo json_encode([
        "status" => "success",
        "data" => [
            "materias" => $datosGrafica,
            // Aseguramos que siempre tenga 2 decimales (ej. 7.94)
            "promedio_global" => number_format($promedioGlobal, 2) 
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
$conexion = null;
?>
