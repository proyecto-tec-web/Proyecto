<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);

// Validación de seguridad básica
if (!isset($datos['id_peticion'], $datos['id_inscripcion'], $datos['calificacion_nueva'], $datos['notas'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos para ejecutar la revisión."]);
    exit();
}

try {
    // Iniciamos la transacción (Todo o nada)
    $conexion->beginTransaction();

    // 1. Sobreescribimos la calificación en el registro de inscripción (El Kardex)
    $stmtCalif = $conexion->prepare("UPDATE inscripcion_examen SET calificacion = ? WHERE id_inscripcion = ?");
    $stmtCalif->execute([$datos['calificacion_nueva'], $datos['id_inscripcion']]);

    // 2. Marcamos la revisión como 'Completada' y guardamos la justificación
    $stmtRev = $conexion->prepare("UPDATE revision_examen SET estado = 'Completada', notas_profesor = ? WHERE id_peticion = ?");
    $stmtRev->execute([$datos['notas'], $datos['id_peticion']]);

    // Confirmamos los cambios
    $conexion->commit();
    
    echo json_encode(["status" => "success"]);

} catch (PDOException $e) {
    // Si algo falla, deshacemos cualquier cambio
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error al ejecutar la revisión: " . $e->getMessage()]);
}
?>
