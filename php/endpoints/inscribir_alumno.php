<?php
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['boleta']) || empty($input['id_examen'])) {
    echo json_encode(['status' => 'error', 'message' => 'Campos obligatorios incompletos.']);
    exit;
}

$boleta = trim($input['boleta']);
$id_examen = intval($input['id_examen']);

try {
    // 1. Obtener id_alumno a través de su boleta
    $sqlBusqueda = "SELECT id_alumno FROM alumno WHERE boleta = :boleta";
    $stmtBusqueda = $conexion->prepare($sqlBusqueda);
    $stmtBusqueda->execute([':boleta' => $boleta]);
    $alumno = $stmtBusqueda->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        echo json_encode(['status' => 'error', 'message' => 'La boleta ingresada no pertenece a ningún alumno registrado.']);
        exit;
    }
    
    $id_alumno = $alumno['id_alumno'];

    // 2. Comprobar si el alumno ya se inscribió a este examen para no duplicar
    $sqlValidar = "SELECT id_inscripcion FROM inscripcion_examen WHERE id_alumno = :id_alumno AND id_examen = :id_examen";
    $stmtValidar = $conexion->prepare($sqlValidar);
    $stmtValidar->execute([':id_alumno' => $id_alumno, ':id_examen' => $id_examen]);

    if ($stmtValidar->rowCount() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Este alumno ya cuenta con una solicitud de inscripción para este examen.']);
        exit;
    }

    // 3. Verificar si todavía hay cupo disponible
    $sqlCupo = "SELECT cupo FROM examen WHERE id_examen = :id_examen";
    $stmtCupo = $conexion->prepare($sqlCupo);
    $stmtCupo->execute([':id_examen' => $id_examen]);
    $examenInfo = $stmtCupo->fetch(PDO::FETCH_ASSOC);

    if (!$examenInfo || $examenInfo['cupo'] <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'El examen seleccionado ya no tiene cupo disponible.']);
        exit;
    }

    // ==========================================
    // INICIA LA TRANSACCIÓN SEGURA
    // ==========================================
    $conexion->beginTransaction();

    // 4. Insertar la inscripción
    $sqlInsert = "INSERT INTO inscripcion_examen (estado_pago, id_alumno, id_examen) VALUES ('Pendiente', :id_alumno, :id_examen)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->execute([':id_alumno' => $id_alumno, ':id_examen' => $id_examen]);

    // 5. Restar 1 al cupo del examen
    $sqlUpdateCupo = "UPDATE examen SET cupo = cupo - 1 WHERE id_examen = :id_examen";
    $stmtUpdate = $conexion->prepare($sqlUpdateCupo);
    $stmtUpdate->execute([':id_examen' => $id_examen]);

    // Confirmar los cambios si todo salió bien
    $conexion->commit();

    echo json_encode(['status' => 'success']);

} catch (PDOException $e) {
    // Si algo falla, cancelamos la inscripción y no restamos el cupo
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Fallo en la BD: ' . $e->getMessage()]);
}
$conexion = null;
?>