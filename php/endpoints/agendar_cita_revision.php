<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'profesor') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

$datos = json_decode(file_get_contents("php://input"), true);

// JavaScript sigue mandando los datos como "fecha_cita" y "lugar_cita"
if (!isset($datos['id_peticion'], $datos['fecha_cita'], $datos['lugar_cita'])) {
    echo json_encode(["status" => "error", "message" => "Faltan datos para agendar la cita."]);
    exit();
}

try {
    // Inyectamos en las columnas reales: fecha_revision_agendada y lugar_revision
    $sql = "UPDATE peticion_revision SET fecha_revision_agendada = ?, lugar_revision = ?, estado = 'Agendada' WHERE id_peticion = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$datos['fecha_cita'], $datos['lugar_cita'], $datos['id_peticion']]);

    echo json_encode(["status" => "success", "message" => "Cita agendada correctamente."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al agendar cita: " . $e->getMessage()]);
}
?>
