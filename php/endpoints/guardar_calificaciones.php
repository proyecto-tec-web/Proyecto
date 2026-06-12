<?php
session_start();
require_once '../config/db.php';

$datos_recibidos = json_decode(file_get_contents("php://input"), true);

// 1. Validamos que exista la llave 'calificaciones'
if (!$datos_recibidos || !isset($datos_recibidos['calificaciones'])) {
    echo json_encode(["status" => "error", "message" => "Datos inválidos."]);
    exit();
}

$calificaciones = $datos_recibidos['calificaciones'];
$id_examen = $datos_recibidos['id_examen'];

try {
    $conexion->beginTransaction();

    $stmt = $conexion->prepare("UPDATE inscripcion_examen SET calificacion = ? WHERE id_inscripcion = ?");

    // 2. Iteramos sobre la lista de calificaciones que viene del JS
    foreach ($calificaciones as $item) {
        $calificacion = ($item['calificacion'] !== '') ? floatval($item['calificacion']) : null;
        $stmt->execute([$calificacion, $item['id_inscripcion']]);
    }

    // 3. Cerramos el examen a "Calificado" usando el ID que nos mandó el JS
    $stmtUpdateExamen = $conexion->prepare("UPDATE examen SET estado = 'Calificado' WHERE id_examen = ?");
    $stmtUpdateExamen->execute([$id_examen]);

    $conexion->commit();
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error de BD: " . $e->getMessage()]);
}
?>