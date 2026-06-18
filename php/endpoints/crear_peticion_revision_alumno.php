<?php
session_start();
require_once '../config/db.php';

if (!isset($_SESSION['id_usuario']) || strtolower(trim($_SESSION['usuario_rol'])) !== 'alumno') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

$datos = json_decode(file_get_contents("php://input"), true);

if (!isset($datos['id_inscripcion']) || empty(trim($datos['motivo']))) {
    echo json_encode(["status" => "error", "message" => "Información incompleta para registrar la solicitud."]);
    exit();
}

try {
    $sql = "INSERT INTO peticion_revision (id_inscripcion, motivo_alumno, estado) VALUES (?, ?, 'Pendiente')";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([$datos['id_inscripcion'], trim($datos['motivo'])]);

    echo json_encode(["status" => "success", "message" => "Tu solicitud de revisión ha sido enviada exitosamente."]);

} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error al insertar la petición: " . $e->getMessage()]);
}
$conexion = null;
?>
