<?php
session_start();
require_once '../config/db.php';

// ⏱️ Usamos la hora de la Ciudad de México
date_default_timezone_set('America/Mexico_City');
$fecha_hora_actual = date('Y-m-d H:i:s'); 

// Validar que sea administrador
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' && strtolower(trim($_SESSION['usuario_rol'])) !== 'administrador')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

try {
    // 🚀 NIVEL DIOS (REGLA FINANCIERA): Cerramos el examen exactamente 2 días (48 horas) ANTES de su hora de inicio.
    // Si la fecha del examen es menor o igual a "hoy + 2 días", lo cierra automáticamente.
    $sqlCierre = "UPDATE examen SET estado = 'Cerrado' WHERE CONCAT(fecha, ' ', hora_inicio) <= DATE_ADD(?, INTERVAL 2 DAY) AND estado = 'Abierto'";
    $stmtCierre = $conexion->prepare($sqlCierre);
    $stmtCierre->execute([$fecha_hora_actual]);

    // Cruzamos las tablas para traer la información a la vista
    $sql = "SELECT 
                e.id_examen,
                m.nombre AS materia,
                e.fecha,
                e.hora_inicio,
                e.hora_fin,
                CONCAT(p.nombre, ' ', p.apellido_paterno) AS sinodal,
                CONCAT(s.edificio, ' - ', s.numero) AS salon,
                e.cupo,
                e.estado
            FROM examen e
            INNER JOIN materia m ON e.id_materia = m.id_materia
            INNER JOIN profesor p ON e.id_profesor = p.id_profesor
            INNER JOIN salon s ON e.id_salon = s.id_salon
            ORDER BY e.fecha ASC, e.hora_inicio ASC";
            
    $stmt = $conexion->query($sql);
    $examenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $examenes]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>