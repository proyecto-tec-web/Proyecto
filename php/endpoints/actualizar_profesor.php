<?php
session_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

if (!isset($conexion) || !($conexion instanceof PDO)) {
    echo json_encode(['status' => 'error', 'message' => 'No hay conexión a la base de datos.']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['boleta_actual']) || empty($data['boleta_nueva']) || empty($data['nombre']) || empty($data['paterno']) || empty($data['materno'])) {
    echo json_encode(['status' => 'error', 'message' => 'Todos los campos son obligatorios.']);
    exit;
}

try {
    $sql = "UPDATE profesor SET boleta = ?, nombre = ?, apellido_paterno = ?, apellido_materno = ? WHERE boleta = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->execute([
        $data['boleta_nueva'],
        $data['nombre'],
        $data['paterno'],
        $data['materno'],
        $data['boleta_actual']
    ]);
    
    echo json_encode(['status' => 'success', 'message' => 'Datos del profesor actualizados correctamente.']);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(['status' => 'error', 'message' => 'Error: La nueva boleta ya está registrada a otro profesor.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Error de base de datos: ' . $e->getMessage()]);
    }
}
$conexion = null;
?>