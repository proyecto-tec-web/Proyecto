<?php
session_start();
require_once '../config/db.php';

$datos = json_decode(file_get_contents("php://input"), true);

if (!$datos || !is_array($datos)) {
    echo json_encode(["status" => "error", "message" => "Datos inválidos."]);
    exit();
}

try {
    $conexion->beginTransaction();

    $stmt = $conexion->prepare("UPDATE inscripcion_examen SET calificacion = ? WHERE id_inscripcion = ?");
    $id_examen_actualizar = null;

    foreach ($datos as $item) {
        $calificacion = ($item['calificacion'] !== '') ? floatval($item['calificacion']) : null;
        $stmt->execute([$calificacion, $item['id_inscripcion']]);

        // Capturamos el id_examen de la primera iteración para cerrarlo al final
        if ($id_examen_actualizar === null) {
            $stmtEx = $conexion->prepare("SELECT id_examen FROM inscripcion_examen WHERE id_inscripcion = ?");
            $stmtEx->execute([$item['id_inscripcion']]);
            $res = $stmtEx->fetch(PDO::FETCH_ASSOC);
            if ($res) {
                $id_examen_actualizar = $res['id_examen'];
            }
        }
    }

    // Si encontramos el examen, le cambiamos el estado a "Calificado"
    if ($id_examen_actualizar !== null) {
        $stmtUpdateExamen = $conexion->prepare("UPDATE examen SET estado = 'Calificado' WHERE id_examen = ?");
        $stmtUpdateExamen->execute([$id_examen_actualizar]);
    }

    $conexion->commit();
    echo json_encode(["status" => "success"]);
} catch (PDOException $e) {
    $conexion->rollBack();
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
