<?php
header('Content-Type: application/json');

require_once __DIR__ . '/seguridad_admin.php'; 
require_once __DIR__ . '/../config/db.php';

if (!isset($conexion) || !$conexion) {
    echo json_encode(['status' => 'error', 'message' => 'No se pudo establecer la conexión a la base de datos']);
    exit;
}

try {
    $response = [
        'status' => 'success',
        'kpis' => [],
        'chart' => ['labels' => [], 'data' => []],
        'actividad' => []
    ];

    // 1. OBTENER KPIs
    // Exámenes Programados / Abiertos (Usando la tabla 'examen' y la variable '$conexion')
    $stmt = $conexion->query("SELECT COUNT(*) as total FROM examen WHERE estado IN ('Programado', 'Abierto')");
    $response['kpis']['examenes'] = $stmt->fetchColumn();

    // Alumnos Inscritos únicos (Usando la tabla 'inscripcion_examen')
    $stmt = $conexion->query("SELECT COUNT(DISTINCT id_alumno) as total FROM inscripcion_examen");
    $response['kpis']['inscritos'] = $stmt->fetchColumn();

    // Pagos Pendientes
    $stmt = $conexion->query("SELECT COUNT(*) as total FROM inscripcion_examen WHERE estado_pago = 'Pendiente'");
    $response['kpis']['pagos'] = $stmt->fetchColumn();

    // Actas Capturadas (Exámenes calificados vs Total de exámenes)
    $stmt = $conexion->query("SELECT COUNT(*) as total FROM examen WHERE estado = 'Calificado'");
    $calificados = $stmt->fetchColumn();
    $stmt = $conexion->query("SELECT COUNT(*) as total FROM examen");
    $total_examenes = $stmt->fetchColumn();
    
    $response['kpis']['actas_capturadas'] = $calificados;
    $response['kpis']['total_examenes'] = $total_examenes;

    // 2. OBTENER DATOS PARA LA GRÁFICA (Top 5 materias con más inscripciones)
    $queryChart = "SELECT m.nombre, COUNT(i.id_inscripcion) as total_inscritos 
                FROM inscripcion_examen i 
                JOIN examen e ON i.id_examen = e.id_examen 
                JOIN materia m ON e.id_materia = m.id_materia 
                GROUP BY m.id_materia 
                ORDER BY total_inscritos DESC 
                LIMIT 5";
    $stmt = $conexion->query($queryChart);
    $topMaterias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($topMaterias as $materia) {
        $response['chart']['labels'][] = $materia['nombre'];
        $response['chart']['data'][] = $materia['total_inscritos'];
    }

    // 3. OBTENER ACTIVIDAD RECIENTE (Últimas 5 inscripciones)
    $queryActividad = "SELECT a.boleta, m.nombre as materia, i.estado_pago 
                    FROM inscripcion_examen i 
                    JOIN alumno a ON i.id_alumno = a.id_alumno 
                    JOIN examen e ON i.id_examen = e.id_examen 
                    JOIN materia m ON e.id_materia = m.id_materia 
                    ORDER BY i.id_inscripcion DESC 
                    LIMIT 5";
    $stmt = $conexion->query($queryActividad);
    $response['actividad'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
}
?>