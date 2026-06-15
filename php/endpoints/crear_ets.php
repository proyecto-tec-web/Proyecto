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
        $fecha_examen = $datos['fecha'];
        $hora_inicio = $datos['hora'];
        $id_salon = $datos['salon'];
        
        $hora_fin = date('H:i:s', strtotime($hora_inicio . ' + 2 hours'));

        $hoy = date('Y-m-d');
        if ($fecha_examen < $hoy) {
            echo json_encode(["status" => "error", "message" => "No puedes programar un examen en el pasado."]);
            exit();
        }


        $sql_choque = "SELECT id_examen FROM examen 
                    WHERE id_salon = ? 
                    AND fecha = ? 
                    AND hora_inicio < ? 
                    AND hora_fin > ?";
        
        $stmt_choque = $conexion->prepare($sql_choque);
        $stmt_choque->execute([$id_salon, $fecha_examen, $hora_fin, $hora_inicio]);
        if ($stmt_choque->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "Cruce de horarios, el salón ya está ocupado ese día en esa franja horaria."]);
            exit();
        }

        $sql = "INSERT INTO examen (fecha, hora_inicio, hora_fin, estado, periodo_escolar, tipo_examen, cupo, id_materia, id_profesor, id_salon) 
                VALUES (?, ?, ?, 'Programado', '2026-2', 'ETS', ?, ?, ?, ?)";
        
        $stmt = $conexion->prepare($sql);
        
        $stmt->execute([
            $fecha_examen,
            $hora_inicio,
            $hora_fin,
            $datos['cupo'],
            $datos['materia'],
            $datos['sinodal'],
            $id_salon
        ]);

        echo json_encode(["status" => "success", "message" => "ETS programado correctamente."]);

    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Error al guardar en BD: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos."]);
}
$conexion = null;
?>