<?php
session_start();
require_once '../config/db.php';

// Validar que sea profesor o sinodal
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'profesor' && strtolower(trim($_SESSION['usuario_rol'])) !== 'sinodal')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado. Solo profesores."]);
    exit();
}

try {
    // 1. Encontrar quién es el profesor actual
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);

    if (!$profesor) {
        echo json_encode(["status" => "error", "message" => "No tienes un perfil de profesor asignado."]);
        exit();
    }
    
    $id_profesor = $profesor['id_profesor'];

    // 2. Traer SOLO los exámenes que le tocan a este profesor
    $sql = "SELECT 
                e.id_examen,
                m.nombre AS materia,
                e.fecha,
                e.hora_inicio,
                e.hora_fin,
                CONCAT(s.edificio, ' - ', s.piso, ' (', s.numero, ')') AS salon,
                e.estado
            FROM examen e
            INNER JOIN materia m ON e.id_materia = m.id_materia
            INNER JOIN salon s ON e.id_salon = s.id_salon
            WHERE e.id_profesor = ?
            ORDER BY e.estado ASC, e.fecha ASC"; // Ordena los activos primero
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$id_profesor]);
    $examenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $examenes]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>
