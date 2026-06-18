<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}
if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$datos = json_decode(file_get_contents("php://input"), true);

if ($datos) {
    try {
        $conexion->beginTransaction();

        $id_examen = $datos['id_examen'];
        $fecha = $datos['fecha'];
        $hora = $datos['hora'];
        $id_salon = $datos['salon'];
        
        $nuevo_estado = isset($datos['estado']) ? trim($datos['estado']) : null;
        
        $hora_fin = date('H:i:s', strtotime($hora . ' + 2 hours'));


        $sql_choque = "SELECT id_examen FROM examen WHERE id_salon = ? AND fecha = ? AND hora_inicio < ? AND hora_fin > ? AND id_examen != ?";
        $stmt_choque = $conexion->prepare($sql_choque);
        $stmt_choque->execute([$id_salon, $fecha, $hora_fin, $hora, $id_examen]);

        if ($stmt_choque->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Cruce de horarios: El salón ya está ocupado."]);
            exit();
        }

        if ($nuevo_estado) {
            $sql = "UPDATE examen SET id_materia = ?, id_profesor = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, id_salon = ?, cupo = ?, estado = ? WHERE id_examen = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([$datos['materia'], $datos['sinodal'], $fecha, $hora, $hora_fin, $id_salon, $datos['cupo'], $nuevo_estado, $id_examen]);
        } else {
            $sql = "UPDATE examen SET id_materia = ?, id_profesor = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, id_salon = ?, cupo = ? WHERE id_examen = ?";
            $stmt = $conexion->prepare($sql);
            $stmt->execute([$datos['materia'], $datos['sinodal'], $fecha, $hora, $hora_fin, $id_salon, $datos['cupo'], $id_examen]);
        }

        if ($nuevo_estado === 'Cerrado') {
            $sqlContar = "SELECT COUNT(*) as eliminados FROM inscripcion_examen WHERE id_examen = ? AND estado_pago != 'Aprobado'";
            $stmtContar = $conexion->prepare($sqlContar);
            $stmtContar->execute([$id_examen]);
            $resultado = $stmtContar->fetch(PDO::FETCH_ASSOC);
            $lugares_liberados = $resultado ? $resultado['eliminados'] : 0;

            if ($lugares_liberados > 0) {
                $sqlLimpieza = "DELETE FROM inscripcion_examen WHERE id_examen = ? AND estado_pago != 'Aprobado'";
                $stmtLimpieza = $conexion->prepare($sqlLimpieza);
                $stmtLimpieza->execute([$id_examen]);

                $sqlDevolverCupo = "UPDATE examen SET cupo = cupo + ? WHERE id_examen = ?";
                $stmtCupo = $conexion->prepare($sqlDevolverCupo);
                $stmtCupo->execute([$lugares_liberados, $id_examen]);
            }
        }
        $conexion->commit();

        echo json_encode(["status" => "success"]);

    } catch (PDOException $e) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
$conexion = null;
?>
