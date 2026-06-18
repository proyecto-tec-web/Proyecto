<?php
session_start();
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {
    $sql = "
        SELECT a.id_alumno, a.boleta, a.nombre, a.apellido_paterno, a.apellido_materno, a.situacion_academica, 
               c.acronimo as carrera,
               (SELECT COUNT(*) FROM kardex k WHERE k.id_alumno = a.id_alumno AND k.calificacion < 6) AS reprobadas
        FROM alumno a 
        INNER JOIN carrera c ON a.id_carrera = c.id_carrera
    ";
            
    $stmt = $conexion->query($sql);
    $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $updateStmt = $conexion->prepare("UPDATE alumno SET situacion_academica = ? WHERE id_alumno = ?");

    foreach ($alumnos as &$al) {
        // --- NUEVA REGLA ---
        // Si el alumno ya está dado de baja, lo ignoramos y no recalculamos su estado.
        if ($al['situacion_academica'] === 'Baja') {
            continue; 
        }
        
        // Si no está de baja, entonces sí calculamos si es Regular o Irregular
        $situacion_real = ($al['reprobadas'] >= 3) ? 'Irregular' : 'Regular';
        
        // por si no es la situacion verdadera, la actualizamos en la base de datos y en el array que se enviará al frontend
        if ($al['situacion_academica'] !== $situacion_real) {
            $updateStmt->execute([$situacion_real, $al['id_alumno']]);
            $al['situacion_academica'] = $situacion_real; 
        }
    }
    
    echo json_encode(["status" => "success", "data" => $alumnos]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
$conexion = null;
?>