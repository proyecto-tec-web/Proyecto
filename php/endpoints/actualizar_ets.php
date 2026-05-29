<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);

if ($datos) {
    try {
        $id_examen = $datos['id'];
        $fecha = $datos['fecha'];
        $hora = $datos['hora'];
        $id_salon = $datos['salon'];
        
        $hora_fin = date('H:i:s', strtotime($hora . ' + 2 hours'));

        // Regla: No chocar con otros exámenes (pero ignorando ESTE mismo examen)
        $sql_choque = "SELECT id_examen FROM examen WHERE id_salon = ? AND fecha = ? AND hora_inicio < ? AND hora_fin > ? AND id_examen != ?";
        $stmt_choque = $conexion->prepare($sql_choque);
        $stmt_choque->execute([$id_salon, $fecha, $hora_fin, $hora, $id_examen]);

        if ($stmt_choque->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Cruce de horarios: El salón ya está ocupado."]);
            exit();
        }

        $sql = "UPDATE examen SET id_materia = ?, id_profesor = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, id_salon = ?, cupo = ? WHERE id_examen = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->execute([$datos['materia'], $datos['sinodal'], $fecha, $hora, $hora_fin, $id_salon, $datos['cupo'], $id_examen]);

        echo json_encode(["status" => "success"]);

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>