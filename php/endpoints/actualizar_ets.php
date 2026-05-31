<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);

if ($datos) {
    try {
        // Iniciamos la transacción para proteger todo el bloque de operaciones
        $conexion->beginTransaction();

        $id_examen = $datos['id'];
        $fecha = $datos['fecha'];
        $hora = $datos['hora'];
        $id_salon = $datos['salon'];
        
        // Verificamos si desde el frontend nos están mandando el nuevo 'estado'
        $nuevo_estado = isset($datos['estado']) ? trim($datos['estado']) : null;
        
        $hora_fin = date('H:i:s', strtotime($hora . ' + 2 hours'));

        // Regla: No chocar con otros exámenes (pero ignorando ESTE mismo examen)
        $sql_choque = "SELECT id_examen FROM examen WHERE id_salon = ? AND fecha = ? AND hora_inicio < ? AND hora_fin > ? AND id_examen != ?";
        $stmt_choque = $conexion->prepare($sql_choque);
        $stmt_choque->execute([$id_salon, $fecha, $hora_fin, $hora, $id_examen]);

        if ($stmt_choque->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Cruce de horarios: El salón ya está ocupado."]);
            exit();
        }

        // Actualizar los datos básicos del examen
        // Si nos mandaron el estado, lo actualizamos también. Si no, solo los otros campos.
        if ($nuevo_estado) {
            $sql = "UPDATE examen SET id_materia = ?, id_profesor = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, id_salon = ?, cupo = ?, estado = ? WHERE id_examen = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([$datos['materia'], $datos['sinodal'], $fecha, $hora, $hora_fin, $id_salon, $datos['cupo'], $nuevo_estado, $id_examen]);
        } else {
            $sql = "UPDATE examen SET id_materia = ?, id_profesor = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, id_salon = ?, cupo = ? WHERE id_examen = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([$datos['materia'], $datos['sinodal'], $fecha, $hora, $hora_fin, $id_salon, $datos['cupo'], $id_examen]);
        }

        // ====================================================================
        // NUEVA REGLA: SI EL EXAMEN SE CIERRA, SE ANULA A LOS QUE NO PAGARON
        // ====================================================================
        if ($nuevo_estado === 'Cerrado') {
            // 1. Contamos cuántos alumnos morosos hay (estado_pago distinto de Aprobado)
            $sqlContar = "SELECT COUNT(*) as eliminados FROM inscripcion_examen WHERE id_examen = ? AND estado_pago != 'Aprobado'";
            $stmtContar = $conexion->prepare($sqlContar);
            $stmtContar->execute([$id_examen]);
            $resultado = $stmtContar->fetch(PDO::FETCH_ASSOC);
            $lugares_liberados = $resultado ? $resultado['eliminados'] : 0;

            if ($lugares_liberados > 0) {
                // 2. Eliminamos definitivamente a los alumnos que no pagaron
                $sqlLimpieza = "DELETE FROM inscripcion_examen WHERE id_examen = ? AND estado_pago != 'Aprobado'";
                $stmtLimpieza = $conexion->prepare($sqlLimpieza);
                $stmtLimpieza->execute([$id_examen]);

                // 3. Devolvemos el cupo a la materia (por si en un futuro deciden reabrir el examen)
                $sqlDevolverCupo = "UPDATE examen SET cupo = cupo + ? WHERE id_examen = ?";
                $stmtCupo = $conexion->prepare($sqlDevolverCupo);
                $stmtCupo->execute([$lugares_liberados, $id_examen]);
            }
        }

        // Si todo salió perfecto, confirmamos los cambios
        $conexion->commit();

        echo json_encode(["status" => "success"]);

    } catch (PDOException $e) {
        // Si hay un error, deshacemos todos los cambios
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>