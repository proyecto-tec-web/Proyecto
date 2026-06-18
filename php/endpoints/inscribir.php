<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
header('Content-Type: application/json; charset=utf-8');
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo json_encode(['status' => 'error', 'message' => 'Sesión no válida. Inicia sesión como alumno.']);
    exit;
}

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['id_examen'])) {
    echo json_encode(['status' => 'error', 'message' => 'No se recibió el examen a inscribir.']);
    exit;
}

$id_examen = intval($input['id_examen']);

try {
    $sqlAlumno = "SELECT id_alumno, situacion_academica FROM alumno WHERE id_usuario = :id_usuario";
    $stmtAlumno = $conexion->prepare($sqlAlumno);
    $stmtAlumno->execute([':id_usuario' => $_SESSION['id_usuario']]);
    $alumno = $stmtAlumno->fetch(PDO::FETCH_ASSOC);

    if (!$alumno) {
        echo json_encode(['status' => 'error', 'message' => 'Tu usuario no tiene un perfil de alumno asociado.']);
        exit;
    }

    $id_alumno = $alumno['id_alumno'];

    if (strtolower(trim($alumno['situacion_academica'])) !== 'irregular') {
        echo json_encode(['status' => 'error', 'message' => 'Inscripción denegada. Tu situación académica es "Regular". Solo los alumnos irregulares pueden presentar ETS.']);
        exit;
    }

    $sqlKardex = "SELECT k.calificacion
                  FROM kardex k
                  JOIN examen e ON k.id_materia = e.id_materia
                  WHERE k.id_alumno = :id_alumno AND e.id_examen = :id_examen";
    $stmtKardex = $conexion->prepare($sqlKardex);
    $stmtKardex->execute([':id_alumno' => $id_alumno, ':id_examen' => $id_examen]);
    $resultadoKardex = $stmtKardex->fetch(PDO::FETCH_ASSOC);

    if (!$resultadoKardex) {
        echo json_encode(['status' => 'error', 'message' => 'No tienes cursada esta materia en tu kardex. No tienes derecho a ETS.']);
        exit;
    }

    if (floatval($resultadoKardex['calificacion']) >= 6.0) {
        echo json_encode(['status' => 'error', 'message' => 'Ya tienes esta materia aprobada con ' . $resultadoKardex['calificacion'] . '. No es necesario presentar ETS.']);
        exit;
    }

    $sqlValidar = "SELECT id_inscripcion FROM inscripcion_examen WHERE id_alumno = :id_alumno AND id_examen = :id_examen";
    $stmtValidar = $conexion->prepare($sqlValidar);
    $stmtValidar->execute([':id_alumno' => $id_alumno, ':id_examen' => $id_examen]);

    if ($stmtValidar->rowCount() > 0) {
        echo json_encode(['status' => 'error', 'message' => 'Ya cuentas con una solicitud de inscripción para este examen.']);
        exit;
    }

    $sqlCupo = "SELECT cupo FROM examen WHERE id_examen = :id_examen AND estado = 'Abierto'";
    $stmtCupo = $conexion->prepare($sqlCupo);
    $stmtCupo->execute([':id_examen' => $id_examen]);
    $examenInfo = $stmtCupo->fetch(PDO::FETCH_ASSOC);

    if (!$examenInfo || $examenInfo['cupo'] <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'El examen está cerrado o ya no tiene cupo disponible.']);
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

    echo json_encode(['status' => 'success', 'message' => 'Inscripción registrada. Recuerda subir tu comprobante de pago para validar tu lugar.']);

} catch (PDOException $e) {
    if ($conexion->inTransaction()) {
        $conexion->rollBack();
    }
    echo json_encode(['status' => 'error', 'message' => 'Fallo en la BD: ' . $e->getMessage()]);
}
$conexion = null;
?>
