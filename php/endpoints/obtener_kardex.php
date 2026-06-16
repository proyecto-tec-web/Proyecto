<?php
session_start();
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (isset($_GET['id'])) {
    try {
        $id_alumno = $_GET['id'];

        $sql = "SELECT m.semestre, m.nombre as materia, k.calificacion 
                FROM kardex k
                INNER JOIN materia m ON k.id_materia = m.id_materia
                WHERE k.id_alumno = ?
                ORDER BY m.semestre ASC";
        
        $stmt = $conexion->prepare($sql);
        $stmt->execute([$id_alumno]);
        $materias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $reprobadas = 0;
        foreach ($materias as $mat) {
            if ($mat['calificacion'] < 6) {
                $reprobadas++;
            }
        }

        $nueva_situacion = ($reprobadas >= 3) ? 'Irregular' : 'Regular';

        $update = $conexion->prepare("UPDATE alumno SET situacion_academica = ? WHERE id_alumno = ?");
        $update->execute([$nueva_situacion, $id_alumno]);

        echo json_encode([
            "status" => "success", 
            "data" => $materias, 
            "situacion_calculada" => $nueva_situacion
        ]);

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
$conexion = null;
?>