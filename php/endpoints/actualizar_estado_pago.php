<?php
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';

// Leer los datos que nos manda JavaScript
$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['id_inscripcion']) || empty($input['estado'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos para actualizar.']);
    exit;
}

$id_inscripcion = intval($input['id_inscripcion']);
$estado = trim($input['estado']);

// Medida de seguridad: Validar que el estado sea correcto
if ($estado !== 'Aprobado' && $estado !== 'Rechazado' && $estado !== 'Pendiente') {
    echo json_encode(['status' => 'error', 'message' => 'Estado de pago no válido.']);
    exit;
}

try {
    // Actualizar el estado en la tabla inscripcion_examen
    $sql = "UPDATE inscripcion_examen SET estado_pago = :estado WHERE id_inscripcion = :id";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([
        ':estado' => $estado,
        ':id' => $id_inscripcion
    ]);

    echo json_encode(['status' => 'success']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Fallo en la BD: ' . $e->getMessage()]);
}

$conexion = null;
?>