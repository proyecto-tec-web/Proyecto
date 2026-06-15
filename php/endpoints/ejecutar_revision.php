<?php
session_start();
require_once '../config/db.php';
    
$datos = json_decode(file_get_contents("php://input"), true);

if (!isset($datos['id_peticion'], $datos['id_inscripcion'], $datos['calificacion_nueva'], $datos['notas'])) {
    echo json_encode(["status" => "error", "message" => "Datos incompletos para ejecutar la revisión."]);
    exit();
}
if (!isset($_SESSION['id_usuario']) || $_SESSION['rol'] !== 'Profesor' && $_SESSION['rol'] !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

try {

    $conexion->beginTransaction();


    $stmtCalif = $conexion->prepare("UPDATE inscripcion_examen SET calificacion = ? WHERE id_inscripcion = ?");
    $stmtCalif->execute([$datos['calificacion_nueva'], $datos['id_inscripcion']]);

    $stmtRev = $conexion->prepare("UPDATE revision_examen SET estado = 'Completada', notas_profesor = ? WHERE id_peticion = ?");
    $stmtRev->execute([$datos['notas'], $datos['id_peticion']]);

    $conexion->commit();
    
    echo json_encode(["status" => "success"]);

} catch (PDOException $e) {
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error al ejecutar la revisión: " . $e->getMessage()]);
}

$conexion = null;
?>
