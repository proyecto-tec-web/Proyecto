<?php
session_start();
require_once '../config/db.php';

try {
    // 1. LA MAGIA DE SQL: Traemos a los alumnos y usamos una subconsulta para contar las reprobadas al instante
    $sql = "
        SELECT a.id_alumno, a.boleta, a.nombre, a.apellido_paterno, a.apellido_materno, a.situacion_academica, 
               c.acronimo as carrera,
               (SELECT COUNT(*) FROM kardex k WHERE k.id_alumno = a.id_alumno AND k.calificacion < 6) AS reprobadas
        FROM alumno a 
        INNER JOIN carrera c ON a.id_carrera = c.id_carrera
    ";
            
    $stmt = $conexion->query($sql);
    $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // 2. Preparamos el actualizador por si hay que corregir a alguien
    $updateStmt = $conexion->prepare("UPDATE alumno SET situacion_academica = ? WHERE id_alumno = ?");

    // 3. Revisamos uno por uno en fracciones de segundo
    foreach ($alumnos as &$al) {
        $situacion_real = ($al['reprobadas'] >= 3) ? 'Irregular' : 'Regular';
        
        // Si la situación guardada en la BD es diferente a la real, la corregimos silenciosamente
        if ($al['situacion_academica'] !== $situacion_real) {
            $updateStmt->execute([$situacion_real, $al['id_alumno']]);
            $al['situacion_academica'] = $situacion_real; // Actualizamos el dato que se va al Frontend
        }
    }
    
    // 4. Enviamos los datos perfectos y limpios a tu JavaScript
    echo json_encode(["status" => "success", "data" => $alumnos]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>