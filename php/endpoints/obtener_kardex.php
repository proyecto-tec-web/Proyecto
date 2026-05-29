<?php
session_start();
require_once '../config/db.php';

if (isset($_GET['id'])) {
    try {
        $id_alumno = $_GET['id'];

        // 1. Traer todas las calificaciones del alumno (cruzando kardex con materia)
        $sql = "SELECT m.semestre, m.nombre as materia, k.calificacion 
                FROM kardex k
                INNER JOIN materia m ON k.id_materia = m.id_materia
                WHERE k.id_alumno = ?
                ORDER BY m.semestre ASC";
        
        $stmt = $conexion->prepare($sql);
        $stmt->execute([$id_alumno]);
        $materias = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. LA MAGIA: Contar reprobadas
        $reprobadas = 0;
        foreach ($materias as $mat) {
            if ($mat['calificacion'] < 6) {
                $reprobadas++;
            }
        }

        // 3. Definir Situación (Más de 3 reprobadas = Irregular)
        $nueva_situacion = ($reprobadas >= 3) ? 'Irregular' : 'Regular';

        // 4. Actualizar al alumno en la BD automáticamente
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
?>