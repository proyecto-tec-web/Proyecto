<?php
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['id_inscripcion'])) {
    echo json_encode(['status' => 'error', 'message' => 'ID de inscripción no proporcionado.']);
    exit;
}

$id_inscripcion = intval($input['id_inscripcion']);

try {
    // 1. Averiguar a qué examen pertenece esta inscripción ANTES de borrarla
    $sqlBuscar = "SELECT id_examen FROM inscripcion_examen WHERE id_inscripcion = :id";
    $stmtBuscar = $conexion->prepare($sqlBuscar);
    $stmtBuscar->execute([':id' => $id_inscripcion]);
    $inscripcion = $stmtBuscar->fetch(PDO::FETCH_ASSOC);

    if (!$inscripcion) {
        echo json_encode(['status' => 'error', 'message' => 'La inscripción que intentas eliminar ya no existe.']);
        exit;
    }

    $id_examen = $inscripcion['id_examen'];

    // ==========================================
    // INICIA LA TRANSACCIÓN SEGURA
    // ==========================================
    $conexion->beginTransaction();

    // 2. Eliminar la inscripción (Liberar el asiento)
    $sqlDelete = "DELETE FROM inscripcion_examen WHERE id_inscripcion = :id";
    $stmtDelete = $conexion->prepare($sqlDelete);
    $stmtDelete->execute([':id' => $id_inscripcion]);

    // 3. Devolverle el lugar al cupo del examen (+1)
    $sqlUpdateCupo = "UPDATE examen SET cupo = cupo + 1 WHERE id_examen = :id_examen";
    $stmtUpdate = $conexion->prepare($sqlUpdateCupo);
    $stmtUpdate->execute([':id_examen' => $id_examen]);

    // 4. Confirmar los cambios en la base de datos
    $conexion->commit();

    echo json_encode(['status' => 'success']);

} catch (PDOException $e) {
    // Si algo sale mal, deshacemos cualquier cambio
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'No se pudo eliminar el registro: ' . $e->getMessage()]);
}
$conexion = null;
?>