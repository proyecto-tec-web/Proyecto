<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'profesor') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

$datos = json_decode(file_get_contents("php://input"), true);

if (!isset($datos['id_peticion'], $datos['calificacion_nueva'], $datos['notas'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos para calificar."]);
    exit();
}

try {
    $conexion->beginTransaction();

    // 1. Guardamos las notas y cambiamos estado a Completada
    $sqlRev = "UPDATE peticion_revision SET notas_profesor = ?, estado = 'Completada' WHERE id_peticion = ?";
    $stmtRev = $conexion->prepare($sqlRev);
    $stmtRev->execute([$datos['notas'], $datos['id_peticion']]);

    // 2. Modificamos la calificación en el kardex (inscripcion_examen)
    $sqlCalif = "UPDATE inscripcion_examen 
                 SET calificacion = ? 
                 WHERE id_inscripcion = (SELECT id_inscripcion FROM peticion_revision WHERE id_peticion = ?)";
    $stmtCalif = $conexion->prepare($sqlCalif);
    $stmtCalif->execute([$datos['calificacion_nueva'], $datos['id_peticion']]);

    $conexion->commit();
    echo json_encode(["status" => "success", "message" => "Calificación modificada exitosamente."]);

} catch (PDOException $e) {
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error al ejecutar revisión: " . $e->getMessage()]);
}

$conexion = null;

?>
