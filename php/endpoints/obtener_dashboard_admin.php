<?php
// Validamos si la conexión a la base de datos existe y es válida antes de empezar
if (!isset($conexion) || !$conexion) {
    echo json_encode(['status' => 'error', 'message' => 'No se pudo establecer la conexión a la base de datos']);
    exit;
}

try {
    // 1. Preparamos el formato del JSON que enviaremos al navegador
    $response = [
        'status' => 'success',
        'kpis' => [], // Aquí guardaremos los contadores numéricos
        'chart' => ['labels' => [], 'data' => []], // Datos para dibujar una gráfica
        'actividad' => [] // Lista de los movimientos más recientes
    ];

    // 2. RECOLECCIÓN DE KPIs
    // Contamos cuántos exámenes están marcados como 'Programado'
    $stmt = $conexion->query("SELECT COUNT(*) FROM examen WHERE estado = 'Programado'");
    $response['kpis']['examenes'] = $stmt->fetchColumn();

    // Contamos cuántos alumnos distintos se han inscrito (excluyendo los pagos rechazados)
    $stmt = $conexion->query("SELECT COUNT(DISTINCT id_alumno) FROM inscripcion_examen WHERE estado_pago != 'Rechazado'");
    $response['kpis']['inscritos'] = $stmt->fetchColumn();

    // Contamos cuántas inscripciones tienen el pago en estado 'Pendiente'
    $stmt = $conexion->query("SELECT COUNT(*) FROM inscripcion_examen WHERE estado_pago = 'Pendiente'");
    $response['kpis']['pagos'] = $stmt->fetchColumn();

    // Calculamos el porcentaje o avance de actas capturadas vs total de exámenes
    $stmt = $conexion->query("SELECT COUNT(*) FROM examen WHERE estado = 'Calificado'");
    $calificados = $stmt->fetchColumn();
    
    $stmt = $conexion->query("SELECT COUNT(*) FROM examen");
    $total_examenes = $stmt->fetchColumn();
    
    $response['kpis']['actas_capturadas'] = $calificados;
    $response['kpis']['total_examenes'] = $total_examenes;

    // 3. DATOS PARA LA GRÁFICA (Las 5 materias con más inscritos)
    // Usamos JOIN para unir tablas y obtener el nombre de la materia junto a su cuenta
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
    
    // Convertimos los resultados en dos listas separadas para que JavaScript (la librería de gráficas) los entienda
    foreach ($topMaterias as $materia) {
        $response['chart']['labels'][] = $materia['nombre']; // Nombres de las materias
        $response['chart']['data'][] = $materia['total_inscritos']; // Cantidad de alumnos
    }

    // 4. ACTIVIDAD RECIENTE (Los 5 movimientos más nuevos)
    // Mostramos qué alumnos se inscribieron recientemente a qué materias
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

    // 5. Entregamos todo el paquete de información en formato JSON
    echo json_encode($response);

} catch (PDOException $e) {
    // Si algo falla en la base de datos, mandamos un mensaje de error limpio
    echo json_encode(['status' => 'error', 'message' => 'Error de BD: ' . $e->getMessage()]);
}
?>