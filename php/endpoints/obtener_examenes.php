<?php
session_start();
require_once '../config/db.php';

// Validar que sea administrador
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' && strtolower(trim($_SESSION['usuario_rol'])) !== 'administrador')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

try {
    // Cruzamos las 4 tablas para traer los nombres reales en lugar de puros IDs numéricos
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