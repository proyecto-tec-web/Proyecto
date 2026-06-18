<?php
session_start();
header('Content-Type: application/json'); // Obligamos a que la respuesta sea JSON

require_once '../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(['status' => 'error', 'message' => 'No hay conexión a la base de datos.']);
    exit;
}

// Validamos ambas opciones de variable de sesión por si acaso
$rol_usuario = $_SESSION['usuario_rol'] ?? $_SESSION['rol'] ?? '';

if (!isset($_SESSION['id_usuario']) || strtolower(trim($rol_usuario)) !== 'admin') {
    echo json_encode(["status" => "error", "message" => "Acceso no autorizado."]);
    exit();
}

$datos = json_decode(file_get_contents("php://input"), true);

// Si los datos no llegan o están mal formados, avisamos
if (!$datos) {
    echo json_encode(["status" => "error", "message" => "No se recibieron datos válidos."]);
    exit();
}

try {
    $sql = "UPDATE alumno SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, boleta = ?, id_carrera = ? WHERE id_alumno = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([
        $datos['nombre'], $datos['paterno'], $datos['materno'], 
        $datos['boleta'], $datos['carrera'], $datos['id']
    ]);
    
    echo json_encode(["status" => "success", "message" => "Alumno actualizado correctamente."]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => "Error de base de datos: " . $e->getMessage()]);
}

$conexion = null;
?>
