<?php
header('Content-Type: application/json; charset=utf-8');
require_once './../config/db.php';
session_start();

if (!isset($_SESSION['id_usuario']) || (strtolower(trim($_SESSION['usuario_rol'])) !== 'admin' )) {
    echo json_encode(["status" => "error", "message" => "Acceso denegado."]);
    exit();
}
if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(["status" => "error", "message" => "No hay conexión a la base de datos."]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (empty($input['id_inscripcion']) || empty($input['estado'])) {
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos para actualizar.']);
    exit;
}

$id_inscripcion = intval($input['id_inscripcion']);
$estado = trim($input['estado']);

if ($estado !== 'Pagado' && $estado !== 'Rechazado' && $estado !== 'Pendiente') {
    echo json_encode(['status' => 'error', 'message' => 'Estado de pago no válido.']);
    exit;
}

try {
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