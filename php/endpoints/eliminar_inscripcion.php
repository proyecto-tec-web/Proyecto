<?php
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';
session_start();

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

if (empty($input['id_inscripcion'])) {
    echo json_encode(['status' => 'error', 'message' => 'ID de inscripción no proporcionado.']);
    exit;
}


$id_inscripcion = intval($input['id_inscripcion']);

try {
    $sqlBuscar = "SELECT id_examen FROM inscripcion_examen WHERE id_inscripcion = :id";
    $stmtBuscar = $conexion->prepare($sqlBuscar);
    $stmtBuscar->execute([':id' => $id_inscripcion]);
    $inscripcion = $stmtBuscar->fetch(PDO::FETCH_ASSOC);

    if (!$inscripcion) {
        echo json_encode(['status' => 'error', 'message' => 'La inscripción que intentas eliminar ya no existe.']);
        exit;
    }

    $id_examen = $inscripcion['id_examen'];
    $conexion->beginTransaction();

    $sqlDelete = "DELETE FROM inscripcion_examen WHERE id_inscripcion = :id";
    $stmtDelete = $conexion->prepare($sqlDelete);
    $stmtDelete->execute([':id' => $id_inscripcion]);

    $sqlUpdateCupo = "UPDATE examen SET cupo = cupo + 1 WHERE id_examen = :id_examen";
    $stmtUpdate = $conexion->prepare($sqlUpdateCupo);
    $stmtUpdate->execute([':id_examen' => $id_examen]);

    $conexion->commit();

    echo json_encode(['status' => 'success']);

} catch (PDOException $e) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar el registro: ' . $e->getMessage()]);
}
$conexion = null;
?>