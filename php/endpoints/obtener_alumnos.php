<?php
session_start();
require_once '../config/db.php';

try {
    // Unimos la tabla alumno con carrera para mostrar "ISC" en lugar de un simple "1"
    $sql = "SELECT a.boleta, a.nombre, a.apellido_paterno, a.apellido_materno, a.situacion_academica, c.acronimo as carrera 
            FROM alumno a 
            INNER JOIN carrera c ON a.id_carrera = c.id_carrera";
            
    $stmt = $conexion->query($sql);
    $alumnos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["status" => "success", "data" => $alumnos]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>