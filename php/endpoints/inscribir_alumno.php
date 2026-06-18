<?php
session_start(); // 1. INICIAMOS SESIÓN
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';

// 2. ESCUDO DE SEGURIDAD: Solo el admin puede inscribir manualmente (o ajusta si el alumno puede)
if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'] ?? '')) !== 'admin')) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado. Se requieren permisos de administrador."]);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['boleta']) || empty($input['id_examen'])) {
    echo json_encode(['status' => 'error', 'message' => 'Campos obligatorios incompletos.']);
    exit;
}

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$boleta = trim($input['boleta']);
$id_examen = intval($input['id_examen']);

try {
    $sqlBusqueda = "SELECT id_alumno, situacion_academica FROM alumno WHERE boleta = :boleta";
    $stmtBusqueda = $conexion->prepare($sqlBusqueda);
    $stmtBusqueda->execute([':boleta' => $boleta]);
    $alumno = $stmtBusqueda->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        echo json_encode(['status' => 'error', 'message' => 'La boleta ingresada no pertenece a ningún alumno registrado.']);
        exit;
    }
    
    $id_alumno = $alumno['id_alumno'];

    $sqlKardex = "SELECT k.calificacion 
                FROM kardex k 
                JOIN examen e ON k.id_materia = e.id_materia 
                WHERE k.id_alumno = :id_alumno AND e.id_examen = :id_examen";
    
    $stmtKardex = $conexion->prepare($sqlKardex);
    $stmtKardex->execute([':id_alumno' => $id_alumno, ':id_examen' => $id_examen]);
    $resultadoKardex = $stmtKardex->fetch(PDO::FETCH_ASSOC);

    if (!$resultadoKardex) {
        echo json_encode(['status' => 'error', 'message' => 'El alumno no tiene cursada esta materia en su kardex. No tiene derecho a ETS.']);
        exit;
    }

    if (floatval($resultadoKardex['calificacion']) >= 6.0) {
        echo json_encode(['status' => 'error', 'message' => 'Inscripción denegada. El alumno ya tiene esta materia Aprobada con ' . $resultadoKardex['calificacion']]);
        exit;
    }

    $sqlValidar = "SELECT id_inscripcion FROM inscripcion_examen WHERE id_alumno = :id_alumno AND id_examen = :id_examen";
    $stmtValidar = $conexion->prepare($sqlValidar);
    $stmtValidar->execute([':id_alumno' => $id_alumno, ':id_examen' => $id_examen]);

    if ($stmtValidar->rowCount() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Este alumno ya cuenta con una solicitud de inscripción para este examen.']);
        exit;
    }

    $sqlCupo = "SELECT cupo FROM examen WHERE id_examen = :id_examen AND estado = 'Abierto'";
    $stmtCupo = $conexion->prepare($sqlCupo);
    $stmtCupo->execute([':id_examen' => $id_examen]);
    $examenInfo = $stmtCupo->fetch(PDO::FETCH_ASSOC);

    if (!$examenInfo || $examenInfo['cupo'] <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'El examen seleccionado está cerrado o ya no tiene cupo disponible.']);
        exit;
    }

    $conexion->beginTransaction();

    $sqlInsert = "INSERT INTO inscripcion_examen (estado_pago, id_alumno, id_examen) VALUES ('Pendiente', :id_alumno, :id_examen)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->execute([':id_alumno' => $id_alumno, ':id_examen' => $id_examen]);

    $sqlUpdateCupo = "UPDATE examen SET cupo = cupo - 1 WHERE id_examen = :id_examen";
    $stmtUpdate = $conexion->prepare($sqlUpdateCupo);
    $stmtUpdate->execute([':id_examen' => $id_examen]);

    $conexion->commit();

    echo json_encode(['status' => 'success']);

} catch (PDOException $e) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Fallo en la BD: ' . $e->getMessage()]);
}
$conexion = null;
?>