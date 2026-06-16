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

    // 1. KPI EXÁMENES PROGRAMADOS (Solo cuenta los que están estrictamente 'Programado' = 3)
    $stmt = $conexion->query("SELECT COUNT(*) FROM examen WHERE estado = 'Programado'");
    $response['kpis']['examenes'] = $stmt->fetchColumn();

    // 2. KPI ALUMNOS INSCRITOS (Cuenta personas únicas, ignorando a los rechazados)
    $stmt = $conexion->query("SELECT COUNT(DISTINCT id_alumno) FROM inscripcion_examen WHERE estado_pago != 'Rechazado'");
    $response['kpis']['inscritos'] = $stmt->fetchColumn();

    // 3. KPI PAGOS PENDIENTES (Exactamente estado_pago = 'Pendiente')
    $stmt = $conexion->query("SELECT COUNT(*) FROM inscripcion_examen WHERE estado_pago = 'Pendiente'");
    $response['kpis']['pagos'] = $stmt->fetchColumn();

    // 4. KPI ACTAS CAPTURADAS (Calificados vs Total general)
    $stmt = $conexion->query("SELECT COUNT(*) FROM examen WHERE estado = 'Calificado'");
    $calificados = $stmt->fetchColumn();
    
    $stmt = $conexion->query("SELECT COUNT(*) FROM examen");
    $total_examenes = $stmt->fetchColumn();
    
    $response['kpis']['actas_capturadas'] = $calificados;
    $response['kpis']['total_examenes'] = $total_examenes;

    // =========================================================
    // GRÁFICA: Top 5 Materias (Aquí SÍ sumamos todos los lugares ocupados)
    // =========================================================
    $queryChart = "SELECT m.nombre, COUNT(i.id_inscripcion) as total_inscritos 
                FROM inscripcion_examen i 
                JOIN examen e ON i.id_examen = e.id_examen 
                JOIN materia m ON e.id_materia = m.id_materia 
                WHERE i.estado_pago != 'Rechazado'
                GROUP BY m.id_materia, m.nombre 
                ORDER BY total_inscritos DESC 
                LIMIT 5";
    $stmt = $conexion->query($queryChart);
    $topMaterias = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($topMaterias as $materia) {
        $response['chart']['labels'][] = $materia['nombre'];
        $response['chart']['data'][] = $materia['total_inscritos'];
    }

    // =========================================================
    // ACTIVIDAD RECIENTE (Últimas 5, omitiendo rechazados)
    // =========================================================
    $queryActividad = "SELECT a.boleta, m.nombre as materia, i.estado_pago 
                    FROM inscripcion_examen i 
                    JOIN alumno a ON i.id_alumno = a.id_alumno 
                    JOIN examen e ON i.id_examen = e.id_examen 
                    JOIN materia m ON e.id_materia = m.id_materia 
                    WHERE i.estado_pago IN ('Pagado', 'Pendiente')
                    ORDER BY i.id_inscripcion DESC 
                    LIMIT 5";
    $stmt = $conexion->query($queryActividad);
    $response['actividad'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error de BD: ' . $e->getMessage()]);
}
?>