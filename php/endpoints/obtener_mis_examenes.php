<?php
session_start();
require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["status" => "error", "message" => "Sesión no válida"]);
    exit();
}

try {
    $stmtProf = $conexion->prepare("SELECT id_profesor FROM profesor WHERE id_usuario = ?");
    $stmtProf->execute([$_SESSION['id_usuario']]);
    $profesor = $stmtProf->fetch(PDO::FETCH_ASSOC);

    if (!$profesor) {
        echo json_encode(["status" => "error", "message" => "No se encontraron datos de profesor para este usuario."]);
        exit();
    }

    $id_profesor = $profesor['id_profesor'];

    $sql = "SELECT 
                e.id_examen,
                m.nombre AS materia,
                e.fecha,
                e.hora_inicio,
                e.hora_fin,
                CONCAT(s.edificio, ' - ', s.piso, ' (', s.numero, ')') AS salon,
                e.cupo,
                e.estado
            FROM examen e
            INNER JOIN materia m ON e.id_materia = m.id_materia
            INNER JOIN salon s ON e.id_salon = s.id_salon
            WHERE e.id_profesor = ?
            ORDER BY e.fecha ASC, e.hora_inicio ASC";
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$id_profesor]);
    $examenes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "data" => $examenes]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
$conexion = null;   
?>
