<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' && strtolower(trim($_SESSION['usuario_rol'])) !== 'administrador')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

$datos = json_decode(file_get_contents("php://input"), true);

if ($datos) {
    try {
        $fecha_examen = $datos['fecha'];
        $hora_inicio = $datos['hora'];
        $id_salon = $datos['salon'];
        
        // Calculamos la hora de fin (+2 horas)
        $hora_fin = date('H:i:s', strtotime($hora_inicio . ' + 2 hours'));

        // ==========================================
        // REGLA 1: Nada de viajes al pasado
        // ==========================================
        $hoy = date('Y-m-d');
        if ($fecha_examen < $hoy) {
            echo json_encode(["status" => "error", "message" => "No puedes programar un examen en el pasado."]);
            exit();
        }

        // ==========================================
        // REGLA 2: Evitar cruce de horarios en salones
        // ==========================================
        // La fórmula mágica para saber si dos horarios chocan es: 
        // InicioBD < FinNuevo AND FinBD > InicioNuevo
        $sql_choque = "SELECT id_examen FROM examen 
                       WHERE id_salon = ? 
                       AND fecha = ? 
                       AND hora_inicio < ? 
                       AND hora_fin > ?";
        
        $stmt_choque = $conexion->prepare($sql_choque);
        // Le mandamos el salón, la fecha, y cruzamos las horas
        $stmt_choque->execute([$id_salon, $fecha_examen, $hora_fin, $hora_inicio]);

        // Si la base de datos nos devuelve al menos 1 fila, es que chocan
        if ($stmt_choque->rowCount() > 0) {
            echo json_encode(["status" => "error", "message" => "¡Cruce de horarios! Ese salón ya está ocupado ese día en esa franja horaria."]);
            exit();
        }

        // ==========================================
        // SI PASA LOS FILTROS, GUARDAMOS
        // ==========================================
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
?>