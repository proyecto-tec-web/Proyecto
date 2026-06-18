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

    // 1. Obtenemos el id_inscripcion para usarlo más adelante
    $stmtGetInscripcion = $conexion->prepare("SELECT id_inscripcion FROM peticion_revision WHERE id_peticion = ?");
    $stmtGetInscripcion->execute([$datos['id_peticion']]);
    $rowInscripcion = $stmtGetInscripcion->fetch(PDO::FETCH_ASSOC);
    
    if (!$rowInscripcion) {
        throw new Exception("No se encontró la petición de revisión.");
    }
    $id_inscripcion = $rowInscripcion['id_inscripcion'];

    // 2. Guardamos las notas y cambiamos estado a Completada
    $sqlRev = "UPDATE peticion_revision SET notas_profesor = ?, estado = 'Completada', fecha_revision = CURRENT_TIMESTAMP WHERE id_peticion = ?";
    $stmtRev = $conexion->prepare($sqlRev);
    $stmtRev->execute([$datos['notas'], $datos['id_peticion']]);

    // 3. Modificamos la calificación en el acta del examen (inscripcion_examen)
    $sqlCalif = "UPDATE inscripcion_examen SET calificacion = ? WHERE id_inscripcion = ?";
    $stmtCalif = $conexion->prepare($sqlCalif);
    $stmtCalif->execute([$datos['calificacion_nueva'], $id_inscripcion]);

    // ==========================================
    // 4. NUEVO: IMPACTAR EL KARDEX DEL ALUMNO
    // ==========================================
    $stmtInfo = $conexion->prepare("
        SELECT ie.id_alumno, e.id_materia 
        FROM inscripcion_examen ie
        INNER JOIN examen e ON ie.id_examen = e.id_examen
        WHERE ie.id_inscripcion = ?
    ");
    $stmtInfo->execute([$id_inscripcion]);
    $info = $stmtInfo->fetch(PDO::FETCH_ASSOC);

    if ($info) {
        // Buscamos si el alumno ya tiene esa materia en su Kardex
        $stmtCheckKardex = $conexion->prepare("SELECT id_kardex FROM kardex WHERE id_alumno = ? AND id_materia = ?");
        $stmtCheckKardex->execute([$info['id_alumno'], $info['id_materia']]);
        $kardexExistente = $stmtCheckKardex->fetch(PDO::FETCH_ASSOC);

        if ($kardexExistente) {
            // Si ya existe en el kardex, actualizamos la calificación
            $stmtUpdateKardex = $conexion->prepare("UPDATE kardex SET calificacion = ? WHERE id_kardex = ?");
            $stmtUpdateKardex->execute([$datos['calificacion_nueva'], $kardexExistente['id_kardex']]);
        } else {
            // Si por alguna razón no existía, la insertamos
            $stmtInsertKardex = $conexion->prepare("INSERT INTO kardex (id_alumno, id_materia, calificacion) VALUES (?, ?, ?)");
            $stmtInsertKardex->execute([$info['id_alumno'], $info['id_materia'], $datos['calificacion_nueva']]);
        }
    }

    $conexion->commit();
    echo json_encode(["status" => "success", "message" => "Calificación modificada exitosamente en el Acta y el Kardex."]);

} catch (Exception $e) {
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => "Error al ejecutar revisión: " . $e->getMessage()]);
}

$conexion = null;
?>
